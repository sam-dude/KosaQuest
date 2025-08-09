import { useOnboarding } from '@/contexts/OnboardingContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Language = {
  code: string;
  name: string;
  description: string;
  flag: any;
};

const languages: Language[] = [
  {
    code: 'yoruba',
    name: 'Yoruba',
    description: 'Spoken in Nigeria, Benin, Togo',
    flag: require('../../assets/images/nigeria-flag.png'),
  },
  {
    code: 'igbo',
    name: 'Igbo',
    description: 'Spoken in Southeastern Nigeria',
    flag: require('../../assets/images/nigeria-flag.png'),
  },
  {
    code: 'hausa',
    name: 'Hausa',
    description: 'Spoken in Northern Nigeria, Niger',
    flag: require('../../assets/images/nigeria-flag.png'),
  },
];

export default function LanguageSelection() {
  const [selectedLanguage, setSelectedLanguageLocal] = useState<string | null>(null);
  const { setSelectedLanguage } = useOnboarding(); // Get the context function

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguageLocal(languageCode);
  };

  const handleContinue = async () => {
    if (selectedLanguage) {
      // Save the selected language to context
      await setSelectedLanguage(selectedLanguage);
      router.push('/onboarding/proficiency');
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Language</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>KosaQuest XP Quest</Text>
          <Text style={styles.subtitle}>
            Choose your language to begin your cultural learning journey.
          </Text>
        </View>

        <View style={styles.languageList}>
          {languages.map((language) => (
            <TouchableOpacity
              key={language.code}
              style={[
                styles.languageOption,
                selectedLanguage === language.code && styles.selectedOption,
              ]}
              onPress={() => handleLanguageSelect(language.code)}
            >
              <View style={styles.languageContent}>
                <Image source={language.flag} style={styles.flagImage} />
                <View style={styles.languageInfo}>
                  <Text style={[
                    styles.languageName,
                    selectedLanguage === language.code && styles.selectedText
                  ]}>
                    {language.name}
                  </Text>
                  <Text style={[
                    styles.languageDescription,
                    selectedLanguage === language.code && styles.selectedDescriptionText
                  ]}>
                    {language.description}
                  </Text>
                </View>
              </View>
              <View style={[
                styles.radioButton,
                selectedLanguage === language.code && styles.radioSelected
              ]}>
                {selectedLanguage === language.code && (
                  <Ionicons name="checkmark" size={14} color="white" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedLanguage && styles.disabledButton
          ]}
          onPress={handleContinue}
          disabled={!selectedLanguage}
        >
          <Text style={[
            styles.continueButtonText,
            !selectedLanguage && styles.disabledButtonText
          ]}>
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  languageList: {
    gap: 16,
  },
  languageOption: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: '#FDF6F0', // Light brown/cream background
    borderColor: '#A0522D',
    shadowColor: '#A0522D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flagImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  selectedText: {
    color: '#A0522D', // Brown color for selected text
  },
  languageDescription: {
    fontSize: 14,
    color: '#666',
  },
  selectedDescriptionText: {
    color: '#8B4513', // Darker brown for selected description
  },
  radioButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  radioSelected: {
    borderColor: '#A0522D',
    backgroundColor: '#A0522D',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  continueButton: {
    backgroundColor: '#A0522D',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#A0522D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
    shadowColor: '#000',
    shadowOpacity: 0.1,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  disabledButtonText: {
    color: '#9CA3AF',
  },
});