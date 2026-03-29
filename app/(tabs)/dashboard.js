import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { auth, db } from '../../config/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function DashboardScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState({ notesCount: 0, quizCount: 0, name: '' });

  useEffect(() => {
    let unsubscribe;
    if (auth.currentUser) {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>Welcome back{userData.name ? `, ${userData.name}` : ''}.</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
             <FontAwesome5 name="book-reader" size={24} color="#60a5fa" style={{marginBottom: 8}}/>
             <Text style={styles.statNumber}>{userData.notesCount || 0}</Text>
             <Text style={styles.statLabel}>Notes Uploaded</Text>
          </View>
          <View style={styles.statCard}>
             <FontAwesome5 name="check-circle" size={24} color="#4ade80" style={{marginBottom: 8}}/>
             <Text style={styles.statNumber}>{userData.quizCount || 0}</Text>
             <Text style={styles.statLabel}>Quizzes Completed</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/upload')}>
          <View style={styles.actionIconContainer}>
            <FontAwesome5 name="file-upload" size={20} color="#ffffff" />
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>Upload Material</Text>
            <Text style={styles.actionDesc}>Upload PDFs or text for AI analysis.</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 40,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statNumber: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    color: '#ffffff',
  },
  statLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    color: '#ffffff',
    marginBottom: 16,
  },
  actionCard: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 4,
  },
  actionDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#94a3b8',
  },
});
