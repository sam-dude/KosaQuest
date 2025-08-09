import { StyleSheet, Text, View } from 'react-native';

export default function StoriesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stories</Text>
      <Text style={styles.subtitle}>Browse all available stories</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
});