import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { 
  Send, 
  Users, 
  MessageSquare, 
  Search,
  MoreVertical,
  Check,
  CheckCheck
} from 'lucide-react'
import axios from 'axios'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'

const Chat = () => {
  const { user } = useAuth()
  const [conversations, setConversations] = useState({ direct: [], groups: [] })
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    fetchConversations()
    initSocket()

    return () => {
      if (socket) socket.disconnect()
    }
  }, [])

  const initSocket = () => {
    const socketInstance = io('http://localhost:5000', {
      auth: { userId: user.id }
    })

    socketInstance.on('connect', () => {
      socketInstance.emit('user_connected', user.id)
    })

    socketInstance.on('new_message', (data) => {
      if (activeChat && activeChat.user_id === data.sender_id) {
        setMessages(prev => [...prev, data])
      }
    })

    socketInstance.on('new_group_message', (data) => {
      if (activeChat && activeChat.id === data.group_id) {
        setMessages(prev => [...prev, data])
      }
    })

    setSocket(socketInstance)
  }

  const fetchConversations = async () => {
    try {
      const res = await axios.get('/api/chat/conversations')
      setConversations(res.data)
    } catch (error) {
      toast.error('Erreur lors du chargement des conversations')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (type, id) => {
    try {
      let res
      if (type === 'direct') {
        res = await axios.get(`/api/chat/messages/${id}`)
      } else {
        res = await axios.get(`/api/chat/group/${id}/messages`)
      }
      setMessages(res.data)
    } catch (error) {
      toast.error('Erreur lors du chargement des messages')
    }
  }

  const handleSelectChat = (type, chat) => {
    setActiveChat({ type, ...chat })
    fetchMessages(type, type === 'direct' ? chat.user_id : chat.id)
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeChat || !socket) return

    const messageData = {
      sender_id: user.id,
      message: newMessage
    }

    if (activeChat.type === 'direct') {
      messageData.receiver_id = activeChat.user_id
      socket.emit('send_message', messageData)
    } else {
      messageData.group_id = activeChat.id
      socket.emit('send_group_message', messageData)
    }

    setMessages(prev => [...prev, {
      ...messageData,
      sender_id: user.id,
      sent_at: new Date()
    }])

    setNewMessage('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  const isOwnMessage = (message) => message.sender_id === user.id

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="p-8 h-[calc(100vh-64px)]">
        <div className="card h-full flex overflow-hidden">
          {/* Sidebar - Conversations List */}
          <div className="w-80 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Direct Messages */}
              {conversations.direct.length > 0 && (
                <div className="p-2">
                  <div className="text-xs font-semibold text-gray-500 px-3 py-2">
                    Messages directs
                  </div>
                  {conversations.direct.map((chat) => (
                    <button
                      key={chat.user_id}
                      onClick={() => handleSelectChat('direct', chat)}
                      className={`w-full flex items-center px-3 py-3 rounded-lg transition-colors ${
                        activeChat?.type === 'direct' && activeChat?.user_id === chat.user_id
                          ? 'bg-primary-50'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="w-10 h-10 bg-primary-200 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-semibold text-primary-700">
                          {chat.first_name[0]}{chat.last_name[0]}
                        </span>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900 text-sm">
                          {chat.first_name} {chat.last_name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {formatTime(chat.last_message_time)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Group Messages */}
              {conversations.groups.length > 0 && (
                <div className="p-2 border-t border-gray-200">
                  <div className="text-xs font-semibold text-gray-500 px-3 py-2">
                    Groupes
                  </div>
                  {conversations.groups.map((group) => (
                    <button
                      key={group.id}
                      onClick={() => handleSelectChat('group', group)}
                      className={`w-full flex items-center px-3 py-3 rounded-lg transition-colors ${
                        activeChat?.type === 'group' && activeChat?.id === group.id
                          ? 'bg-primary-50'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center mr-3">
                        <Users className="w-5 h-5 text-blue-700" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900 text-sm">{group.name}</p>
                        {group.description && (
                          <p className="text-xs text-gray-500 truncate">
                            {group.description}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {!activeChat ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Sélectionnez une conversation pour commencer</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {activeChat.type === 'direct'
                        ? `${activeChat.first_name} ${activeChat.last_name}`
                        : activeChat.name
                      }
                    </h3>
                    <p className="text-sm text-gray-500">
                      {activeChat.type === 'direct' ? 'Message privé' : 'Groupe'}
                    </p>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${isOwnMessage(message) ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${
                        isOwnMessage(message)
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      } rounded-lg px-4 py-2`}>
                        {activeChat.type === 'group' && !isOwnMessage(message) && (
                          <p className="text-xs font-medium mb-1 opacity-75">
                            {message.sender_first_name} {message.sender_last_name}
                          </p>
                        )}
                        <p className="text-sm">{message.message}</p>
                        <div className={`flex items-center justify-end mt-1 text-xs ${
                          isOwnMessage(message) ? 'text-primary-200' : 'text-gray-500'
                        }`}>
                          <span className="mr-1">{formatTime(message.sent_at)}</span>
                          {isOwnMessage(message) && (
                            message.is_read ? (
                              <CheckCheck className="w-3 h-3" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Écrivez votre message..."
                      className="flex-1 input-field"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="p-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Chat