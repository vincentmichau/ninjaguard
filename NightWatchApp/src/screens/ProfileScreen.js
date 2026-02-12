import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Loading from '../components/Loading';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../constants';

const ProfileScreen = ({ navigation }) => {
  const { user, logout, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout }
      ]
    );
  };

  const handleChangePassword = async () => {
    const newErrors = {};

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      setLoading(true);
      await authService.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      Alert.alert('Success', 'Password changed successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordForm(false);
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoIconContainer}>
        <Icon name={icon} size={20} color={COLORS.PRIMARY} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );

  if (!user) {
    return <Loading />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.firstName?.charAt(0).toUpperCase()}{user.lastName?.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={styles.userName}>
          {user.firstName} {user.lastName}
        </Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <View style={[
          styles.roleBadge,
          { backgroundColor: COLORS.PRIMARY + '20' }
        ]}>
          <Text style={[styles.roleText, { color: COLORS.PRIMARY }]}>
            {user.role}
          </Text>
        </View>
      </View>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <InfoRow icon="person" label="Full Name" value={`${user.firstName} ${user.lastName}`} />
        <InfoRow icon="email" label="Email" value={user.email} />
        {user.phone && <InfoRow icon="phone" label="Phone" value={user.phone} />}
        <InfoRow
          icon="work"
          label="Role"
          value={user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Security</Text>
        <Button
          title={showPasswordForm ? 'Cancel' : 'Change Password'}
          onPress={() => setShowPasswordForm(!showPasswordForm)}
          variant={showPasswordForm ? 'outline' : 'primary'}
          style={styles.passwordButton}
        />
        
        {showPasswordForm && (
          <View style={styles.passwordForm}>
            <Input
              label="Current Password"
              value={passwordForm.currentPassword}
              onChangeText={(text) => setPasswordForm({ ...passwordForm, currentPassword: text })}
              placeholder="Enter current password"
              secureTextEntry
              error={errors.currentPassword}
            />
            <Input
              label="New Password"
              value={passwordForm.newPassword}
              onChangeText={(text) => setPasswordForm({ ...passwordForm, newPassword: text })}
              placeholder="Enter new password"
              secureTextEntry
              error={errors.newPassword}
            />
            <Input
              label="Confirm Password"
              value={passwordForm.confirmPassword}
              onChangeText={(text) => setPasswordForm({ ...passwordForm, confirmPassword: text })}
              placeholder="Confirm new password"
              secureTextEntry
              error={errors.confirmPassword}
            />
            <Button
              title="Update Password"
              onPress={handleChangePassword}
              loading={loading}
              style={styles.updateButton}
            />
          </View>
        )}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Account Actions</Text>
        <Button
          title="Refresh Profile"
          onPress={updateUser}
          icon={<Icon name="refresh" size={20} color={COLORS.WHITE} />}
          variant="secondary"
          style={styles.actionButton}
        />
        <Button
          title="Logout"
          onPress={handleLogout}
          icon={<Icon name="logout" size={20} color={COLORS.WHITE} />}
          variant="danger"
          style={styles.actionButton}
        />
      </Card>

      <View style={styles.footer}>
        <Text style={styles.footerText}>NightWatch App v1.0.0</Text>
        <Text style={styles.footerText}>© 2024 NightWatch</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.PRIMARY,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.WHITE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.WHITE + 'CC',
    marginBottom: 12,
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
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
    marginBottom: 16,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.PRIMARY + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.TEXT,
  },
  passwordButton: {
    marginBottom: 16,
  },
  passwordForm: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
  updateButton: {
    marginTop: 8,
  },
  actionButton: {
    marginBottom: 12,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 4,
  },
});

export default ProfileScreen;