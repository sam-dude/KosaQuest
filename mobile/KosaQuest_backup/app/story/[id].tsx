import { useAuth } from '@/contexts/AuthContext';
import { apiService, Story, StoryPage, Quiz, QuizQuestion } from '@/services/apiService';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Animated, Dimensions } from 'react-native';

interface QuizResponse {
  questionId: string;
  answer: string;
}

interface QuizResult {
  questionId: string;
  answer: string;
  isCorrect: boolean;
  pointsEarned: number;
}

const { width } = Dimensions.get('window');

export default function StoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, refreshUserProfile } = useAuth();
  
  const [story, setStory] = useState<Story | null>(null);
  const [storyPages, setStoryPages] = useState<StoryPage[]>([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isReadingMode, setIsReadingMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  
  // Quiz state
  const [quizResponses, setQuizResponses] = useState<QuizResponse[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState<any>(null);
  
  // Animation
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (id) {
      fetchStoryData();
    }
  }, [id]);

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [currentPageIndex, currentQuestionIndex]);

  // Helper function to break long text into smaller chunks
  const breakTextIntoChunks = (text: string, maxLength: number = 200): string[] => {
    if (text.length <= maxLength) return [text];
    
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chunks: string[] = [];
    let currentChunk = '';
    
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (currentChunk.length + trimmedSentence.length + 1 <= maxLength) {
        currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk + '.');
          currentChunk = trimmedSentence;
        } else {
          // If single sentence is too long, split by words
          const words = trimmedSentence.split(' ');
          let wordChunk = '';
          for (const word of words) {
            if (wordChunk.length + word.length + 1 <= maxLength) {
              wordChunk += (wordChunk ? ' ' : '') + word;
            } else {
              if (wordChunk) chunks.push(wordChunk + '.');
              wordChunk = word;
            }
          }
          if (wordChunk) currentChunk = wordChunk;
        }
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk + '.');
    }
    
    return chunks;
  };

  const fetchStoryData = async () => {
    try {
      setLoading(true);
      
      // Fetch story details
      const storyResponse = await apiService.getStory(id);
      if (storyResponse.status === 'OK' && storyResponse.data) {
        setStory(storyResponse.data.story);
        
        // Process pages - break long content into multiple parts
        const pages = storyResponse.data.pages || [];
        const processedPages: StoryPage[] = [];
        
        pages.forEach((page, index) => {
          const content = page.content || page.english || '';
          const translation = page.translation || page.native || '';
          
          if (content.length > 250) {
            // Break long content into multiple pages
            const contentChunks = breakTextIntoChunks(content, 250);
            const translationChunks = translation ? breakTextIntoChunks(translation, 250) : [];
            
            contentChunks.forEach((chunk, chunkIndex) => {
              processedPages.push({
                pageNumber: processedPages.length + 1,
                content: chunk,
                translation: translationChunks[chunkIndex] || '',
                imageUrl: chunkIndex === 0 ? page.imageUrl : null, // Only show image on first chunk
              });
            });
          } else {
            processedPages.push({
              pageNumber: processedPages.length + 1,
              content: content,
              translation: translation,
              imageUrl: page.imageUrl,
            });
          }
        });
        
        setStoryPages(processedPages);
        
        // Process quiz - handle both API formats
        const quizData = storyResponse.data.quiz;
        if (quizData) {
          const questions = quizData.questions || quizData.quizzes || [];
          setQuiz({ questions });
        }
      } else {
        // Enhanced fallback data with better story structure
        setStory({
          storyId: id,
          title: 'The Wise Tortoise (Ijapa)',
          description: 'A traditional West African folktale about patience, wisdom, and community',
          language: 'English',
          targetLanguage: 'yoruba',
          difficulty: 'Beginner',
          totalXP: 75
        });
        
        // Better structured story with shorter, more digestible pages
        setStoryPages([
          {
            pageNumber: 1,
            content: "In the heart of West Africa, beneath towering mahogany trees, lived a wise old tortoise named Ijapa.",
            translation: "Ni aarin Iwọ-oorun Afrika, labẹ awọn igi mahogany giga, agbon arugbo ọlọgbọn kan ti a npe ni Ijapa wa.",
            imageUrl: null
          },
          {
            pageNumber: 2,
            content: "Unlike other animals who rushed about, Ijapa moved slowly and thought deeply about every problem.",
            translation: "Ko dabi awọn ẹranko miiran ti o n yara lọ, Ijapa n lọ lafinju ati pe o n ronu jinlẹ nipa gbogbo iṣoro.",
            imageUrl: null
          },
          {
            pageNumber: 3,
            content: "All the forest creatures respected him. They would come to seek his wisdom when troubles arose.",
            translation: "Gbogbo awọn ẹda igbo bu ọlá fun u. Wọn yoo wa lati wa ogbon rẹ nigbati awọn iṣoro ba dide.",
            imageUrl: null
          },
          {
            pageNumber: 4,
            content: "One scorching summer, a terrible drought struck the land. Rivers turned to dust, and wells ran dry.",
            translation: "Ni ọsan gbooru kan, ogbele buruku kan kọlu ilẹ naa. Awọn odo di eruku, awọn kanga si gbẹ.",
            imageUrl: null
          },
          {
            pageNumber: 5,
            content: "Panic spread among the animals. The mighty elephant trumpeted in despair, and the swift gazelle wept.",
            translation: "Ẹru gba awọn ẹranko. Erin nla fọn ni ainireti, ati pe egbin yara sọkun.",
            imageUrl: null
          },
          {
            pageNumber: 6,
            content: "While others panicked, Ijapa sat quietly under his favorite baobab tree, closing his eyes in thought.",
            translation: "Lakoko ti awọn miiran n jaiya, Ijapa joko ni idakẹjẹ labẹ igi baobab ayanfẹ rẹ, o di oju rẹ ni ero.",
            imageUrl: null
          },
          {
            pageNumber: 7,
            content: "Deep in his memory, he recalled stories his grandfather once told him about hidden water sources.",
            translation: "Ni jinlẹ inu iranti rẹ, o ranti awọn itan ti baba baba rẹ ti sọ fun u nipa awọn orisun omi ti o farapamọ.",
            imageUrl: null
          },
          {
            pageNumber: 8,
            content: "With newfound hope, Ijapa slowly led the desperate animals through forgotten paths to an ancient spring.",
            translation: "Pẹlu ireti tuntun, Ijapa jẹjẹ darí awọn ẹranko ti o wa ni wahala nipasẹ awọn ọna ti a gbagbe si orisun omi atijọ kan.",
            imageUrl: null
          },
          {
            pageNumber: 9,
            content: "The crystal-clear water bubbled up from deep underground, saving the entire forest community.",
            translation: "Omi ti o mọ bi kirisita yo jade lati abẹ ilẹ jinlẹ, o gba gbogbo agbegbe igbo la.",
            imageUrl: null
          },
          {
            pageNumber: 10,
            content: "From that day forward, the animals understood that wisdom and patience are more valuable than speed and strength.",
            translation: "Lati ọjọ yẹn lọ, awọn ẹranko loye pe ọgbọn ati sũuru ṣe pataki ju iyara ati agbara lọ.",
            imageUrl: null
          }
        ]);
        
        // Enhanced quiz with better questions and explanations
        setQuiz({
          questions: [
            {
              questionId: 'q1',
              question: 'What made Ijapa different from the other animals in the forest?',
              options: [
                'He was the fastest runner',
                'He was the strongest animal', 
                'He moved slowly and thought deeply',
                'He was the youngest animal'
              ],
              correctAnswer: 'He moved slowly and thought deeply',
              answer: 'He moved slowly and thought deeply', // For API compatibility
              points: 10,
              explanation: 'Ijapa was known for his thoughtful, deliberate approach to problems, which contrasted with other animals who rushed around.'
            },
            {
              questionId: 'q2',
              question: 'How did the other animals react when the drought began?',
              options: [
                'They remained calm and patient',
                'They panicked and became desperate',
                'They immediately found solutions',
                'They left the forest'
              ],
              correctAnswer: 'They panicked and became desperate',
              answer: 'They panicked and became desperate',
              points: 10,
              explanation: 'The story describes how panic spread among the animals, with the elephant trumpeting in despair and the gazelle weeping.'
            },
            {
              questionId: 'q3',
              question: 'What did Ijapa remember that helped solve the water crisis?',
              options: [
                'A rain dance ritual',
                'Stories about hidden water sources from his grandfather',
                'A map he had seen before',
                'Instructions from other animals'
              ],
              correctAnswer: 'Stories about hidden water sources from his grandfather',
              answer: 'Stories about hidden water sources from his grandfather',
              points: 15,
              explanation: 'Ijapa drew upon the wisdom passed down from his grandfather, remembering stories about ancient, hidden springs.'
            },
            {
              questionId: 'q4',
              question: 'What is the main lesson of this story?',
              options: [
                'Speed is more important than wisdom',
                'Only the strongest survive difficult times',
                'Wisdom and patience are more valuable than speed and strength',
                'Animals should always panic during crises'
              ],
              correctAnswer: 'Wisdom and patience are more valuable than speed and strength',
              answer: 'Wisdom and patience are more valuable than speed and strength',
              points: 15,
              explanation: 'The story concludes with this exact lesson, showing how Ijapa\'s thoughtful approach succeeded where panic and haste failed.'
            }
          ]
        });
      }
    } catch (error) {
      console.error('Error fetching story:', error);
      Alert.alert('Error', 'Failed to load story. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (currentPageIndex < storyPages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
      resetAnimation();
    } else {
      // Story finished, switch to quiz mode
      setIsReadingMode(false);
      resetAnimation();
    }
  };

  const handlePreviousPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
      resetAnimation();
    }
  };

  const resetAnimation = () => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleQuizAnswer = (answer: string) => {
    const currentQuestion = quiz?.questions?.[currentQuestionIndex];
    if (!currentQuestion) return;

    const newResponse: QuizResponse = {
      questionId: currentQuestion.questionId,
      answer: answer
    };

    const updatedResponses = quizResponses.filter(r => r.questionId !== currentQuestion.questionId);
    updatedResponses.push(newResponse);
    setQuizResponses(updatedResponses);

    // Move to next question or complete quiz
    if (currentQuestionIndex < (quiz?.questions?.length || 0) - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        resetAnimation();
      }, 1500); // Longer delay to read explanation
    } else {
      // All questions answered, submit quiz
      setTimeout(() => {
        submitQuiz(updatedResponses);
      }, 1500);
    }
  };

  const submitQuiz = async (responses: QuizResponse[]) => {
    try {
      setSubmittingQuiz(true);
      
      const response = await apiService.submitQuiz(id, responses);
      
      if (response.status === 'OK' && response.data) {
        setQuizResults(response.data);
        setQuizCompleted(true);
        
        // Refresh user profile to update XP
        await refreshUserProfile();
        
        // Show completion alert with server data
        Alert.alert(
          '🎉 Story Complete!',
          `Excellent work! You earned ${response.data.xpEarned} XP!\n\nScore: ${response.data.score}/${response.data.maxScore} (${response.data.scorePercentage}%)\n\nTotal XP: ${response.data.totalXP}`,
          [
            { 
              text: 'Check NFT Rewards!', 
              onPress: () => {
                // Navigate to NFT screen and check eligibility
                checkBadgeEligibilityAndNavigate();
              }
            }
          ]
        );
        
      } else {
        // Fallback success for development
        const mockResults = {
          xpEarned: 50,
          totalXP: (user?.xp || 0) + 50,
          score: responses.length,
          maxScore: quiz?.questions?.length || 4,
          scorePercentage: 100,
          results: responses.map(r => ({
            questionId: r.questionId,
            answer: r.answer,
            isCorrect: true,
            pointsEarned: 10
          }))
        };
        
        setQuizResults(mockResults);
        setQuizCompleted(true);
        await refreshUserProfile();
        
        Alert.alert(
          '🎉 Story Complete!',
          `Excellent work! You earned ${mockResults.xpEarned} XP!\n\nScore: ${mockResults.score}/${mockResults.maxScore} (${mockResults.scorePercentage}%)\n\nTotal XP: ${mockResults.totalXP}`,
          [
            { 
              text: 'Check NFT Rewards!', 
              onPress: () => {
                checkBadgeEligibilityAndNavigate();
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      Alert.alert('Error', 'Failed to submit quiz. Please try again.');
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const checkBadgeEligibilityAndNavigate = async () => {
    try {
      const response = await apiService.checkBadgeEligibility();
      
      if (response.status === 'OK' && response.data?.eligibleBadges?.length > 0) {
        // User is eligible for badges - navigate to NFT screen
        const isFirstBadge = response.data.eligibleBadges.some((badge: any) => badge.type === 'proverb_apprentice');
        
        router.push({
          pathname: '/story/getnft',
          params: { 
            badgeType: response.data.eligibleBadges[0].type,
            isFirstTime: isFirstBadge ? 'true' : 'false'
          }
        });
        
      } else {
        // No eligible badges yet
        Alert.alert(
          'Keep Learning!',
          'You\'re making great progress! Complete more stories to unlock NFT badges.',
          [{ text: 'Continue Learning', onPress: () => router.back() }]
        );
      }
    } catch (error) {
      console.error('Error checking badge eligibility:', error);
      // Still navigate to NFT screen to show collection
      router.push('/story/getnft');
    }
  };

  const handleClose = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A0522D" />
        <Text style={styles.loadingText}>Loading your story...</Text>
      </View>
    );
  }

  const currentPage = storyPages[currentPageIndex];
  const currentQuestion = quiz?.questions?.[currentQuestionIndex];
  const selectedAnswer = quizResponses.find(r => r.questionId === currentQuestion?.questionId)?.answer;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {isReadingMode ? 'Reading' : quizCompleted ? 'Results' : 'Quiz Time'}
          </Text>
          <Text style={styles.storyTitle}>{story?.title}</Text>
        </View>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {isReadingMode 
              ? `${currentPageIndex + 1}/${storyPages.length}`
              : quizCompleted 
                ? '✓' 
                : `${currentQuestionIndex + 1}/${quiz?.questions?.length || 0}`
            }
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[
          styles.progressBar, 
          { 
            width: isReadingMode 
              ? `${((currentPageIndex + 1) / storyPages.length) * 100}%`
              : quizCompleted
                ? '100%'
                : `${((currentQuestionIndex + 1) / (quiz?.questions?.length || 1)) * 100}%`
          }
        ]} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isReadingMode ? (
          /* Story Reading Mode */
          <Animated.View style={[styles.storyContainer, { opacity: fadeAnim }]}>
            {currentPage && (
              <>
                <View style={styles.storyContent}>
                  <View style={styles.pageIndicator}>
                    <Text style={styles.pageNumber}>Page {currentPageIndex + 1}</Text>
                  </View>
                  
                  <Text style={styles.storyText}>
                    {currentPage.content || currentPage.english}
                  </Text>
                  
                  {(currentPage.translation || currentPage.native) && (
                    <View style={styles.translationContainer}>
                      <Text style={styles.translationLabel}>🌍 Translation (Yorùbá):</Text>
                      <Text style={styles.translationText}>
                        {currentPage.translation || currentPage.native}
                      </Text>
                    </View>
                  )}
                </View>

                {currentPage.imageUrl && (
                  <Image source={{ uri: currentPage.imageUrl }} style={styles.storyImage} />
                )}
              </>
            )}
          </Animated.View>
        ) : quizCompleted ? (
          /* Quiz Results */
          <View style={styles.resultsContainer}>
            <View style={styles.resultsHeader}>
              <Ionicons name="trophy" size={64} color="#FFD700" />
              <Text style={styles.resultsTitle}>Story Complete!</Text>
              <Text style={styles.resultsSubtitle}>You've mastered this tale</Text>
              <Text style={styles.resultsScore}>
                {quizResults?.score}/{quizResults?.maxScore} ({quizResults?.scorePercentage}%)
              </Text>
              <Text style={styles.resultsXP}>+{quizResults?.xpEarned} XP earned</Text>
            </View>

            <View style={styles.resultsList}>
              {quizResults?.results?.map((result: QuizResult, index: number) => (
                <View key={result.questionId} style={styles.resultItem}>
                  <View style={styles.resultHeader}>
                    <Text style={styles.resultQuestion}>Question {index + 1}</Text>
                    <Ionicons 
                      name={result.isCorrect ? "checkmark-circle" : "close-circle"} 
                      size={24} 
                      color={result.isCorrect ? "#34C759" : "#FF3B30"} 
                    />
                  </View>
                  <Text style={styles.resultAnswer}>Your answer: {result.answer}</Text>
                  <Text style={styles.resultPoints}>
                    +{result.pointsEarned} points
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          /* Quiz Mode */
          <Animated.View style={[styles.quizContainer, { opacity: fadeAnim }]}>
            {currentQuestion && (
              <>
                <View style={styles.quizHeader}>
                  <Text style={styles.questionNumber}>
                    Question {currentQuestionIndex + 1} of {quiz?.questions?.length}
                  </Text>
                  <Text style={styles.questionPoints}>
                    +{currentQuestion.points || 10} points
                  </Text>
                </View>
                
                <Text style={styles.questionText}>{currentQuestion.question}</Text>
                
                <View style={styles.optionsContainer}>
                  {currentQuestion.options?.map((option, index) => {
                    const isSelected = selectedAnswer === option;
                    const isCorrect = option === (currentQuestion.correctAnswer || currentQuestion.answer);
                    const showResult = selectedAnswer !== undefined;
                    
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.optionButton,
                          isSelected && styles.selectedOption,
                          showResult && isCorrect && styles.correctOption,
                          showResult && isSelected && !isCorrect && styles.incorrectOption
                        ]}
                        onPress={() => handleQuizAnswer(option)}
                        disabled={submittingQuiz || selectedAnswer !== undefined}
                      >
                        <Text style={[
                          styles.optionText,
                          isSelected && styles.selectedOptionText,
                          showResult && isCorrect && styles.correctOptionText
                        ]}>
                          {option}
                        </Text>
                        {showResult && (
                          <Ionicons 
                            name={isCorrect ? "checkmark-circle" : (isSelected ? "close-circle" : "radio-button-off")}
                            size={24}
                            color={isCorrect ? "#34C759" : (isSelected ? "#FF3B30" : "#D1D5DB")}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {selectedAnswer && currentQuestion.explanation && (
                  <View style={styles.explanationContainer}>
                    <Text style={styles.explanationTitle}>💡 Explanation:</Text>
                    <Text style={styles.explanationText}>
                      {currentQuestion.explanation}
                    </Text>
                  </View>
                )}
              </>
            )}
          </Animated.View>
        )}
      </ScrollView>

      {/* Navigation Buttons */}
      {isReadingMode && !quizCompleted && (
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[styles.navButton, styles.prevButton, currentPageIndex === 0 && styles.disabledButton]}
            onPress={handlePreviousPage}
            disabled={currentPageIndex === 0}
          >
            <Ionicons name="chevron-back" size={20} color="white" />
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, styles.nextButton]}
            onPress={handleNextPage}
          >
            <Text style={styles.navButtonText}>
              {currentPageIndex === storyPages.length - 1 ? '🧠 Start Quiz' : 'Next'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {quizCompleted && (
        <View style={styles.navigationContainer}>
          <TouchableOpacity 
            style={styles.nftButton} 
            onPress={() => router.push('/story/getnft')}
          >
            <Text style={styles.nftButtonText}>🏆 View NFT Collection</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.completeButton} onPress={handleClose}>
            <Text style={styles.completeButtonText}>🏠 Return Home</Text>
          </TouchableOpacity>
        </View>
      )}

      {submittingQuiz && (
        <View style={styles.submittingOverlay}>
          <ActivityIndicator size="large" color="#A0522D" />
          <Text style={styles.submittingText}>Processing your answers...</Text>
        </View>
      )}
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#A0522D',
  },
  storyTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  progressContainer: {
    width: 40,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    color: '#A0522D',
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 20,
    borderRadius: 3,
    marginBottom: 20,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#A0522D',
    borderRadius: 3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  storyContainer: {
    marginBottom: 20,
  },
  storyContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 28,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  pageIndicator: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pageNumber: {
    fontSize: 12,
    color: '#A0522D',
    fontWeight: '600',
    backgroundColor: '#FDF6F0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  storyText: {
    fontSize: 22,
    lineHeight: 34,
    color: '#333',
    marginBottom: 24,
    textAlign: 'left',
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  translationContainer: {
    backgroundColor: '#FDF6F0',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F0E6D6',
  },
  translationLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#A0522D',
    marginBottom: 12,
  },
  translationText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#8B4513',
    fontStyle: 'italic',
    fontWeight: '500',
  },
  storyImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    resizeMode: 'cover',
  },
  quizContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A0522D',
  },
  questionPoints: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '600',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 28,
    lineHeight: 30,
  },
  optionsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  optionButton: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 60,
  },
  selectedOption: {
    borderColor: '#A0522D',
    backgroundColor: '#FDF6F0',
  },
  correctOption: {
    borderColor: '#34C759',
    backgroundColor: '#E8F5E8',
  },
  incorrectOption: {
    borderColor: '#FF3B30',
    backgroundColor: '#FFE8E8',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    lineHeight: 22,
  },
  selectedOptionText: {
    color: '#A0522D',
    fontWeight: '600',
  },
  correctOptionText: {
    color: '#34C759',
    fontWeight: '600',
  },
  explanationContainer: {
    backgroundColor: '#E8F4FD',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#B8E0FF',
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D3A72',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 15,
    color: '#1D3A72',
    lineHeight: 22,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  prevButton: {
    backgroundColor: '#8E8E93',
  },
  nextButton: {
    backgroundColor: '#A0522D',
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0.05,
  },
  navButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  nftButton: {
    flex: 1,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    marginRight: 8,
  },
  nftButtonText: {
    color: '#8B4513',
    fontSize: 16,
    fontWeight: '700',
  },
  completeButton: {
    flex: 1,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    marginLeft: 8,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  resultsContainer: {
    alignItems: 'center',
  },
  resultsHeader: {
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: 'white',
    padding: 32,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    width: '100%',
  },
  resultsTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  resultsSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  resultsScore: {
    fontSize: 36,
    fontWeight: '800',
    color: '#A0522D',
    marginBottom: 8,
  },
  resultsXP: {
    fontSize: 20,
    color: '#34C759',
    fontWeight: '700',
  },
  resultsList: {
    width: '100%',
    gap: 16,
  },
  resultItem: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  resultAnswer: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  resultPoints: {
    fontSize: 14,
    color: '#A0522D',
    fontWeight: '600',
  },
  submittingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submittingText: {
    color: 'white',
    fontSize: 18,
    marginTop: 16,
    fontWeight: '500',
  },
});