import { apiService } from '@/services/apiService';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { 
  ActivityIndicator, 
  Alert, 
  Image, 
  Linking, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View,
  Animated,
  Dimensions
} from 'react-native';

interface Badge {
  id: string;
  name: string;
  type: string;
  description: string;
  imageUrl: string;
  badgeLink?: string;
  txHash?: string;
  issuedAt: string;
}

const { width } = Dimensions.get('window');

export default function GetNFTScreen() {
  const { badgeType, isFirstTime } = useLocalSearchParams<{ badgeType?: string; isFirstTime?: string }>();
  
  const [loading, setLoading] = useState(true);
  const [minting, setMinting] = useState(false);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [eligibleBadges, setEligibleBadges] = useState<any[]>([]);
  const [userXP, setUserXP] = useState(0);
  
  // Animation
  const [scaleAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Celebration animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [badges]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch user's existing badges
      const badgesResponse = await apiService.getUserBadges();
      if (badgesResponse.status === 'OK' && badgesResponse.data) {
        setBadges(badgesResponse.data.badges || []);
      }

      // Check badge eligibility
      const eligibilityResponse = await apiService.checkBadgeEligibility();
      if (eligibilityResponse.status === 'OK' && eligibilityResponse.data) {
        setEligibleBadges(eligibilityResponse.data.eligibleBadges || []);
        setUserXP(eligibilityResponse.data.userXP || 0);
      }
      
    } catch (error) {
      console.error('Error fetching NFT data:', error);
      // Set fallback data for development
      setEligibleBadges([
        {
          type: 'proverb_apprentice',
          name: 'Proverb Apprentice',
          description: 'Completed your first story and earned your first XP',
          xpRequired: 1
        }
      ]);
      setUserXP(50);
    } finally {
      setLoading(false);
    }
  };

  const handleMintBadge = async (badgeType: string) => {
    try {
      setMinting(true);
      
      const response = await apiService.mintBadge(badgeType);
      
      if (response.status === 'Created' && response.data) {
        const newBadge = response.data.badge;
        
        // Add the new badge to the list
        setBadges(prev => [...prev, newBadge]);
        
        // Remove from eligible badges
        setEligibleBadges(prev => prev.filter(badge => badge.type !== badgeType));
        
        // Success animation and alert
        Animated.sequence([
          Animated.spring(scaleAnim, {
            toValue: 1.3,
            friction: 3,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 5,
            useNativeDriver: true,
          }),
        ]).start();

        Alert.alert(
          '🎉 NFT Minted Successfully!',
          `Your "${newBadge.name}" badge has been minted as an NFT and added to your collection!`,
          [
            {
              text: 'View on OpenSea',
              onPress: () => {
                if (response.data.badgeLink) {
                  Linking.openURL(response.data.badgeLink);
                }
              },
            },
            { text: 'Continue' }
          ]
        );
        
      } else {
        throw new Error(response.message || 'Failed to mint badge');
      }
    } catch (error: any) {
      console.error('Error minting badge:', error);
      Alert.alert(
        'Minting Failed', 
        error.message || 'Failed to mint NFT badge. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setMinting(false);
    }
  };

  const handleViewOnOpenSea = (badgeLink: string) => {
    Linking.openURL(badgeLink);
  };

  const handleClose = () => {
    router.back();
  };

  const BadgeCard = ({ badge, isEligible = false }: { badge: any; isEligible?: boolean }) => (
    <Animated.View 
      style={[
        styles.badgeCard,
        isEligible && styles.eligibleBadgeCard,
        { transform: [{ scale: scaleAnim }], opacity: fadeAnim }
      ]}
    >
      <View style={styles.badgeImageContainer}>
        {badge.imageUrl ? (
          <Image source={{ uri: badge.imageUrl }} style={styles.badgeImage} />
        ) : (
          <View style={[styles.badgeImagePlaceholder, isEligible && styles.eligibleBadgePlaceholder]}>
            <Ionicons 
              name={isEligible ? "trophy" : "medal"} 
              size={48} 
              color={isEligible ? "#FFD700" : "#A0522D"} 
            />
          </View>
        )}
        {!isEligible && (
          <View style={styles.mintedBadge}>
            <Ionicons name="checkmark-circle" size={20} color="#34C759" />
          </View>
        )}
      </View>

      <View style={styles.badgeInfo}>
        <Text style={styles.badgeName}>{badge.name}</Text>
        <Text style={styles.badgeDescription}>{badge.description}</Text>
        
        {isEligible && (
          <Text style={styles.xpRequirement}>
            XP Required: {badge.xpRequired} (You have: {userXP})
          </Text>
        )}
        
        {!isEligible && badge.issuedAt && (
          <Text style={styles.issuedDate}>
            Minted: {new Date(badge.issuedAt).toLocaleDateString()}
          </Text>
        )}
      </View>

      {isEligible ? (
        <TouchableOpacity
          style={[styles.mintButton, minting && styles.disabledButton]}
          onPress={() => handleMintBadge(badge.type)}
          disabled={minting || userXP < badge.xpRequired}
        >
          {minting ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Ionicons name="diamond" size={16} color="white" />
              <Text style={styles.mintButtonText}>Mint NFT</Text>
            </>
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => badge.badgeLink && handleViewOnOpenSea(badge.badgeLink)}
          disabled={!badge.badgeLink}
        >
          <Ionicons name="eye" size={16} color="#A0522D" />
          <Text style={styles.viewButtonText}>View NFT</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A0522D" />
        <Text style={styles.loadingText}>Loading your NFT collection...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>NFT Collection</Text>
        <View style={styles.xpContainer}>
          <Text style={styles.xpText}>{userXP} XP</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Message */}
        {isFirstTime === 'true' && (
          <Animated.View style={[styles.welcomeContainer, { opacity: fadeAnim }]}>
            <Text style={styles.welcomeTitle}>🎉 Congratulations!</Text>
            <Text style={styles.welcomeMessage}>
              You've completed your first story! You're now eligible to mint your first NFT badge.
            </Text>
          </Animated.View>
        )}

        {/* Eligible Badges */}
        {eligibleBadges.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>🏆 Ready to Mint</Text>
            <Text style={styles.sectionSubtitle}>You're eligible for these NFT badges!</Text>
            
            {eligibleBadges.map((badge, index) => (
              <BadgeCard key={`eligible-${index}`} badge={badge} isEligible={true} />
            ))}
          </>
        )}

        {/* Owned Badges */}
        <Text style={styles.sectionTitle}>
          {badges.length > 0 ? '💎 Your NFT Collection' : '📦 Your Collection'}
        </Text>
        <Text style={styles.sectionSubtitle}>
          {badges.length > 0 
            ? `You own ${badges.length} NFT badge${badges.length > 1 ? 's' : ''}`
            : 'Complete stories to earn NFT badges!'
          }
        </Text>

        {badges.length > 0 ? (
          badges.map((badge, index) => (
            <BadgeCard key={`owned-${index}`} badge={badge} />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="medal-outline" size={64} color="#999" />
            <Text style={styles.emptyText}>No NFT badges yet</Text>
            <Text style={styles.emptySubtext}>
              Complete stories and quizzes to earn your first badge!
            </Text>
          </View>
        )}

        {/* Badge Types Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>🎯 Available Badge Types</Text>
          <View style={styles.badgeTypesList}>
            <View style={styles.badgeTypeItem}>
              <Text style={styles.badgeTypeName}>🌟 Proverb Apprentice</Text>
              <Text style={styles.badgeTypeDesc}>Complete your first story (1 XP)</Text>
            </View>
            <View style={styles.badgeTypeItem}>
              <Text style={styles.badgeTypeName}>📚 Story Master</Text>
              <Text style={styles.badgeTypeDesc}>Complete 10 stories (500 XP)</Text>
            </View>
            <View style={styles.badgeTypeItem}>
              <Text style={styles.badgeTypeName}>🏆 Quiz Champion</Text>
              <Text style={styles.badgeTypeDesc}>Perfect scores on 5 quizzes (250 XP)</Text>
            </View>
            <View style={styles.badgeTypeItem}>
              <Text style={styles.badgeTypeName}>🌍 Language Explorer</Text>
              <Text style={styles.badgeTypeDesc}>Learn multiple languages (1000 XP)</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#999',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  xpContainer: {
    backgroundColor: '#A0522D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  xpText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  welcomeContainer: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 20,
    marginVertical: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#A0522D',
    marginBottom: 12,
  },
  welcomeMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 32,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  badgeCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  eligibleBadgeCard: {
    borderWidth: 3,
    borderColor: '#FFD700',
    backgroundColor: '#FFFDF5',
  },
  badgeImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  badgeImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  badgeImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0E6D6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eligibleBadgePlaceholder: {
    backgroundColor: '#FFF9E6',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  mintedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 2,
  },
  badgeInfo: {
    flex: 1,
    marginRight: 12,
  },
  badgeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  xpRequirement: {
    fontSize: 12,
    color: '#A0522D',
    fontWeight: '600',
  },
  issuedDate: {
    fontSize: 12,
    color: '#999',
  },
  mintButton: {
    backgroundColor: '#A0522D',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
  },
  mintButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  viewButton: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#A0522D',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewButtonText: {
    color: '#A0522D',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  infoContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  badgeTypesList: {
    gap: 12,
  },
  badgeTypeItem: {
    paddingVertical: 8,
  },
  badgeTypeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A0522D',
    marginBottom: 4,
  },
  badgeTypeDesc: {
    fontSize: 14,
    color: '#666',
  },
});