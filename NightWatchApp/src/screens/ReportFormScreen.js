import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { reportService } from '../services/reportService';
import { eventService } from '../services/eventService';
import { photoService } from '../services/photoService';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { COLORS, EVENT_TYPES, EVENT_SEVERITY } from '../constants';
import RNFS from 'react-native-fs';

const ReportFormScreen = ({ navigation }) => {
  const route = useRoute();
  const { reportId } = route.params || {};
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    siteId: '',
    date: new Date().toISOString(),
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    watcherNotes: '',
    weatherConditions: '',
  });
  const [events, setEvents] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [sites, setSites] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    type: EVENT_TYPES.OBSERVATION,
    severity: EVENT_SEVERITY.LOW,
    description: '',
    location: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (reportId) {
      loadReport(reportId);
    }
    loadSites();
  }, [reportId]);

  const loadReport = async (id) => {
    try {
      setLoading(true);
      const report = await reportService.getReportById(id);
      setFormData({
        siteId: report.siteId?.toString() || '',
        date: report.date,
        startTime: report.startTime,
        endTime: report.endTime,
        watcherNotes: report.watcherNotes || '',
        weatherConditions: report.weatherConditions || '',
      });
      setEvents(report.events || []);
      setPhotos(report.photos || []);
    } catch (error) {
      console.error('Error loading report:', error);
      Alert.alert('Error', 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const loadSites = async () => {
    try {
      // Load sites from API or use mock data
      const mockSites = [
        { id: 1, name: 'Site A - Main Building' },
        { id: 2, name: 'Site B - Warehouse' },
        { id: 3, name: 'Site C - Parking' },
      ];
      setSites(mockSites);
    } catch (error) {
      console.error('Error loading sites:', error);
    }
  };

  const handleSave = async (validate = false) => {
    const newErrors = {};
    
    if (!formData.siteId) {
      newErrors.siteId = 'Site is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      const reportData = {
        ...formData,
        siteId: parseInt(formData.siteId),
      };

      if (reportId) {
        await reportService.updateReport(reportId, reportData);
      } else {
        const result = await reportService.createReport(reportData);
        reportId = result.id;
      }

      if (validate) {
        await reportService.validateReport(reportId);
        Alert.alert('Success', 'Report validated successfully');
      } else {
        Alert.alert('Success', 'Report saved successfully');
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving report:', error);
      Alert.alert('Error', 'Failed to save report');
    } finally {
      setSaving(false);
    }
  };

  const handleAddEvent = () => {
    if (!eventForm.description) {
      Alert.alert('Error', 'Description is required');
      return;
    }

    const eventData = {
      ...eventForm,
      reportId: reportId || null,
    };

    if (editingEvent) {
      setEvents(events.map(e => e.id === editingEvent.id ? { ...eventData, id: editingEvent.id } : e));
      setEditingEvent(null);
    } else {
      setEvents([...events, { ...eventData, id: Date.now() }]);
    }

    setEventForm({
      type: EVENT_TYPES.OBSERVATION,
      severity: EVENT_SEVERITY.LOW,
      description: '',
      location: '',
    });
    setShowEventModal(false);
  };

  const handleDeleteEvent = (eventId) => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          setEvents(events.filter(e => e.id !== eventId));
        }}
      ]
    );
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setEventForm(event);
    setShowEventModal(true);
  };

  const handleAddPhoto = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
    });

    if (!result.didCancel && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      setPhotos([...photos, {
        uri: asset.uri,
        type: asset.type,
        fileName: asset.fileName,
      }]);
    }
  };

  const handleTakePhoto = async () => {
    const result = await launchCamera({
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
    });

    if (!result.didCancel && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      setPhotos([...photos, {
        uri: asset.uri,
        type: asset.type,
        fileName: asset.fileName,
      }]);
    }
  };

  const handleDeletePhoto = (index) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          setPhotos(photos.filter((_, i) => i !== index));
        }}
      ]
    );
  };

  const renderEventItem = (event) => (
    <Card key={event.id} style={styles.eventItem}>
      <View style={styles.eventHeader}>
        <View style={[
          styles.eventTypeBadge,
          { backgroundColor: event.type === EVENT_TYPES.INCIDENT ? COLORS.ERROR + '20' : COLORS.SUCCESS + '20' }
        ]}>
          <Text style={[
            styles.eventTypeText,
            { color: event.type === EVENT_TYPES.INCIDENT ? COLORS.ERROR : COLORS.SUCCESS }
          ]}>
            {event.type}
          </Text>
        </View>
        <View style={styles.eventActions}>
          <TouchableOpacity onPress={() => handleEditEvent(event)} style={styles.iconButton}>
            <Icon name="edit" size={20} color={COLORS.SECONDARY} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteEvent(event.id)} style={styles.iconButton}>
            <Icon name="delete" size={20} color={COLORS.ERROR} />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.eventDescription}>{event.description}</Text>
      {event.location && (
        <View style={styles.eventLocation}>
          <Icon name="place" size={14} color={COLORS.TEXT_SECONDARY} />
          <Text style={styles.locationText}>{event.location}</Text>
        </View>
      )}
    </Card>
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Report Information</Text>
        
        <Input
          label="Site"
          value={formData.siteId}
          onChangeText={(text) => setFormData({ ...formData, siteId: text })}
          placeholder="Select site"
          error={errors.siteId}
        />

        <Input
          label="Date"
          value={formData.date.split('T')[0]}
          onChangeText={(text) => setFormData({ ...formData, date: text })}
          placeholder="YYYY-MM-DD"
        />

        <Input
          label="Start Time"
          value={formData.startTime.split('T')[1]?.substring(0, 5) || ''}
          onChangeText={(text) => setFormData({ ...formData, startTime: `${formData.date}T${text}:00` })}
          placeholder="HH:MM"
        />

        <Input
          label="End Time"
          value={formData.endTime.split('T')[1]?.substring(0, 5) || ''}
          onChangeText={(text) => setFormData({ ...formData, endTime: `${formData.date}T${text}:00` })}
          placeholder="HH:MM"
        />

        <Input
          label="Weather Conditions"
          value={formData.weatherConditions}
          onChangeText={(text) => setFormData({ ...formData, weatherConditions: text })}
          placeholder="e.g., Clear, Rain, Windy"
        />
      </Card>

      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.sectionTitle}>Notes</Text>
        </View>
        <Input
          value={formData.watcherNotes}
          onChangeText={(text) => setFormData({ ...formData, watcherNotes: text })}
          placeholder="Add your observations and notes here..."
          multiline
          numberOfLines={4}
        />
      </Card>

      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.sectionTitle}>Events</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setEditingEvent(null);
              setEventForm({
                type: EVENT_TYPES.OBSERVATION,
                severity: EVENT_SEVERITY.LOW,
                description: '',
                location: '',
              });
              setShowEventModal(true);
            }}
          >
            <Icon name="add" size={20} color={COLORS.PRIMARY} />
            <Text style={styles.addButtonText}>Add Event</Text>
          </TouchableOpacity>
        </View>
        {events.length > 0 ? (
          events.map(renderEventItem)
        ) : (
          <Text style={styles.emptyText}>No events added yet</Text>
        )}
      </Card>

      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <View style={styles.photoButtons}>
            <TouchableOpacity
              style={styles.photoButton}
              onPress={handleTakePhoto}
            >
              <Icon name="camera-alt" size={20} color={COLORS.PRIMARY} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.photoButton}
              onPress={handleAddPhoto}
            >
              <Icon name="photo-library" size={20} color={COLORS.PRIMARY} />
            </TouchableOpacity>
          </View>
        </View>
        {photos.length > 0 ? (
          <View style={styles.photosGrid}>
            {photos.map((photo, index) => (
              <View key={index} style={styles.photoItem}>
                <Text style={styles.photoFileName} numberOfLines={1}>
                  {photo.fileName || `Photo ${index + 1}`}
                </Text>
                <TouchableOpacity
                  onPress={() => handleDeletePhoto(index)}
                  style={styles.deletePhotoButton}
                >
                  <Icon name="close" size={20} color={COLORS.ERROR} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No photos added yet</Text>
        )}
      </Card>

      <View style={styles.actions}>
        <Button
          title="Save Draft"
          onPress={() => handleSave(false)}
          loading={saving}
          style={styles.actionButton}
        />
        <Button
          title="Validate Report"
          onPress={() => handleSave(true)}
          loading={saving}
          variant="success"
          style={styles.actionButton}
        />
      </View>

      <Modal
        visible={showEventModal}
        onClose={() => setShowEventModal(false)}
        title={editingEvent ? 'Edit Event' : 'Add Event'}
      >
        <Input
          label="Type"
          value={eventForm.type}
          onChangeText={(text) => setEventForm({ ...eventForm, type: text })}
        />
        <Input
          label="Severity"
          value={eventForm.severity}
          onChangeText={(text) => setEventForm({ ...eventForm, severity: text })}
        />
        <Input
          label="Description"
          value={eventForm.description}
          onChangeText={(text) => setEventForm({ ...eventForm, description: text })}
          multiline
          numberOfLines={3}
        />
        <Input
          label="Location"
          value={eventForm.location}
          onChangeText={(text) => setEventForm({ ...eventForm, location: text })}
        />
        <Button
          title={editingEvent ? 'Update' : 'Add'}
          onPress={handleAddEvent}
          style={styles.modalButton}
        />
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  card: {
    margin: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    color: COLORS.PRIMARY,
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  eventItem: {
    marginBottom: 12,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventTypeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  eventActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: COLORS.TEXT,
    marginBottom: 4,
  },
  eventLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.TEXT_SECONDARY,
    padding: 20,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  photoButton: {
    padding: 8,
    backgroundColor: COLORS.PRIMARY + '10',
    borderRadius: 8,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoItem: {
    width: '48%',
    position: 'relative',
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 8,
    padding: 8,
  },
  photoFileName: {
    fontSize: 12,
    color: COLORS.TEXT,
    marginBottom: 4,
  },
  deletePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
  },
  modalButton: {
    marginTop: 16,
  },
});

export default ReportFormScreen;