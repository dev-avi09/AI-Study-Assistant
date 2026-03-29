import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';

export default function UploadScreen() {
  const router = useRouter();
  const [textInput, setTextInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
      }
    } catch (err) {
      Alert.alert('Error picking document', err.message);
    }
  };

  const handleUpload = async () => {
    if (!textInput && !selectedFile) {
      Alert.alert('Error', 'Please enter some text or select a PDF to upload.');
      return;
    }
    
    try {
      const registerUploadFunc = httpsCallable(functions, 'registerUpload');
      await registerUploadFunc();
    } catch (e) {
      console.error("Function Error:", e);
    }

    Alert.alert('Success', 'Content uploaded successfully!');
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <FontAwesome5 name="arrow-left" size={20} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Upload Material</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>PDF Document</Text>
        <TouchableOpacity style={styles.uploadArea} onPress={handleFilePick}>
          <FontAwesome5 name={selectedFile ? "file-pdf" : "cloud-upload-alt"} size={32} color={selectedFile ? "#ef4444" : "#64748b"} style={styles.uploadIcon} />
          {selectedFile ? (
            <View>
              <Text style={styles.fileName}>{selectedFile.name}</Text>
              <Text style={styles.fileSize}>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</Text>
            </View>
          ) : (
            <View>
              <Text style={styles.uploadTitle}>Tap to select a PDF</Text>
              <Text style={styles.uploadDesc}>Maximum file size 10MB</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <Text style={styles.sectionLabel}>Paste Text</Text>
        <TextInput
          style={styles.textInputArea}
          multiline
          placeholder="Paste your study notes or text here..."
          placeholderTextColor="#64748b"
          value={textInput}
          onChangeText={setTextInput}
          textAlignVertical="top"
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleUpload}>
          <Text style={styles.submitButtonText}>Upload</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
    marginLeft: -8,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    color: '#ffffff',
  },
  content: {
    padding: 24,
  },
  sectionLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#e2e8f0',
    marginBottom: 12,
  },
  uploadArea: {
    backgroundColor: '#1e293b',
    borderWidth: 2,
    borderColor: '#334155',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  uploadIcon: {
    marginBottom: 16,
  },
  uploadTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  uploadDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  fileName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  fileSize: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#334155',
  },
  dividerText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#64748b',
    paddingHorizontal: 16,
  },
  textInputArea: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 16,
    padding: 16,
    color: '#ffffff',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    height: 200,
    marginBottom: 32,
  },
  submitButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#0f172a',
    fontSize: 16,
  },
});
