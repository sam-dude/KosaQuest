import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/apiService';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout, refreshUserProfile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [badges, setBadges] = useState<any[]>([]);

  useEffect(() => {
    fetchUserBadges();
  }, []);

  const fetchUserBadges = async () => {
    try {
      const response = await apiService.getUserBadges();
      if (response.status === 'OK' && response.data) {
        setBadges(response.data.badges || []);
      }
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshUserProfile();
    await fetchUserBadges();
    setRefreshing(false);
  };

  const getXPLevel = (xp: number) => {
    if (xp < 100) return { level: 1, name: 'Beginner', nextLevel: 100 };
    if (xp < 250) return { level: 2, name: 'Apprentice', nextLevel: 250 };
    if (xp < 500) return { level: 3, name: 'Explorer', nextLevel: 500 };
    if (xp < 1000) return { level: 4, name: 'Scholar', nextLevel: 1000 };
    return { level: 5, name: 'Master', nextLevel: null };
  };

  const levelInfo = getXPLevel(user?.xp || 0);
  const progressPercentage = levelInfo.nextLevel 
    ? ((user?.xp || 0) / levelInfo.nextLevel) * 100
    : 100;

  const handleViewNFTs = () => {
    router.push('/story/getnft');
  };

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout? This will clear all your local data.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: confirmLogout,
        },
      ],
      { cancelable: true }
    );
  };

  const confirmLogout = async () => {
    try {
      await logout();
      Alert.alert('Success', 'You have been logged out successfully.');
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Error', 'An error occurred during logout. Please try again.');
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={50} color="#8B4513" />
        </View>
        <Text style={styles.name}>{user?.name || 'User'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        
        {/* XP Level Display */}
        <View style={styles.levelContainer}>
          <Text style={styles.levelText}>Level {levelInfo.level} - {levelInfo.name}</Text>
          <Text style={styles.xpText}>{user?.xp || 0} XP</Text>
        </View>
        
        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${Math.min(progressPercentage, 100)}%` }]} />
          </View>
          {levelInfo.nextLevel && (
            <Text style={styles.progressText}>
              {(levelInfo.nextLevel - (user?.xp || 0))} XP to next level
            </Text>
          )}
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="book" size={24} color="#A0522D" />
          <Text style={styles.statNumber}>{user?.storiesCompleted || 0}</Text>
          <Text style={styles.statLabel}>Stories</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="trophy" size={24} color="#FFD700" />
          <Text style={styles.statNumber}>{badges.length}</Text>
          <Text style={styles.statLabel}>NFT Badges</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="star" size={24} color="#34C759" />
          <Text style={styles.statNumber}>{user?.xp || 0}</Text>
          <Text style={styles.statLabel}>Total XP</Text>
        </View>
      </View>

      {/* NFT Collection Preview */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🏆 NFT Collection</Text>
          <TouchableOpacity onPress={handleViewNFTs} style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="chevron-forward" size={16} color="#A0522D" />
          </TouchableOpacity>
        </View>
        
        {badges.length > 0 ? (
          <View style={styles.badgePreview}>
            {badges.slice(0, 3).map((badge, index) => (
              <View key={index} style={styles.badgeItem}>
                <View style={styles.badgeIcon}>
                  <Ionicons name="medal" size={20} color="#A0522D" />
                </View>
                <Text style={styles.badgeName}>{badge.name}</Text>
              </View>
            ))}
            {badges.length > 3 && (
              <Text style={styles.moreBadgesText}>+{badges.length - 3} more</Text>
            )}
          </View>
        ) : (
          <Text style={styles.noBadgesText}>Complete stories to earn NFT badges!</Text>
        )}
      </View>

      {/* Profile Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Settings</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Language Preference</Text>
          <Text style={styles.settingValue}>{user?.selectedLanguage || 'Not set'}</Text>
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Proficiency Level</Text>
          <Text style={styles.settingValue}>{user?.selectedProficiency || 'Not set'}</Text>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="white" style={styles.logoutIcon} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
      
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingTop: 60,
    backgroundColor: 'white',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F5DEB3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
    marginBottom: 20,
  },
  levelContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  levelText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#A0522D',
    marginBottom: 4,
  },
  xpText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#A0522D',
  },
  progressBarContainer: {
    width: '80%',
    alignItems: 'center',
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#A0522D',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#A0522D',
    fontWeight: '600',
    marginRight: 4,
  },
  badgePreview: {
    gap: 12,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5DEB3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  badgeName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  moreBadgesText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
  },
  noBadgesText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 16,
    color: '#666',
    textTransform: 'capitalize',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 40,
  },
});