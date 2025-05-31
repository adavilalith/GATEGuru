// src/services/gemini.ts
import { GoogleGenerativeAI, ChatSession, GenerativeModel, Content, Part } from '@google/generative-ai';
import fs from 'fs/promises'; // Import Node.js File System Promises API
import mime from 'mime-types'; // Import mime-types to guess MIME type from file path

// --- WARNING: DO NOT HARDCODE API KEY IN PRODUCTION. USE ENVIRONMENT VARIABLES! ---
const GEMINI_API_KEY = "AIzaSyDaWW36W4gE7LxAoFuuAcFdRC4UhBsnQmw"; // Your actual API key

if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not set. Please set it in your environment variables.');
  process.exit(1); // Exit if the API key is not found
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const system_prompt =`You are an expert AI-powered study buddy specializing in the Graduate Aptitude Test in Engineering (GATE) Computer Science (CS) and Information Technology (IT) syllabus for India. Your goal is to help students prepare effectively, understand concepts deeply, and practice for the exam.

**Your core responsibilities are:**

1.  **Subject Matter Expert:** Provide accurate, concise, and clear explanations for all topics within the GATE CS syllabus (e.g., Data Structures, Algorithms, Operating Systems, Computer Networks, Database Management Systems, Theory of Computation, Compiler Design, Digital Logic, Computer Organization and Architecture, Engineering Mathematics, Discrete Mathematics, General Aptitude).
2.  **Clarification and Elaboration:** Break down complex concepts into simpler terms. Use analogies and real-world examples when appropriate to aid understanding.
3.  **Problem-Solving Focus:** Help solve GATE-level problems step-by-step. Guide the user to the solution rather than just providing it. Explain the logic and formulas used.
4.  **Conceptual Understanding:** Don't just answer questions; ensure the user grasps the underlying principles. If a user asks a factual question, briefly explain the context or relevance.
5.  **Study Guidance:** Offer tips on study strategies, time management, and effective revision techniques specifically for the GATE exam.
6.  **Exam-Oriented Responses:** Frame explanations and examples in a way that is relevant to GATE questions (e.g., typical question patterns, common pitfalls).
7.  **Adaptive Learning:** If a user struggles, identify potential knowledge gaps and suggest foundational topics to review.
8.  **Strictly Academic:** Focus solely on GATE CS preparation. Do not engage in casual conversation, provide personal opinions, or discuss topics outside the GATE syllabus.
9.  **Maintain Professionalism:** Your tone should be encouraging, patient, and knowledgeable.
10. **Concise and Direct:** Provide clear, to-the-point answers without unnecessary verbosity.

**When a user asks a question, consider:**

* What specific GATE CS topic does this relate to?
* What is the core concept being tested?
* How can I explain this most effectively for GATE preparation?
* Should I offer a follow-up question or related practice problem?

**Avoid:**

* Giving direct answers to practice problems without prompting the user for their approach first.
* Chatting about personal life or non-academic topics.
* Making assumptions about the user's knowledge without clarification.
`
// Define the model globally
const model: GenerativeModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash", // Or "gemini-1.5-pro", or "gemini-pro-vision"
  systemInstruction: {
    role: "model",
    parts: [
      { text: system_prompt }
    ]
  }
});

// --- Type Definition for your ChatMessage from the database ---
// This is important for fetching past messages.
// Make sure it matches your Drizzle `ChatMessage` type.
interface ChatMessageFromDB {
    chatId: string;
    id: number;
    userId: number;
    message?: string;
    response?: string;
    imageUrl?: string | null; // Added imageUrl
    createdAt: Date | null;
}

/**
 * Helper function to read a local image file and convert it to a Part object.
 * @param imagePath The local file system path to the image.
 * @returns A Promise that resolves to a Gemini Part object for inlineData, or null if conversion fails.
 */
async function fileToGenerativePart(imagePath: string): Promise<Part | null> {
  try {
    const data = await fs.readFile(imagePath);
    const mimeType = mime.lookup(imagePath); // Guess MIME type from file extension

    if (!mimeType) {
      console.warn(`Could not determine MIME type for ${imagePath}. Skipping image.`);
      return null;
    }

    if (!mimeType.startsWith('image/')) {
        console.warn(`File ${imagePath} has unsupported MIME type ${mimeType}. Skipping image.`);
        return null;
    }

    return {
      inlineData: {
        data: data.toString('base64'),
        mimeType
      },
    };
  } catch (error) {
    console.error(`Error reading or processing image file ${imagePath}:`, error);
    return null;
  }
}

/**
 * Converts database chat messages into the Gemini API's history format,
 * now supporting image parts if `imageUrl` is present in the DB message.
 */
async function formatHistoryForGemini(dbMessages: ChatMessageFromDB[]): Promise<Content[]> {
  const history: Content[] = [];

  for (const msg of dbMessages) {
    const userParts: Part[] = [];
    const modelParts: Part[] = [];

    // Process user's message
    if (msg.message) {
      userParts.push({ text: msg.message });
    }
    // If there's an imageUrl for the user's message, convert it
    if (msg.imageUrl) {
      const imagePart = await fileToGenerativePart(msg.imageUrl);
      if (imagePart) {
        userParts.push(imagePart);
      }
    }

    // Add user turn if it has any parts
    if (userParts.length > 0) {
      history.push({
        role: 'user',
        parts: userParts
      });
    }

    // Process model's response (assumed text-only for now)
    if (msg.response) {
      modelParts.push({ text: msg.response });
    }

    // Add model turn if it has any parts
    if (modelParts.length > 0) {
      history.push({
        role: 'model',
        parts: modelParts
      });
    }
  }
  return history;
}

/**
 * Generates a Gemini response, incorporating previous chat history and optional image/text.
 *
 * @param currentPromptText The user's new text message.
 * @param pastMessages A sorted array of previous chat messages from your database.
 * @param currentImageUrl Optional: Local file system path to the image for the current turn.
 * @returns The Gemini model's response.
 */
export async function generateGeminiResponseWithHistory(
  currentPromptText: string,
  pastMessages: ChatMessageFromDB[], // Array of messages fetched from your DB
  currentImageUrl?: string | null // Accepts a local file path
): Promise<string> {
  try {
    // 1. Prepare the current user's prompt parts (text + optional image)
    const currentUserPromptParts: Part[] = [{ text: currentPromptText }];

    if (currentImageUrl) {
      const currentImagePart = await fileToGenerativePart(currentImageUrl);
      if (currentImagePart) {
        currentUserPromptParts.push(currentImagePart);
      }
    }

    // 2. Format the past messages into Gemini's expected history format
    // This is now an async call because it reads files
    const history = await formatHistoryForGemini(pastMessages);
    let prev_data="previous chat logs"
    let i=0
    for(const msg of pastMessages){
      if(i>10){
        break
      }
      prev_data+="#"+msg.message+"#"+msg.response
      i++
    }

    console.log(history)

    // 3. Start a new chat session with the loaded history
    const chat: ChatSession = model.startChat({
      history: history,
      // You can add generation config or safety settings here if needed
    });

    // 4. Send the current multimodal prompt.
    const result = await chat.sendMessage(`${prev_data} the prev context should be hidden from user current prompt ${currentUserPromptParts}`); // Pass the array of Parts
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('Error generating multimodal content from Gemini API:', error);
    if (error instanceof Error) {
        throw new Error(`Failed to get response from AI model: ${error.message}`);
    }
    throw new Error("Failed to get response from AI model. An unknown error occurred.");
  }
}

// Keeping the single-turn function for completeness, though multimodal is primary focus.
export async function generateSingleTurnGeminiResponse(prompt: string): Promise<string> {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error('Error generating content from Gemini API (single turn):', error);
    throw new Error("Failed to get response from AI model.");
  }
}