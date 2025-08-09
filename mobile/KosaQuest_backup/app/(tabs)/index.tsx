import { useAuth } from '@/contexts/AuthContext';
import { apiService, Story } from '@/services/apiService';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Random image sources for story cards
const storyImages = [
  require('../../assets/images/cultural-background.png'),
  require('../../assets/images/yoruba.png'),
  require('../../assets/images/igbo.png'),
  require('../../assets/images/hausa.png'),
];

const getRandomImage = () => {
  const randomIndex = Math.floor(Math.random() * storyImages.length);
  return storyImages[randomIndex];
};

// Available languages
const availableLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'yoruba', name: 'Yoruba', flag: '🇳🇬' },
  { code: 'igbo', name: 'Igbo', flag: '🇳🇬' },
  { code: 'hausa', name: 'Hausa', flag: '🇳🇬' },
];

export default function HomeScreen() {
  const { user, refreshUserProfile } = useAuth();
  const [currentLanguage, setCurrentLanguage] = useState('en'); // Start with English
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [stories, setStories] = useState<Story[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);

  // Get user's selected language or default to 'yoruba'
  const userNativeLanguage = user?.selectedLanguage || 'yoruba';

  const translations = {
    welcome: {
      en: 'Welcome back,',
      yoruba: 'Kaabo pada,',
      igbo: 'Ndewo ozọ,',
      hausa: 'Barka da dawowa,'
    },
    name: {
      en: user?.name || 'User!',
      yoruba: user?.name || 'User!',
      igbo: user?.name || 'User!',
      hausa: user?.name || 'User!'
    },
    xpProgress: {
      en: 'XP Progress',
      yoruba: 'Iwọn Ilọsiwaju',
      igbo: 'Ọganihu XP',
      hausa: 'Ci gaba XP'
    },
    keepLearning: {
      en: 'Keep learning to reach the next level!',
      yoruba: 'Maa kọ ẹkọ lati de ipele to tẹle!',
      igbo: 'Nọgide na-amụ ihe iji ruo ọkwa ọzọ!',
      hausa: 'Ci gaba da koyo don kai matakin gaba!'
    },
    availableStories: {
      en: 'Available Stories',
      yoruba: 'Awọn Itan to wa',
      igbo: 'Akụkọ ndị dị',
      hausa: 'Tatsuniyoyin da ke akwai'
    },
    selectLanguage: {
      en: 'Select Language',
      yoruba: 'Yan Ede',
      igbo: 'Họrọ Asụsụ',
      hausa: 'Zaɓi Harshe'
    },
    storiesIn: {
      en: 'Stories in',
      yoruba: 'Awọn itan ni',
      igbo: 'Akụkọ na',
      hausa: 'Tatsuniyoyi a cikin'
    },
    noStories: {
      en: 'No stories available in this language yet.',
      yoruba: 'Ko si itan ti o wa ni ede yii sibẹ.',
      igbo: 'Enweghị akụkọ dị n\'asụsụ a ugbu a.',
      hausa: 'Babu tatsuniyoyi a cikin wannan harshen tukuna.'
    },
    loading: {
      en: 'Loading stories...',
      yoruba: 'N gba awọn itan...',
      igbo: 'Na-ebu akụkọ...',
      hausa: 'Ana daukar tatsuniyoyi...'
    }
  };

  const getCurrentLang = () => currentLanguage;

  const handleLanguageSelect = (languageCode: string) => {
    setCurrentLanguage(languageCode);
    setShowLanguageModal(false);
    filterStoriesByLanguage(languageCode);
  };

  const filterStoriesByLanguage = (languageCode: string) => {
    let filtered = stories;
    
    // Filter stories based on selected language
    if (languageCode !== 'en') {
      // Show stories that are in the selected native language or English
      filtered = stories.filter(story => 
        story.language?.toLowerCase() === languageCode || 
        story.language?.toLowerCase() === 'english' ||
        story.targetLanguage?.toLowerCase() === languageCode
      );
    }
    
    setFilteredStories(filtered);
  };

  // Fetch stories on component mount
  useEffect(() => {
    fetchStories();
    // Set initial language based on user preference
    if (userNativeLanguage) {
      setCurrentLanguage(userNativeLanguage);
    }
    // Refresh user profile when component mounts
    if (user) {
      refreshUserProfile();
    }
  }, []);

  // Filter stories when stories or language changes
  useEffect(() => {
    filterStoriesByLanguage(currentLanguage);
  }, [stories, currentLanguage]);

  const fetchStories = async () => {
    try {
      setLoadingStories(true);
      const response = await apiService.getStories();
      
      if (response.status === 'OK' && response.data) {
        setStories(response.data.stories || []);
      } else {
        console.warn('Failed to fetch stories:', response.message);
        // Set fallback stories for development with different languages
        setStories([
          {
            storyId: 'story_001',
            title: 'The Wise Tortoise',
            description: 'A story about patience and wisdom',
            language: 'English',
            targetLanguage: 'yoruba',
            difficulty: 'Beginner',
            totalXP: 50
          },
          {
            storyId: 'story_002',
            title: 'Anansi ati Ikoko Ewa',
            description: 'Itan alaimọkan lati Iwo-Oorun Afrika',
            language: 'Yoruba',
            targetLanguage: 'yoruba',
            difficulty: 'Intermediate',
            totalXP: 75
          },
          {
            storyId: 'story_003',
            title: 'Ọdụm na Oke',
            description: 'Akụkọ nke ọbụbụenyi na-atụghị anya ya',
            language: 'Igbo',
            targetLanguage: 'igbo',
            difficulty: 'Beginner',
            totalXP: 50
          },
          {
            storyId: 'story_004',
            title: 'Zaki da Berá',
            description: 'Tatsuniya ta abokantaka marar tsammani',
            language: 'Hausa',
            targetLanguage: 'hausa',
            difficulty: 'Beginner',
            totalXP: 50
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
      Alert.alert('Error', 'Failed to load stories. Please try again later.');
      setStories([]);
    } finally {
      setLoadingStories(false);
    }
  };

  const StoryCard = ({ story, onPress }: { story: Story; onPress: () => void }) => (
    <TouchableOpacity style={styles.storyCard} onPress={onPress}>
      <Image source={getRandomImage()} style={styles.storyImage} />
      <View style={styles.storyContent}>
        <Text style={styles.storyTitle}>{story.title}</Text>
        <Text style={styles.storyDescription}>{story.description}</Text>
        <View style={styles.storyMeta}>
          <Text style={styles.difficultyText}>{story.difficulty}</Text>
          <Text style={styles.languageTag}>
            {story.language === 'English' ? 'EN' : story.language?.substring(0, 3).toUpperCase()}
          </Text>
          <Text style={styles.xpText}>+{story.totalXP} XP</Text>
        </View>
      </View>
      <View style={styles.playButton}>
        <Ionicons name="play" size={20} color="white" />
      </View>
    </TouchableOpacity>
  );

  const handleStoryPress = (story: Story) => {
    router.push(`/story/${story.storyId}`);
  };

  const LanguageModal = () => (
    <Modal
      visible={showLanguageModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowLanguageModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {translations.selectLanguage[getCurrentLang() as keyof typeof translations.selectLanguage]}
            </Text>
            <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.languageList}>
            {availableLanguages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageOption,
                  currentLanguage === lang.code && styles.selectedLanguageOption
                ]}
                onPress={() => handleLanguageSelect(lang.code)}
              >
                <Text style={styles.languageFlag}>{lang.flag}</Text>
                <Text style={[
                  styles.languageName,
                  currentLanguage === lang.code && styles.selectedLanguageName
                ]}>
                  {lang.name}
                </Text>
                {currentLanguage === lang.code && (
                  <Ionicons name="checkmark" size={20} color="#A0522D" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );

  const getCurrentLanguageInfo = () => {
    return availableLanguages.find(lang => lang.code === currentLanguage) || availableLanguages[0];
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={30} color="#8B4513" />
          </View>
          <View>
            <Text style={styles.welcomeText}>
              {translations.welcome[getCurrentLang() as keyof typeof translations.welcome]}
            </Text>
            <Text style={styles.userName}>
              {translations.name[getCurrentLang() as keyof typeof translations.name]}
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.languageButton} 
          onPress={() => setShowLanguageModal(true)}
        >
          <Text style={styles.languageFlag}>{getCurrentLanguageInfo().flag}</Text>
        </TouchableOpacity>
      </View>

      {/* XP Progress */}
      <View style={styles.xpCard}>
        <View style={styles.xpHeader}>
          <Text style={styles.xpTitle}>
            {translations.xpProgress[getCurrentLang() as keyof typeof translations.xpProgress]}
          </Text>
          <Text style={styles.xpPoints}>{user?.xp || 0}/1000 XP</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.min(((user?.xp || 0) / 1000) * 100, 100)}%` }]} />
        </View>
        <Text style={styles.xpDescription}>
          {translations.keepLearning[getCurrentLang() as keyof typeof translations.keepLearning]}
        </Text>
      </View>

      {/* Available Stories */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {translations.availableStories[getCurrentLang() as keyof typeof translations.availableStories]}
        </Text>
        <Text style={styles.sectionSubtitle}>
          {translations.storiesIn[getCurrentLang() as keyof typeof translations.storiesIn]} {getCurrentLanguageInfo().name}
        </Text>
      </View>

      <View style={styles.storiesContainer}>
        {loadingStories ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#A0522D" />
            <Text style={styles.loadingText}>
              {translations.loading[getCurrentLang() as keyof typeof translations.loading]}
            </Text>
          </View>
        ) : filteredStories.length > 0 ? (
          filteredStories.map((story) => (
            <StoryCard 
              key={story.storyId} 
              story={story}
              onPress={() => handleStoryPress(story)}
            />
          ))
        ) : (
          <View style={styles.noStoriesContainer}>
            <Ionicons name="book-outline" size={48} color="#999" />
            <Text style={styles.noStoriesText}>
              {translations.noStories[getCurrentLang() as keyof typeof translations.noStories]}
            </Text>
          </View>
        )}
      </View>

      <LanguageModal />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5DEB3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  welcomeText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 2,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  languageButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  languageFlag: {
    fontSize: 20,
  },
  xpCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  xpTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  xpPoints: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A0522D',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#A0522D',
    borderRadius: 4,
  },
  xpDescription: {
    fontSize: 14,
    color: '#999',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  storiesContainer: {
    paddingHorizontal: 20,
    marginBottom: 100,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#999',
  },
  noStoriesContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noStoriesText: {
    marginTop: 12,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  storyCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  storyImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 16,
  },
  storyContent: {
    flex: 1,
  },
  storyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  storyDescription: {
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
    marginBottom: 8,
  },
  storyMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyText: {
    fontSize: 12,
    color: '#A0522D',
    backgroundColor: '#FDF6F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    fontWeight: '500',
  },
  languageTag: {
    fontSize: 10,
    color: '#666',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    fontWeight: '500',
  },
  xpText: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '600',
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#A0522D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  languageList: {
    padding: 20,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  selectedLanguageOption: {
    backgroundColor: '#FDF6F0',
  },
  languageName: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  selectedLanguageName: {
    color: '#A0522D',
    fontWeight: '600',
  },
});