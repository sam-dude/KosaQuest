import { useOnboarding } from '@/contexts/OnboardingContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type ProficiencyLevel = {
  code: string;
  name: string;
  description: string;
};

const proficiencyLevels: ProficiencyLevel[] = [
  {
    code: 'beginner',
    name: 'Beginner',
    description: 'New to the language, starting from basics',
  },
  {
    code: 'intermediate',
    name: 'Intermediate',
    description: 'Some knowledge, can understand basic conversations',
  },
  {
    code: 'advanced',
    name: 'Advanced',
    description: 'Fluent speaker, looking to refine skills',
  },
];

export default function ProficiencySelection() {
  const [selectedProficiency, setSelectedProficiency] = useState<string | null>(null);
  const { selectedLanguage, setSelectedProficiency: saveSelectedProficiency } = useOnboarding();

  const handleProficiencySelect = (proficiencyCode: string) => {
    setSelectedProficiency(proficiencyCode);
  };

  const handleContinue = () => {
    if (selectedProficiency && selectedLanguage) {
      // Save the proficiency to context
      saveSelectedProficiency(selectedProficiency);
      router.push('/onboarding/signup');
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
        <Text style={styles.headerTitle}>Select Proficiency</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>What's your proficiency level?</Text>
          <Text style={styles.subtitle}>
            This helps us customize your learning experience and provide appropriate content.
          </Text>
        </View>

        <View style={styles.proficiencyList}>
          {proficiencyLevels.map((level) => (
            <TouchableOpacity
              key={level.code}
              style={[
                styles.proficiencyOption,
                selectedProficiency === level.code && styles.selectedOption,
              ]}
              onPress={() => handleProficiencySelect(level.code)}
            >
              <View style={styles.proficiencyContent}>
                <View style={styles.levelInfo}>
                  <Text style={[
                    styles.levelName,
                    selectedProficiency === level.code && styles.selectedText
                  ]}>
                    {level.name}
                  </Text>
                  <Text style={[
                    styles.levelDescription,
                    selectedProficiency === level.code && styles.selectedDescriptionText
                  ]}>
                    {level.description}
                  </Text>
                </View>
              </View>
              <View style={[
                styles.radioButton,
                selectedProficiency === level.code && styles.radioSelected
              ]}>
                {selectedProficiency === level.code && (
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
            !selectedProficiency && styles.disabledButton
          ]}
          onPress={handleContinue}
          disabled={!selectedProficiency}
        >
          <Text style={[
            styles.continueButtonText,
            !selectedProficiency && styles.disabledButtonText
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
    fontSize: 28,
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
  proficiencyList: {
    gap: 16,
  },
  proficiencyOption: {
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
  proficiencyContent: {
    flex: 1,
  },
  levelInfo: {
    flex: 1,
  },
  levelName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  selectedText: {
    color: '#A0522D', // Brown color for selected text
  },
  levelDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
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