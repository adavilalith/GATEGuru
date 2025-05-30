import {
  users,
  todos,
  newsArticles,
  testQuestions,
  testAttempts,
  chatMessages,
  type User,
  type InsertUser,
  type Todo,
  type InsertTodo,
  type NewsArticle,
  type TestQuestion,
  type InsertTestAttempt,
  type TestAttempt,
  type InsertChatMessage,
  type ChatMessage,
} from "@shared/schema";
import { database } from "./database";

// MongoDB Storage Implementation
export class MongoStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const user = await database.collection("users").findOne({ numericId: id });
    if (!user) return undefined;
    return {
      id: user.numericId,
      username: user.username,
      password: user.password,
      email: user.email,
      phone: user.phone || null,
      firstName: user.firstName,
      lastName: user.lastName,
      joinDate: user.joinDate || null,
    };
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await database.collection("users").findOne({ username });
    if (!user) return undefined;
    return {
      id: user.numericId,
      username: user.username,
      password: user.password,
      email: user.email,
      phone: user.phone || null,
      firstName: user.firstName,
      lastName: user.lastName,
      joinDate: user.joinDate || null,
    };
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const userCount = await database.collection("users").countDocuments();
    const newId = userCount + 1;

    const user = {
      numericId: newId,
      ...insertUser,
      phone: insertUser.phone || null,
      joinDate: new Date(),
    };

    await database.collection("users").insertOne(user);

    return {
      id: newId,
      ...insertUser,
      phone: insertUser.phone || null,
      joinDate: new Date(),
    };
  }

  async getTodosByUserId(userId: number): Promise<Todo[]> {
    const todos = await database.collection("todos").find({ userId }).toArray();
    return todos.map((todo) => ({
      id: todo.numericId,
      userId: todo.userId,
      title: todo.title,
      completed: todo.completed ?? null,
      dueTime: todo.dueTime || null,
      createdAt: todo.createdAt || null,
    }));
  }

  async createTodo(insertTodo: InsertTodo): Promise<Todo> {
    const todoCount = await database.collection("todos").countDocuments();
    const newId = todoCount + 1;

    const todo = {
      numericId: newId,
      ...insertTodo,
      completed: insertTodo.completed ?? null,
      dueTime: insertTodo.dueTime || null,
      createdAt: new Date(),
    };

    await database.collection("todos").insertOne(todo);

    return {
      id: newId,
      ...insertTodo,
      completed: insertTodo.completed ?? null,
      dueTime: insertTodo.dueTime || null,
      createdAt: new Date(),
    };
  }

  async updateTodo(
    id: number,
    updates: Partial<Todo>,
  ): Promise<Todo | undefined> {
    await database
      .collection("todos")
      .updateOne({ numericId: id }, { $set: updates });
    const updatedTodo = await database
      .collection("todos")
      .findOne({ numericId: id });

    if (!updatedTodo) return undefined;

    return {
      id: updatedTodo.numericId,
      userId: updatedTodo.userId,
      title: updatedTodo.title,
      completed: updatedTodo.completed ?? null,
      dueTime: updatedTodo.dueTime || null,
      createdAt: updatedTodo.createdAt || null,
    };
  }

  async deleteTodo(id: number): Promise<boolean> {
    const result = await database
      .collection("todos")
      .deleteOne({ numericId: id });
    return result.deletedCount > 0;
  }

  async getNewsArticles(): Promise<NewsArticle[]> {
    const articles = await database
      .collection("news")
      .find({})
      .sort({ publishedAt: -1 })
      .toArray();
    return articles.map((article) => ({
      id: article.numericId,
      title: article.title,
      summary: article.summary,
      category: article.category,
      imageUrl: article.imageUrl || null,
      publishedAt: article.publishedAt || null,
    }));
  }

  async getTestQuestions(
    testType: string,
    limit: number = 10,
  ): Promise<TestQuestion[]> {
    const questions = await database
      .collection("questions")
      .find({ testType })
      .limit(limit)
      .toArray();

    return questions.map((question) => ({
      id: question.numericId,
      type: question.type,
      question: question.question,
      options: question.options,
      correctAnswer: question.correctAnswer,
      difficulty: question.difficulty || null,
      subject: question.subject || null,
      testType: question.testType,
    }));
  }

  async createTestAttempt(
    insertAttempt: InsertTestAttempt,
  ): Promise<TestAttempt> {
    const attemptCount = await database.collection("attempts").countDocuments();
    const newId = attemptCount + 1;

    const attempt = {
      numericId: newId,
      ...insertAttempt,
      completedAt: new Date(),
    };

    await database.collection("attempts").insertOne(attempt);

    return {
      id: newId,
      ...insertAttempt,
      completedAt: new Date(),
    };
  }

  async getUserTestAttempts(userId: number): Promise<TestAttempt[]> {
    const attempts = await database
      .collection("attempts")
      .find({ userId })
      .sort({ completedAt: -1 })
      .toArray();

    return attempts.map((attempt) => ({
      id: attempt.numericId,
      userId: attempt.userId,
      testType: attempt.testType,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      completedAt: attempt.completedAt || null,
    }));
  }

  async getChatHistory(userId: number): Promise<ChatMessage[]> {
    const messages = await database
      .collection("chats")
      .find({ userId })
      .sort({ createdAt: 1 })
      .toArray();

    return messages.map((message) => ({
      id: message.numericId,
      userId: message.userId,
      message: message.message,
      response: message.response,
      createdAt: message.createdAt || null,
    }));
  }

  async createChatMessage(
    insertMessage: InsertChatMessage,
  ): Promise<ChatMessage> {
    const chatCount = await database.collection("chats").countDocuments();
    const newId = chatCount + 1;

    const message = {
      numericId: newId,
      ...insertMessage,
      createdAt: new Date(),
    };

    await database.collection("chats").insertOne(message);

    return {
      id: newId,
      ...insertMessage,
      createdAt: new Date(),
    };
  }
}

export const storage = new MongoStorage();
