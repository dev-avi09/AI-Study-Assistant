const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { OpenAI } = require("openai");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

// Hardcoded note content based on user instruction
const noteContent = "Java is an object-oriented programming language..."; 
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Initialize OpenAI client (if key exists)
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

exports.askAI = onCall({ cors: true }, async (request) => {
  try {
    const data = request.data;
    const userQuestion = data.question;

    if (!userQuestion) {
      throw new HttpsError("invalid-argument", "The function requires a 'question' argument.");
    }

    if (!openai) {
      throw new HttpsError("failed-precondition", "OpenAI API key is missing. Set OPENAI_API_KEY environment variable in Firebase Functions.");
    }

    const trimmedNotes = noteContent.slice(0, 2000);

    const systemPrompt = `You are an AI study assistant.

Answer ONLY using the provided notes.
If the answer is not present, say: "Not found in notes".

Explain in simple terms suitable for a student.
Keep answers clear and structured

Notes:
${trimmedNotes}

Question:
${userQuestion}`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userQuestion }
      ]
    });

    const answer = response.choices[0].message.content;

    if (request.auth) {
      await db.collection('users').doc(request.auth.uid).update({ chatCount: admin.firestore.FieldValue.increment(1) }).catch(console.error);
    }

    return {
      role: "assistant",
      content: answer
    };

  } catch (error) {
    console.error("OpenAI Error:", error);
    // Return a clean error message to the client instead of a strict 500 error if it's an OpenAI API error
    throw new HttpsError("internal", error.message || "An error occurred while calling OpenAI.");
  }
});

exports.generateQuiz = onCall({ cors: true }, async () => {
  try {
    if (!openai) {
      throw new HttpsError("failed-precondition", "OpenAI API key is missing.");
    }
    
    const trimmedNotes = noteContent.slice(0, 2000);

    const systemPrompt = `You are an AI that generates quizzes.

Based on the provided notes, generate 5 multiple choice questions.

Rules:
- Each question must have 4 options
- Only one correct answer
- Keep questions clear and simple
- Return ONLY valid JSON (no extra text)

Format:
[
  {
    "question": "string",
    "options": ["A", "B", "C", "D"],
    "answer": "correct option text"
  }
]

Notes:
${trimmedNotes}`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt }
      ]
    });

    const answerStr = response.choices[0].message.content;
    let quizData;
    try {
      quizData = JSON.parse(answerStr);
    } catch (e) {
      console.error("Failed to parse JSON:", answerStr);
      // Fallback manual extract if there was backticks
      const match = answerStr.match(/\[[\s\S]*\]/);
      if (match) {
        quizData = JSON.parse(match[0]);
      } else {
        throw new HttpsError("internal", "Failed to generate valid quiz format.");
      }
    }

    if (request.auth) {
      await db.collection('users').doc(request.auth.uid).update({ quizCount: admin.firestore.FieldValue.increment(1) }).catch(console.error);
    }

    return quizData;

  } catch (error) {
    console.error("Quiz Error:", error);
    throw new HttpsError("internal", error.message || "An error occurred while generating quiz.");
  }
});

exports.registerUpload = onCall({ cors: true }, async (request) => {
  try {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be logged in.");
    }
    await db.collection('users').doc(request.auth.uid).update({ notesCount: admin.firestore.FieldValue.increment(1) });
    return { success: true };
  } catch (error) {
    console.error("Upload Error:", error);
    throw new HttpsError("internal", "Failed to register upload.");
  }
});
