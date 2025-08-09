import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { router } from 'expo-router';
import { useEffect } from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function OnboardingWelcome() {
  const { isAuthenticated, isLoading } = useAuth();
  const { isOnboardingComplete } = useOnboarding();

  // Check if user is already authenticated and redirect appropriately
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, isLoading]);

  const handleGetStarted = () => {
    if (isOnboardingComplete) {
      router.push('/onboarding/signup');
    } else {
      router.push('/onboarding/language');
    }
  };

  const handleLogin = () => {
    router.push('/onboarding/login');
  };

  if (isLoading) {
    return (
      <View style={[styles.backgroundImage, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ImageBackground 
      source={require('../assets/images/cultural-background.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <View style={styles.overlay}>
          <View style={styles.content}>
            {/* Text Content */}
            <View style={styles.textContainer}>
              <Text style={styles.title}>
                Embark on a Cultural{'\n'}Language Journey
              </Text>
              <Text style={styles.subtitle}>
                Discover the beauty of indigenous languages through gamified quests. Earn rewards as you learn, connect with your heritage, and help preserve cultural knowledge.
              </Text>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.getStartedButton}
              onPress={handleGetStarted}
            >
              <Text style={styles.getStartedButtonText}>Get Started</Text>
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={handleLogin}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(245, 245, 245, 0.74)',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    fontSize: 18,
    color: '#A0522D',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    paddingTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#A0522D',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: '#4A4A4A',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontWeight: '600',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  getStartedButton: {
    backgroundColor: '#A0522D',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  getStartedButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
    color: '#4A4A4A',
    fontWeight: '500',
  },
  loginLink: {
    fontSize: 16,
    color: '#A0522D',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});