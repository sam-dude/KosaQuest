import { useAuth } from '@/contexts/AuthContext';
import { apiService, Story } from '@/services/apiService';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function StoriesScreen() {
  const { user, refreshUserProfile } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const response = await apiService.getStories();
      if (response.status === 'OK' && response.data) {
        setStories(response.data.stories || []);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStories();
    await refreshUserProfile();
    setRefreshing(false);
  };

  const handleStoryPress = (story: Story) => {
    router.push(`/story/${story.storyId}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A0522D" />
        <Text style={styles.loadingText}>Loading stories...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>All Stories</Text>
        <Text style={styles.subtitle}>Choose your cultural adventure</Text>
      </View>

      <View style={styles.storiesContainer}>
        {stories.map((story) => (
          <TouchableOpacity
            key={story.storyId}
            style={styles.storyCard}
            onPress={() => handleStoryPress(story)}
          >
            <Image 
              source={require('../../assets/images/cultural-background.png')} 
              style={styles.storyImage}
            />
            <View style={styles.storyContent}>
              <Text style={styles.storyTitle}>{story.title}</Text>
              <Text style={styles.storyDescription}>{story.description}</Text>
              <View style={styles.storyMeta}>
                <Text style={styles.difficultyText}>{story.difficulty}</Text>
                <Text style={styles.xpText}>+{story.totalXP} XP</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#A0522D" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  storiesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
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
  xpText: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '600',
  },
});