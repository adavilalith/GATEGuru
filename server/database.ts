import { MongoClient, Db, Collection, ObjectId } from "mongodb";
import type {
  User,
  Todo,
  NewsArticle,
  TestQuestion,
  TestAttempt,
  ChatMessage,
  InsertUser,
  InsertTodo,
  InsertTestAttempt,
  InsertChatMessage,
} from "@shared/schema";

const MONGODB_URI =
  "mongodb+srv://lalithadavi:lalithadavi@cluster0.6ixze.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const DATABASE_NAME = "gate_csit_app";

class MongoDatabase {
  private client: MongoClient;
  private db: Db | null = null;

  constructor() {
    this.client = new MongoClient(MONGODB_URI);
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      this.db = this.client.db(DATABASE_NAME);
      console.log("Connected to MongoDB successfully");

      // Initialize collections with sample data if they're empty
      await this.initializeCollections();
    } catch (error) {
      console.error("MongoDB connection error:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.client.close();
  }

  private async initializeCollections(): Promise<void> {
    if (!this.db) return;

    // Check if collections exist and have data, if not, seed them
    const collections = [
      "users",
      "todos",
      "news",
      "questions",
      "attempts",
      "chats",
    ];

    for (const collectionName of collections) {
      const collection = this.db.collection(collectionName);
      const count = await collection.countDocuments();

      if (count === 0) {
        await this.seedCollection(collectionName, collection);
      }
    }
  }

  private async seedCollection(
    name: string,
    collection: Collection,
  ): Promise<void> {
    switch (name) {
      case "users":
        await collection.insertOne({
          numericId: 1,
          username: "alexjohnson",
          password: "password123",
          email: "alex.johnson@student.edu",
          phone: "+1 (555) 123-4567",
          firstName: "Alex",
          lastName: "Johnson",
          joinDate: new Date("2024-03-01"),
        });
        break;

      case "todos":
        await collection.insertMany([
          {
            numericId: 1,
            userId: 1,
            title: "Complete Data Structures Assignment",
            completed: false,
            dueTime: "11:59 PM today",
            createdAt: new Date(),
          },
          {
            numericId: 2,
            userId: 1,
            title: "Review Algorithms Chapter",
            completed: true,
            dueTime: "Completed 2 hours ago",
            createdAt: new Date(),
          },
          {
            numericId: 3,
            userId: 1,
            title: "Prepare for GATE Mock Test",
            completed: false,
            dueTime: "Tomorrow 9:00 AM",
            createdAt: new Date(),
          },
        ]);
        break;

      case "news":
        await collection.insertMany([
          {
            numericId: 1,
            title: "GATE 2025 Registration Opens",
            summary:
              "Registration for GATE Computer Science 2025 is now open. Don't miss the deadline!",
            category: "Exam Updates",
            imageUrl:
              "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
            publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          },
          {
            numericId: 2,
            title: "New Algorithm Practice Sets Available",
            summary:
              "Updated practice questions for dynamic programming and graph algorithms now available in the practice section.",
            category: "Study Materials",
            imageUrl:
              "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
            publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        ]);
        break;

      case "questions":
        await collection.insertMany([
          {
            numericId: 1,
            type: "mcq",
            question: "What is the time complexity of binary search?",
            options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
            correctAnswer: "O(log n)",
            difficulty: "easy",
            subject: "Algorithms",
            testType: "daily",
          },
          {
            numericId: 2,
            type: "msq",
            question:
              "Which of the following are sorting algorithms? (Select all that apply)",
            options: [
              "Quick Sort",
              "Binary Search",
              "Merge Sort",
              "Linear Search",
            ],
            correctAnswer: ["Quick Sort", "Merge Sort"],
            difficulty: "medium",
            subject: "Algorithms",
            testType: "daily",
          },
          {
            numericId: 3,
            type: "nat",
            question:
              "How many edges are there in a complete graph with 5 vertices?",
            options: null,
            correctAnswer: "10",
            difficulty: "medium",
            subject: "Graph Theory",
            testType: "daily",
          },
          {
            numericId: 4,
            type: "mcq",
            question:
              "Which data structure is used for implementing recursion?",
            options: ["Queue", "Stack", "Array", "Linked List"],
            correctAnswer: "Stack",
            difficulty: "easy",
            subject: "Data Structures",
            testType: "weekly",
          },
        ]);
        break;
    }
  }

  getDb(): Db {
    if (!this.db) {
      throw new Error("Database not connected");
    }
    return this.db;
  }

  collection(name: string): Collection {
    return this.getDb().collection(name);
  }
}

export const database = new MongoDatabase();
