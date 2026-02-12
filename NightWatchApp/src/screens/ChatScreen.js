import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { chatService, socketService } from '../services/chatService';
import Card from '../components/Card';
import Loading from '../components/Loading';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../constants';

const ChatScreen = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef(null);

  useEffect(() => {
    loadConversations();
    
    // Setup socket connection
    if (user?.token) {
      socketService.connect(user.token);
      
      socketService.on('new_message', handleNewMessage);
      socketService.on('message_read', handleMessageRead);
      socketService.on('typing', handleTyping);
    }

    return () => {
      socketService.off('new_message', handleNewMessage);
      socketService.off('message_read', handleMessageRead);
      socketService.off('typing', handleTyping);
      socketService.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      const data = await chatService.getConversations();
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const data = await chatService.getMessages(conversationId);
      setMessages(data || []);
      scrollToBottom();
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleNewMessage = (data) => {
    if (selectedConversation && data.conversationId === selectedConversation.id) {
      setMessages(prev => [...prev, data.message]);
      scrollToBottom();
    }
    loadConversations();
  };

  const handleMessageRead = (data) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === data.messageId ? { ...msg, read: true } : msg
      )
    );
  };

  const handleTyping = (data) => {
    // Handle typing indicator if needed
  };

  const scrollToBottom = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    const messageData = {
      conversationId: selectedConversation.id,
      content: messageText.trim(),
    };

    socketService.sendMessage(messageData);
    setMessageText('');
  };

  const handleCreateConversation = async () => {
    Alert.alert(
      'Create Conversation',
      'Select users to start a conversation',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Create', onPress: () => {
          // Implement user selection UI
        }}
      ]
    );
  };

  const renderConversationItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.conversationItem,
        selectedConversation?.id === item.id && styles.conversationItemSelected
      ]}
      onPress={() => setSelectedConversation(item)}
    >
      <View style={styles.conversationAvatar}>
        <Text style={styles.avatarText}>
          {item.name?.charAt(0).toUpperCase() || '?'}
        </Text>
      </View>
      <View style={styles.conversationInfo}>
        <View style={styles.conversationHeader}>
          <Text style={styles.conversationName}>{item.name}</Text>
          {item.lastMessage && (
            <Text style={styles.messageTime}>
              {new Date(item.lastMessage.createdAt).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          )}
        </View>
        {item.lastMessage && (
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage.content}
          </Text>
        )}
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unreadCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderMessageItem = ({ item }) => {
    const isOwn = item.senderId === user.id;
    return (
      <View style={[
        styles.messageItem,
        isOwn ? styles.messageItemOwn : styles.messageItemOther
      ]}>
        <View style={[
          styles.messageBubble,
          isOwn ? styles.messageBubbleOwn : styles.messageBubbleOther
        ]}>
          <Text style={[
            styles.messageText,
            isOwn ? styles.messageTextOwn : styles.messageTextOther
          ]}>
            {item.content}
          </Text>
          <Text style={[
            styles.messageTime,
            isOwn ? styles.messageTimeOwn : styles.messageTimeOther
          ]}>
            {new Date(item.createdAt).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
            {item.read && ' ✓'}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      {!selectedConversation ? (
        <View style={styles.conversationsContainer}>
          <Card style={styles.headerCard}>
            <Text style={styles.headerTitle}>Messages</Text>
          </Card>
          <FlatList
            data={conversations}
            renderItem={renderConversationItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.conversationsList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="chat" size={64} color={COLORS.TEXT_SECONDARY} />
                <Text style={styles.emptyText}>No conversations yet</Text>
              </View>
            }
          />
          <TouchableOpacity
            style={styles.fab}
            onPress={handleCreateConversation}
          >
            <Icon name="add" size={24} color={COLORS.WHITE} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.chatContainer}>
          <Card style={styles.chatHeader}>
            <TouchableOpacity onPress={() => setSelectedConversation(null)}>
              <Icon name="arrow-back" size={24} color={COLORS.PRIMARY} />
            </TouchableOpacity>
            <Text style={styles.chatTitle}>{selectedConversation.name}</Text>
            <View style={styles.headerRight} />
          </Card>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessageItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.messagesList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No messages yet</Text>
              </View>
            }
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          >
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.messageInput}
                placeholder="Type a message..."
                value={messageText}
                onChangeText={setMessageText}
                multiline
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !messageText.trim() && styles.sendButtonDisabled
                ]}
                onPress={handleSendMessage}
                disabled={!messageText.trim()}
              >
                <Icon name="send" size={24} color={COLORS.WHITE} />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  conversationsContainer: {
    flex: 1,
  },
  headerCard: {
    margin: 12,
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.TEXT,
  },
  conversationsList: {
    padding: 12,
  },
  conversationItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.SURFACE,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  conversationItemSelected: {
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
  },
  conversationAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT,
    flex: 1,
  },
  messageTime: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
  lastMessage: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  unreadBadge: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  chatContainer: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT,
    marginLeft: 12,
    flex: 1,
  },
  headerRight: {
    width: 24,
  },
  messagesList: {
    padding: 12,
  },
  messageItem: {
    marginBottom: 8,
  },
  messageItemOwn: {
    alignItems: 'flex-end',
  },
  messageItemOther: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  messageBubbleOwn: {
    backgroundColor: COLORS.PRIMARY,
    borderBottomRightRadius: 4,
  },
  messageBubbleOther: {
    backgroundColor: COLORS.SURFACE,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    marginBottom: 4,
  },
  messageTextOwn: {
    color: COLORS.WHITE,
  },
  messageTextOther: {
    color: COLORS.TEXT,
  },
  messageTime: {
    fontSize: 11,
  },
  messageTimeOwn: {
    color: COLORS.WHITE + 'CC',
  },
  messageTimeOther: {
    color: COLORS.TEXT_SECONDARY,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: COLORS.SURFACE,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: COLORS.BACKGROUND,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 16,
  },
});

export default ChatScreen;