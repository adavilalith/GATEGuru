import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertTodoSchema,
  insertTestAttemptSchema,
  insertChatMessageSchema,
} from "@shared/schema";
import { generateGeminiResponseWithHistory } from "./gemini";
import multer from 'multer';

// --- CONFIGURE MULTER FOR DISK STORAGE ---
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      // Set the destination folder for uploads
      // This path is relative to where your Node.js process starts (project root)
      cb(null, 'uploads/chat-images');
    },
    filename: (req, file, cb) => {
      // Create a unique filename to prevent collisions
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileExtension = file.originalname.split('.').pop();
      // Ensure the filename is safe for file systems
      cb(null, `${file.fieldname}-${uniqueSuffix}.${fileExtension}`);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // Max file size 10MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  }
});
export async function registerRoutes(app: Express): Promise<Server> {

  // User routes
  app.get("/api/user/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user =
       await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Todo routes
  app.get("/api/todos/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const todos = await storage.getTodosByUserId(userId);
      res.json(todos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch todos" });
    }
  });

  app.post("/api/todos", async (req, res) => {
    try {
      const todoData = insertTodoSchema.parse(req.body);
      const todo = await storage.createTodo(todoData);
      res.status(201).json(todo);
    } catch (error) {
      res.status(400).json({ message: "Invalid todo data" });
    }
  });

  app.patch("/api/todos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const todo = await storage.updateTodo(id, updates);
      if (!todo) {
        return res.status(404).json({ message: "Todo not found" });
      }
      res.json(todo);
    } catch (error) {
      res.status(500).json({ message: "Failed to update todo" });
    }
  });

  app.delete("/api/todos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTodo(id);
      if (!deleted) {
        return res.status(404).json({ message: "Todo not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete todo" });
    }
  });

  // News routes
  app.get("/api/news", async (req, res) => {
    try {
      const articles = await storage.getNewsArticles();
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });

  // Test routes
  app.get("/api/test/:testType/questions", async (req, res) => {
    try {
      const testType = req.params.testType;
      const limit = parseInt(req.query.limit as string) || 45;
      const questions = await storage.getTestQuestions(testType, limit);
      res.json(questions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch test questions" });
    }
  });

  app.post("/api/test/attempts", async (req, res) => {
    try {
      const attemptData = insertTestAttemptSchema.parse(req.body);
      const attempt = await storage.createTestAttempt(attemptData);
      res.status(201).json(attempt);
    } catch (error) {
      res.status(400).json({ message: "Invalid test attempt data" });
    }
  });

  app.get("/api/test/attempts/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const attempts = await storage.getUserTestAttempts(userId);
      res.json(attempts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch test attempts" });
    }
  });

  // Chat routes
  app.get("/api/chat/history", async (req, res) => {

    try {
      const userId = parseInt(req.query.userId as string);
      const chatId = req.query.chatId as string;
      const history = await storage.getChatHistory(userId, chatId);

      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });

  // --- THIS IS THE CORRECTLY SEPARATED CHAT MESSAGE ROUTE ---
  app.post("/api/chat", async (req, res) => {
    try {
      let { chatId, userId, message, uploadedImageUrl } = req.body;
      const history = await storage.getChatHistory(userId, chatId);

      if(message.substring(0,4)=="6336"){
        const parts = message.split("6336");
        const question = parts[2];
        const answer = parts[4];

        message = `explaining Question: ${question}`;
        const prompt = `Walk me through a step-by-step solution to the problem presented below.

                          Here's the structure I'm looking for:
                          1.  **Introduction**: Briefly state the problem and the overall approach.
                          2.  **Step-by-Step Solution**:
                              * **Step 1**: [Action] - [Explanation/Reasoning]
                              * **Step 2**: [Action] - [Explanation/Reasoning]
                              * ... (continue for all necessary steps)
                          3.  **Conclusion**: Summarize the key takeaway or verify the answer.

                          Question: ${question}
                          Answer: ${answer}`
        const response = await generateGeminiResponseWithHistory(prompt, history,uploadedImageUrl);
        const chatData = insertChatMessageSchema.parse({
          chatId,
          userId,
          message,
          response,
        });
        const chatMessage = await storage.createChatMessage(chatData);
        res.status(201).json(chatMessage);
      }else{
        const response = await generateGeminiResponseWithHistory(message, history,uploadedImageUrl);
        const chatData = insertChatMessageSchema.parse({
          chatId,
          userId,
          message,
          response,
        });
        const chatMessage = await storage.createChatMessage(chatData);
        res.status(201).json(chatMessage);
      }
    } catch (error) {
      res.status(400).json({ message: "Invalid chat message data" });
    }
  });

  app.post("/api/chat/uploadImage",  upload.single('image'), async (req, res) => {
    try {
      console.log("hi from /chat/upload-image");

      // The uploaded file information is now in req.file
      const uploadedFile = req.file;

      if (!uploadedFile) {
        console.log("no file");
        return res.status(400).json({ error: 'No file uploaded or invalid file type.' });
      }

      // The path will be relative to your server's root (e.g., 'uploads/chat-images/filename.jpg')
      const filePath = uploadedFile.path;
      const fileName = uploadedFile.filename;
      const originalName = uploadedFile.originalname;

      console.log('File uploaded to local storage:', filePath);

      // --- IMPORTANT: SERVE STATIC FILES ---
      // For the frontend to access these images, you need to serve them statically.
      // Add this line in your index.ts (or where you configure your main Express app)
      // app.use('/uploads', express.static('uploads'));
      // Then the URL for the frontend would be like /uploads/chat-images/your-image.jpg

      res.status(201).json({
        message: 'Image uploaded successfully to local storage',
        fileName: fileName,
        originalName: originalName,
        filePath: filePath, // Full path on the server (for debugging/logging)
        url: `/uploads/chat-images/${fileName}`, // URL for the frontend to access the image
      });

  } catch (error) {
    console.error('Error uploading image to local storage:', error);
    res.status(400).json({ message: "Failed to upload image or invalid data" });
  }
});
  

  const httpServer = createServer(app);
  return httpServer;
}