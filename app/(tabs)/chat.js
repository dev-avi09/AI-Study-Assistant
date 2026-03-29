import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { httpsCallable } from 'firebase/functions';
import { functions, db, auth } from '../../config/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';

export default function ChatScreen() {
  const [messages, setMessages] = useState([
    { id: '1', role: 'assistant', content: 'Hi! Ask me anything about the uploaded notes.' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg = { id: Date.now().toString(), role: 'user', content: inputText.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const askAIFunc = httpsCallable(functions, 'askAI');
      const response = await askAIFunc({ question: userMsg.content });
      
      if (!response || !response.data || !response.data.content) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'Error getting response' }]);
        return;
      }

      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: response.data.role || 'assistant',
        content: response.data.content
      };
      
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'Error getting response' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>{item.content}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Study Assistant</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatList}
      />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#60a5fa" />
          <Text style={styles.loadingText}>Thinking...</Text>
        </View>
      )}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask a question based on notes..."
          placeholderTextColor="#64748b"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={isLoading}>
          <FontAwesome5 name="paper-plane" size={18} color="#0f172a" />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { padding: 24, paddingTop: 16, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  title: { fontFamily: 'Inter_600SemiBold', fontSize: 20, color: '#ffffff' },
  chatList: { padding: 16, gap: 12, paddingBottom: 32 },
  messageBubble: { maxWidth: '80%', padding: 14, borderRadius: 16 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#60a5fa', borderBottomRightRadius: 4 },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderBottomLeftRadius: 4 },
  messageText: { fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 22 },
  userText: { color: '#0f172a' },
  aiText: { color: '#e2e8f0' },
  loadingContainer: { flexDirection: 'row', padding: 16, alignItems: 'center', gap: 8 },
  loadingText: { fontFamily: 'Inter_400Regular', color: '#94a3b8', fontSize: 14 },
  inputContainer: { flexDirection: 'row', padding: 16, borderTopWidth: 1, borderTopColor: '#1e293b', backgroundColor: '#0f172a', gap: 12, alignItems: 'center' },
  textInput: { flex: 1, backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, color: '#ffffff', fontFamily: 'Inter_400Regular', fontSize: 16 },
  sendButton: { backgroundColor: '#ffffff', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
});
