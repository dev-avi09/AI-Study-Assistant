import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth, db } from '../../config/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

export default function ProfileScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState({ notesCount: 0, chatCount: 0, quizCount: 0 });
  const [email, setEmail] = useState('');

  useEffect(() => {
    let unsubscribe;
    if (auth.currentUser) {
      setEmail(auth.currentUser.email);
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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/');
    } catch (error) {
      Alert.alert('Error logging out', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Profile</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          <FontAwesome5 name="user-circle" size={80} color="#60a5fa" />
          <Text style={styles.emailText}>{email || "Not signed in"}</Text>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Activity Analytics</Text>
          
          <View style={styles.statRow}>
            <View style={styles.statIconBadge}>
              <FontAwesome5 name="file-upload" size={16} color="#60a5fa" />
            </View>
            <Text style={styles.statLabel}>Notes Uploaded</Text>
            <Text style={styles.statValue}>{userData.notesCount || 0}</Text>
          </View>

          <View style={styles.statRow}>
            <View style={styles.statIconBadge}>
              <FontAwesome5 name="comment-dots" size={16} color="#4ade80" />
            </View>
            <Text style={styles.statLabel}>Questions Asked</Text>
            <Text style={styles.statValue}>{userData.chatCount || 0}</Text>
          </View>

          <View style={styles.statRow}>
            <View style={styles.statIconBadge}>
              <FontAwesome5 name="brain" size={16} color="#a78bfa" />
            </View>
            <Text style={styles.statLabel}>Quiz Attempts</Text>
            <Text style={styles.statValue}>{userData.quizCount || 0}</Text>
          </View>
        </View>
        
        <View style={{flex: 1}} />

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <FontAwesome5 name="sign-out-alt" size={16} color="#ef4444" style={{marginRight: 8}} />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { padding: 24, paddingTop: 16, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  title: { fontFamily: 'Inter_700Bold', fontSize: 24, color: '#ffffff' },
  content: { flex: 1, padding: 24 },
  
  avatarContainer: { alignItems: 'center', marginBottom: 40, marginTop: 16 },
  emailText: { fontFamily: 'Inter_500Medium', fontSize: 18, color: '#e2e8f0', marginTop: 16 },
  
  statsContainer: { backgroundColor: '#1e293b', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#334155' },
  statsTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#94a3b8', marginBottom: 20 },
  statRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  statIconBadge: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  statLabel: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 16, color: '#ffffff' },
  statValue: { fontFamily: 'Inter_700Bold', fontSize: 18, color: '#ffffff' },

  logoutButton: { flexDirection: 'row', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: '#ef4444', padding: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  logoutButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#ef4444' }
});
