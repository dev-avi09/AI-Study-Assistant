import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { httpsCallable } from 'firebase/functions';
import { functions, db, auth } from '../../config/firebase'; // Adjust path
import { doc, updateDoc, increment } from 'firebase/firestore';
import { FontAwesome5 } from '@expo/vector-icons';

export default function QuizScreen() {
  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateQuiz = async () => {
    setIsLoading(true);
    setQuiz([]);
    setAnswers({});
    setScore(null);
    try {
      const generateQuizFunc = httpsCallable(functions, 'generateQuiz');
      const response = await generateQuizFunc();
      
      const quizData = response.data;
      if (Array.isArray(quizData) && quizData.length > 0) {
        setQuiz(quizData);
      } else {
        throw new Error('Received invalid quiz format');
      }
    } catch (error) {
      console.error("Quiz Error:", error);
      Alert.alert('Error', 'Failed to generate quiz. Ensure your AI functions are deployed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (qIndex, option) => {
    if (score !== null) return; // Prevent changing after submission
    setAnswers(prev => ({ ...prev, [qIndex]: option }));
  };

  const submitQuiz = () => {
    if (Object.keys(answers).length < quiz.length) {
      Alert.alert('Incomplete', 'Please answer all questions before submitting.');
      return;
    }
    
    let correct = 0;
    quiz.forEach((q, index) => {
      if (answers[index] === q.answer) {
        correct++;
      }
    });

    setScore(correct);
  };

  const getOptionStyle = (qIndex, option, qAnswer) => {
    const isSelected = answers[qIndex] === option;
    
    if (score === null) {
      // Not submitted yet
      return isSelected ? styles.optionSelected : styles.optionDefault;
    }
    
    // Submitted (Review mode)
    const isCorrectAnswer = option === qAnswer;
    
    if (isCorrectAnswer) {
      return styles.optionCorrect;
    }
    if (isSelected && !isCorrectAnswer) {
      return styles.optionIncorrect;
    }
    return styles.optionDefault;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
         <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#60a5fa" />
            <Text style={styles.loadingText}>Generating your personalized quiz...</Text>
            <Text style={styles.subLoadingText}>Using hardcoded notes.</Text>
         </View>
      </SafeAreaView>
    );
  }

  if (quiz.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
         <View style={styles.centerContent}>
            <FontAwesome5 name="brain" size={64} color="#334155" style={{marginBottom: 24}} />
            <Text style={styles.title}>Test your knowledge</Text>
            <Text style={styles.subtitle}>Click below to generate a quiz based on your hardcoded notes.</Text>
            <TouchableOpacity style={styles.generateButton} onPress={generateQuiz}>
              <Text style={styles.generateButtonText}>Generate Quiz</Text>
            </TouchableOpacity>
         </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
            <Text style={styles.title}>Your Quiz</Text>
        </View>
        
        {score !== null && (
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>You scored: {score} / {quiz.length}</Text>
          </View>
        )}

        {quiz.map((q, qIndex) => (
          <View key={qIndex} style={styles.questionContainer}>
             <Text style={styles.questionText}>
               {qIndex + 1}. {q.question}
             </Text>
             <View style={styles.optionsList}>
               {q.options.map((option, oIndex) => (
                 <TouchableOpacity 
                    key={oIndex} 
                    style={[styles.optionButton, getOptionStyle(qIndex, option, q.answer)]}
                    onPress={() => handleSelectOption(qIndex, option)}
                    activeOpacity={0.7}
                    disabled={score !== null}
                  >
                   <Text style={[styles.optionText, 
                        score !== null && option === q.answer ? styles.optionTextCorrect : null,
                        score !== null && answers[qIndex] === option && answers[qIndex] !== q.answer ? styles.optionTextIncorrect : null
                   ]}>
                     {option}
                   </Text>
                 </TouchableOpacity>
               ))}
             </View>
          </View>
        ))}

        {score === null ? (
          <TouchableOpacity style={styles.submitButton} onPress={submitQuiz}>
            <Text style={styles.submitButtonText}>Submit Quiz</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.submitButton} onPress={() => {setQuiz([]); setScore(null); setAnswers({});}}>
            <Text style={styles.submitButtonText}>Back to Generator</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  loadingText: { fontFamily: 'Inter_500Medium', fontSize: 18, color: '#e2e8f0', marginTop: 24, textAlign: 'center' },
  subLoadingText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#64748b', marginTop: 8 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 28, color: '#ffffff', textAlign: 'center', marginBottom: 12 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 16, color: '#94a3b8', textAlign: 'center', marginBottom: 32, lineHeight: 24 },
  generateButton: { backgroundColor: '#60a5fa', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 16 },
  generateButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#0f172a' },
  
  scrollContent: { padding: 24, paddingBottom: 40 },
  header: { marginBottom: 24 },
  scoreContainer: { backgroundColor: '#1e293b', padding: 20, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
  scoreText: { fontFamily: 'Inter_700Bold', fontSize: 24, color: '#4ade80' },
  
  questionContainer: { marginBottom: 32 },
  questionText: { fontFamily: 'Inter_600SemiBold', fontSize: 18, color: '#ffffff', marginBottom: 16, lineHeight: 26 },
  optionsList: { gap: 12 },
  
  optionButton: { padding: 16, borderRadius: 12, borderWidth: 1 },
  optionDefault: { backgroundColor: '#1e293b', borderColor: '#334155' },
  optionSelected: { backgroundColor: 'rgba(96, 165, 250, 0.1)', borderColor: '#60a5fa' },
  optionCorrect: { backgroundColor: 'rgba(74, 222, 128, 0.1)', borderColor: '#4ade80' },
  optionIncorrect: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: '#ef4444' },
  
  optionText: { fontFamily: 'Inter_500Medium', fontSize: 16, color: '#e2e8f0' },
  optionTextCorrect: { color: '#4ade80' },
  optionTextIncorrect: { color: '#ef4444' },
  
  submitButton: { backgroundColor: '#ffffff', paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginTop: 16 },
  submitButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#0f172a' },
});
