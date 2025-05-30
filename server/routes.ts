import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertTodoSchema,
  insertTestAttemptSchema,
  insertChatMessageSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get("/api/user/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Don't send password
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
      console.log("testType: ", testType);
      const limit = parseInt(req.query.limit as string) || 10;
      const questions = await storage.getTestQuestions("daily", limit);
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
  app.get("/api/chat/history/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const history = await storage.getChatHistory(userId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { userId, message } = req.body;

      // Simple chatbot response logic
      let response = "I'm here to help you with your studies! ";

      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes("test") || lowerMessage.includes("exam")) {
        response +=
          "For test preparation, I recommend reviewing your notes, practicing sample questions, and managing your time effectively during the test.";
      } else if (
        lowerMessage.includes("math") ||
        lowerMessage.includes("mathematics")
      ) {
        response +=
          "Mathematics can be challenging! Break down complex problems into smaller steps, practice regularly, and don't hesitate to ask for help when needed.";
      } else if (
        lowerMessage.includes("study") ||
        lowerMessage.includes("learning")
      ) {
        response +=
          "Effective studying involves active learning techniques like summarizing, creating flashcards, and teaching the material to someone else.";
      } else if (
        lowerMessage.includes("schedule") ||
        lowerMessage.includes("time")
      ) {
        response +=
          "Time management is crucial for academic success. Try creating a study schedule, setting specific goals, and taking regular breaks.";
      } else {
        response +=
          "That's an interesting question! Could you provide more details so I can give you a more specific answer?";
      }

      const chatData = insertChatMessageSchema.parse({
        userId,
        message,
        response,
      });

      const chatMessage = await storage.createChatMessage(chatData);
      res.status(201).json(chatMessage);
    } catch (error) {
      res.status(400).json({ message: "Invalid chat message data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
