import type { User, Todo, NewsArticle, TestQuestion, TestAttempt, ChatMessage, InsertTodo, InsertTestAttempt, InsertChatMessage } from "@shared/schema";

// Base API configuration
const API_BASE_URL = "/api";

// Generic API request function
async function apiRequest<T>(method: string, endpoint: string, data?: any): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// User API functions
export const userApi = {
  getUser: (id: number): Promise<User> => 
    apiRequest<User>("GET", `/user/${id}`),
  
  getUserByUsername: (username: string): Promise<User> => 
    apiRequest<User>("GET", `/user/username/${username}`),
};

// Todo API functions
export const todoApi = {
  getTodosByUserId: (userId: number): Promise<Todo[]> => 
    apiRequest<Todo[]>("GET", `/todos/user/${userId}`),
  
  createTodo: (todo: InsertTodo): Promise<Todo> => 
    apiRequest<Todo>("POST", "/todos", todo),
  
  updateTodo: (id: number, updates: Partial<Todo>): Promise<Todo> => 
    apiRequest<Todo>("PATCH", `/todos/${id}`, updates),
  
  deleteTodo: (id: number): Promise<void> => 
    apiRequest<void>("DELETE", `/todos/${id}`),
};

// News API functions
export const newsApi = {
  getNewsArticles: (): Promise<NewsArticle[]> => 
    apiRequest<NewsArticle[]>("GET", "/news"),
};

// Test API functions
export const testApi = {
  getTestQuestions: (testType: string, limit?: number): Promise<TestQuestion[]> => 
    apiRequest<TestQuestion[]>("GET", `/test/${testType}/questions${limit ? `?limit=${limit}` : ""}`),
  
  createTestAttempt: (attempt: InsertTestAttempt): Promise<TestAttempt> => 
    apiRequest<TestAttempt>("POST", "/test/attempts", attempt),
  
  getUserTestAttempts: (userId: number): Promise<TestAttempt[]> => 
    apiRequest<TestAttempt[]>("GET", `/test/attempts/user/${userId}`),
};

// Chat API functions
export const chatApi = {
  getChatHistory: (userId: number): Promise<ChatMessage[]> => 
    apiRequest<ChatMessage[]>("GET", `/chat/history/${userId}`),
  
  sendMessage: (message: InsertChatMessage): Promise<ChatMessage> => 
    apiRequest<ChatMessage>("POST", "/chat", message),
};

// Export all APIs as a single object for easy importing
export const api = {
  user: userApi,
  todo: todoApi,
  news: newsApi,
  test: testApi,
  chat: chatApi,
};