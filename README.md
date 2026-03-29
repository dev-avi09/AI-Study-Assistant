# AI Study Assistant 📱🤖

AI Study Assistant is a full-stack mobile application that enhances the learning experience by transforming study notes into interactive AI-driven insights, quizzes, and analytics.

## 🚀 Features

* **Notes Upload** – Add study material via text or PDF
* **AI Chat** – Context-aware Q&A powered by OpenAI
* **Quiz Generator** – Auto-generate MCQs with scoring
* **Analytics Dashboard** – Track learning activity and progress
* **Authentication** – Secure user login via Firebase

## 🛠 Tech Stack

* **Frontend:** React Native (Expo)
* **Backend:** Firebase (Auth, Firestore, Cloud Functions)
* **AI Integration:** OpenAI API

## ⚙️ Setup

```bash
git clone https://github.com/dev-avi09/AI-Study-Assistant.git
cd AI-Study-Assistant
npm install
npx expo start
```

## 🔑 Environment Configuration

Create a `.env` file and configure:

* Firebase project credentials
* OpenAI API key (used in Cloud Functions)

## 📦 Build (Android APK)

```bash
eas build -p android --profile preview
```

## 🧩 Architecture Overview

The application follows a modular full-stack architecture:

* **Client (Expo App)** handles UI and user interactions
* **Firebase** manages authentication, database, and serverless functions
* **Cloud Functions** securely communicate with the OpenAI API

## 📌 Notes

* AI responses are generated based on provided note context
* Current implementation uses mock note parsing (extensible to real PDF parsing)

---

This project demonstrates full-stack mobile development, AI integration, and scalable architecture design.
