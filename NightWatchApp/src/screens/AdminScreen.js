import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { adminService } from '../services/adminService';
import Card from '../components/Card';
import Loading from '../components/Loading';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, USER_ROLES } from '../constants';

const AdminScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [sites, setSites] = useState([]);
  const [clients, setClients] = useState([]);
  const [emailRecipients, setEmailRecipients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, [activeTab]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      switch (activeTab) {
        case 'overview':
          const statistics = await adminService.getStatistics();
          setStats(statistics);
          break;
        case 'users':
          const userData = await adminService.getAllUsers();
          setUsers(userData || []);
          break;
        case 'sites':
          const siteData = await adminService.getAllSites();
          setSites(siteData || []);
          break;
        case 'clients':
          const clientData = await adminService.getAllClients();
          setClients(clientData || []);
          break;
        case 'emails':
          const emailData = await adminService.getAllEmailRecipients();
          setEmailRecipients(emailData || []);
          break;
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'users', label: 'Users', icon: 'people' },
    { id: 'sites', label: 'Sites', icon: 'location-on' },
    { id: 'clients', label: 'Clients', icon: 'business' },
    { id: 'emails', label: 'Emails', icon: 'email' },
  ];

  const StatCard = ({ icon, title, value, color }) => (
    <Card style={styles.statCard}>
      <View style={styles.statIconContainer} style={{ backgroundColor: color + '20' }}>
        <Icon name={icon} size={32} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </Card>
  );

  const renderItem = (item, type) => (
    <Card key={item.id} style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemName}>{item.name || item.firstName + ' ' + item.lastName || item.email}</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="more-vert" size={24} color={COLORS.TEXT_SECONDARY} />
        </TouchableOpacity>
      </View>
      {item.email && <Text style={styles.itemEmail}>{item.email}</Text>}
      {item.address && <Text style={styles.itemDetail}>{item.address}</Text>}
      {item.phone && <Text style={styles.itemDetail}>{item.phone}</Text>}
      {item.role && (
        <View style={[
          styles.roleBadge,
          { backgroundColor: COLORS.PRIMARY + '20' }
        ]}>
          <Text style={[styles.roleText, { color: COLORS.PRIMARY }]}>
            {item.role}
          </Text>
        </View>
      )}
    </Card>
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.tabActive
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Icon
              name={tab.icon}
              size={20}
              color={activeTab === tab.id ? COLORS.WHITE : COLORS.TEXT_SECONDARY}
            />
            <Text style={[
              styles.tabText,
              activeTab === tab.id && styles.tabTextActive
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content}>
        {activeTab === 'overview' && stats && (
          <View>
            <View style={styles.statsGrid}>
              <StatCard
                icon="people"
                title="Total Users"
                value={stats.totalUsers || 0}
                color={COLORS.PRIMARY}
              />
              <StatCard
                icon="location-on"
                title="Total Sites"
                value={stats.totalSites || 0}
                color={COLORS.SECONDARY}
              />
              <StatCard
                icon="business"
                title="Total Clients"
                value={stats.totalClients || 0}
                color={COLORS.SUCCESS}
              />
              <StatCard
                icon="description"
                title="Total Reports"
                value={stats.totalReports || 0}
                color={COLORS.WARNING}
              />
            </View>
            
            <Card style={styles.recentActivityCard}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <Text style={styles.noActivityText}>No recent activity</Text>
            </Card>
          </View>
        )}

        {activeTab === 'users' && (
          <View>
            {users.length > 0 ? (
              users.map(user => renderItem(user, 'user'))
            ) : (
              <Text style={styles.emptyText}>No users found</Text>
            )}
          </View>
        )}

        {activeTab === 'sites' && (
          <View>
            {sites.length > 0 ? (
              sites.map(site => renderItem(site, 'site'))
            ) : (
              <Text style={styles.emptyText}>No sites found</Text>
            )}
          </View>
        )}

        {activeTab === 'clients' && (
          <View>
            {clients.length > 0 ? (
              clients.map(client => renderItem(client, 'client'))
            ) : (
              <Text style={styles.emptyText}>No clients found</Text>
            )}
          </View>
        )}

        {activeTab === 'emails' && (
          <View>
            {emailRecipients.length > 0 ? (
              emailRecipients.map(email => (
                <Card key={email.id} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName}>{email.email}</Text>
                    <TouchableOpacity style={styles.iconButton}>
                      <Icon name="delete" size={24} color={COLORS.ERROR} />
                    </TouchableOpacity>
                  </View>
                  {email.client && <Text style={styles.itemDetail}>Client: {email.client.name}</Text>}
                </Card>
              ))
            ) : (
              <Text style={styles.emptyText}>No email recipients found</Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  tabsContainer: {
    backgroundColor: COLORS.SURFACE,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: COLORS.BACKGROUND,
  },
  tabActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '500',
  },
  tabTextActive: {
    color: COLORS.WHITE,
  },
  content: {
    flex: 1,
    padding: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
    padding: 16,
  },
  statIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.TEXT,
  },
  statTitle: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
  recentActivityCard: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT,
    marginBottom: 16,
  },
  noActivityText: {
    textAlign: 'center',
    color: COLORS.TEXT_SECONDARY,
    paddingVertical: 20,
  },
  itemCard: {
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT,
    flex: 1,
  },
  itemEmail: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 4,
  },
  itemDetail: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 4,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  iconButton: {
    padding: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.TEXT_SECONDARY,
    paddingVertical: 40,
  },
});

export default AdminScreen;