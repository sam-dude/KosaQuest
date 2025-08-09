import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type OnboardingContextValue = {
  isOnboardingComplete: boolean;
  setOnboardingComplete: (complete: boolean) => void;
  selectedLanguage: string | null;
  selectedProficiency: string | null;
  setSelectedLanguage: (language: string) => void;
  setSelectedProficiency: (proficiency: string) => void;
  setLanguagePreferences: (language: string, proficiency: string) => void;
};

const OnboardingContext = createContext<OnboardingContextValue>({
  isOnboardingComplete: false,
  setOnboardingComplete: () => {},
  selectedLanguage: null,
  selectedProficiency: null,
  setSelectedLanguage: () => {},
  setSelectedProficiency: () => {},
  setLanguagePreferences: () => {},
});

interface OnboardingProviderProps {
  children: ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedProficiency, setSelectedProficiency] = useState<string | null>(null);

  useEffect(() => {
    // Load stored onboarding data on app start
    loadOnboardingData();
  }, []);

  const loadOnboardingData = async () => {
    try {
      const data = await AsyncStorage.getItem('onboarding_data');
      if (data) {
        const { selectedLanguage: language, selectedProficiency: proficiency } = JSON.parse(data);
        setSelectedLanguage(language);
        setSelectedProficiency(proficiency);
      }
    } catch (error) {
      console.error('Error loading onboarding data:', error);
    }
  };

  const setLanguagePreferences = async (language: string, proficiency: string) => {
    setSelectedLanguage(language);
    setSelectedProficiency(proficiency);
    
    // Store preferences
    await AsyncStorage.setItem('onboarding_data', JSON.stringify({
      selectedLanguage: language,
      selectedProficiency: proficiency,
    }));
  };

  const updateLanguage = async (language: string) => {
    setSelectedLanguage(language);
    await AsyncStorage.setItem('onboarding_data', JSON.stringify({
      selectedLanguage: language,
      selectedProficiency,
    }));
  };

  const updateProficiency = async (proficiency: string) => {
    setSelectedProficiency(proficiency);
    await AsyncStorage.setItem('onboarding_data', JSON.stringify({
      selectedLanguage,
      selectedProficiency: proficiency,
    }));
  };

  const value = {
    isOnboardingComplete,
    setIsOnboardingComplete,
    selectedLanguage,
    selectedProficiency,
    setSelectedLanguage: updateLanguage,
    setSelectedProficiency: updateProficiency,
    setLanguagePreferences,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};