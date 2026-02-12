import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Share,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { reportService } from '../services/reportService';
import Card from '../components/Card';
import Button from '../components/Button';
import Loading from '../components/Loading';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, EVENT_TYPES } from '../constants';

const ReportViewScreen = ({ navigation }) => {
  const route = useRoute();
  const { reportId } = route.params;
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [emailing, setEmailing] = useState(false);

  useEffect(() => {
    loadReport();
  }, [reportId]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const data = await reportService.getReportById(reportId);
      setReport(data);
    } catch (error) {
      console.error('Error loading report:', error);
      Alert.alert('Error', 'Failed to load report');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      const pdfBlob = await reportService.generatePDF(reportId);
      Alert.alert('Success', 'PDF downloaded successfully');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      Alert.alert('Error', 'Failed to download PDF');
    } finally {
      setDownloading(false);
    }
  };

  const handleSendEmail = async () => {
    try {
      setEmailing(true);
      await reportService.sendEmail(reportId);
      Alert.alert('Success', 'Report sent via email');
    } catch (error) {
      console.error('Error sending email:', error);
      Alert.alert('Error', 'Failed to send email');
    } finally {
      setEmailing(false);
    }
  };

  const handleShare = async () => {
    try {
      const message = `Night Watch Report - ${report.site?.name}\nDate: ${new Date(report.date).toLocaleDateString('fr-FR')}\nWatcher: ${report.watcher?.firstName} ${report.watcher?.lastName}`;
      await Share.share({ message });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!report) {
    return null;
  }

  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <Icon name={icon} size={20} color={COLORS.TEXT_SECONDARY} style={styles.infoIcon} />
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.headerCard}>
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: report.validated ? COLORS.SUCCESS + '20' : COLORS.WARNING + '20' }
          ]}>
            <Icon
              name={report.validated ? 'check-circle' : 'edit'}
              size={24}
              color={report.validated ? COLORS.SUCCESS : COLORS.WARNING}
            />
            <Text style={[
              styles.statusText,
              { color: report.validated ? COLORS.SUCCESS : COLORS.WARNING }
            ]}>
              {report.validated ? 'Validated' : 'Draft'}
            </Text>
          </View>
        </View>
        <Text style={styles.siteName}>{report.site?.name || 'Unknown Site'}</Text>
        <Text style={styles.reportDate}>
          {new Date(report.date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Report Details</Text>
        <InfoRow
          icon="person"
          label="Watcher"
          value={`${report.watcher?.firstName} ${report.watcher?.lastName}`}
        />
        <InfoRow
          icon="schedule"
          label="Start Time"
          value={new Date(report.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        />
        <InfoRow
          icon="access-time"
          label="End Time"
          value={new Date(report.endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        />
        <InfoRow
          icon="wb-sunny"
          label="Weather"
          value={report.weatherConditions || 'Not specified'}
        />
      </Card>

      {report.watcherNotes && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Watcher Notes</Text>
          <Text style={styles.notesText}>{report.watcherNotes}</Text>
        </Card>
      )}

      {report.events && report.events.length > 0 && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Events ({report.events.length})</Text>
          {report.events.map((event, index) => (
            <View key={event.id || index} style={styles.eventItem}>
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
                {event.location && (
                  <View style={styles.eventLocation}>
                    <Icon name="place" size={14} color={COLORS.TEXT_SECONDARY} />
                    <Text style={styles.locationText}>{event.location}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.eventDescription}>{event.description}</Text>
            </View>
          ))}
        </Card>
      )}

      {report.photos && report.photos.length > 0 && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Photos ({report.photos.length})</Text>
          <View style={styles.photosGrid}>
            {report.photos.map((photo, index) => (
              <View key={photo.id || index} style={styles.photoItem}>
                <Text style={styles.photoText}>{photo.filename || `Photo ${index + 1}`}</Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      <Card style={styles.actionsCard}>
        <Text style={styles.sectionTitle}>Actions</Text>
        <View style={styles.actionsContainer}>
          <Button
            title="Download PDF"
            onPress={handleDownloadPDF}
            loading={downloading}
            icon={<Icon name="picture-as-pdf" size={20} color={COLORS.WHITE} />}
            style={styles.actionButton}
          />
          <Button
            title="Send Email"
            onPress={handleSendEmail}
            loading={emailing}
            variant="secondary"
            icon={<Icon name="email" size={20} color={COLORS.WHITE} />}
            style={styles.actionButton}
          />
          <Button
            title="Share"
            onPress={handleShare}
            variant="outline"
            icon={<Icon name="share" size={20} color={COLORS.PRIMARY} />}
            style={styles.actionButton}
          />
        </View>
      </Card>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Created: {new Date(report.createdAt).toLocaleString('fr-FR')}
        </Text>
        {report.updatedAt !== report.createdAt && (
          <Text style={styles.footerText}>
            Updated: {new Date(report.updatedAt).toLocaleString('fr-FR')}
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  headerCard: {
    margin: 12,
    alignItems: 'center',
  },
  statusContainer: {
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  siteName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    textAlign: 'center',
    marginBottom: 8,
  },
  reportDate: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    width: 24,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT,
    flex: 2,
  },
  notesText: {
    fontSize: 15,
    color: COLORS.TEXT,
    lineHeight: 22,
  },
  eventItem: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 8,
    padding: 12,
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
  eventLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: COLORS.TEXT,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoItem: {
    width: '48%',
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  photoText: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  actionsCard: {
    margin: 12,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 4,
  },
});

export default ReportViewScreen;