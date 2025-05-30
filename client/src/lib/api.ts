import type { User, Todo, NewsArticle, TestQuestion, TestAttempt, ChatMessage, InsertTodo, InsertTestAttempt, InsertChatMessage } from "@shared/schema";

// Base API configuration
const API_BASE_URL = "/api";

// Generic API request function (unchanged - still for JSON)
async function apiRequest<T>(method: string, endpoint: string, data?: any): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json", // This remains for JSON payloads
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

// --- NEW FUNCTION FOR FILE UPLOADS ---
// FIX: Changed fetch URL to use API_BASE_URL for consistency
async function uploadFile<T>(file: File, fieldName: string = "file"): Promise<T> {
  const formData = new FormData();
  formData.append(fieldName, file); // Append the file with a specified field name

  // You might want to add other data to the formData, e.g., if you need a userId
  // formData.append("userId", "123"); // Example: formData.append("userId", String(userId));

  const response = await fetch(`${API_BASE_URL}/chat/uploadImage`, { // <-- FIX IS HERE!
    method: "POST", // File uploads are almost always POST requests
    body: formData, // Send the FormData directly
    // IMPORTANT: DO NOT set Content-Type here. The browser handles it for FormData.
    // If you have authentication (e.g., JWT), you'd add it here:
    // headers: {
    //   "Authorization": `Bearer YOUR_AUTH_TOKEN`,
    // },
  });

  if (!response.ok) {
    throw new Error(`File upload failed: ${response.statusText}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// User API functions (unchanged)
export const userApi = {
  getUser: (id: number): Promise<User> =>
    apiRequest<User>("GET", `/user/${id}`),

  getUserByUsername: (username: string): Promise<User> =>
    apiRequest<User>("GET", `/user/username/${username}`),
};

// Todo API functions (unchanged)
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

// News API functions (unchanged)
export const newsApi = {
  getNewsArticles: (): Promise<NewsArticle[]> =>
    apiRequest<NewsArticle[]>("GET", "/news"),
};

// Test API functions (unchanged)
export const testApi = {
  getTestQuestions: (testType: string, limit?: number): Promise<TestQuestion[]> =>
    apiRequest<TestQuestion[]>("GET", `/test/${testType}/questions${limit ? `?limit=${limit}` : ""}`),

  createTestAttempt: (attempt: InsertTestAttempt): Promise<TestAttempt> =>
    apiRequest<TestAttempt>("POST", "/test/attempts", attempt),

  getUserTestAttempts: (userId: number): Promise<TestAttempt[]> =>
    apiRequest<TestAttempt[]>("GET", `/test/attempts/user/${userId}`),
};

// Chat API functions (modified to include an upload function)
export const chatApi = {
  getChatHistory: (userId: number, chatId: string): Promise<ChatMessage[]> =>
    apiRequest<ChatMessage[]>("GET", `/chat/history?userId=${userId}&chatId=${chatId}`),

  sendMessage: (message: InsertChatMessage): Promise<ChatMessage> =>
    apiRequest<ChatMessage>("POST", `/chat`, message),

  // --- NEW CHAT-SPECIFIC UPLOAD FUNCTION ---
  // This will call the backend endpoint /api/chat/upload-image
  uploadImage: (file: File): Promise<{ url: string }> =>
    uploadFile<{ url: string }>(file, "image"), // "image" is the expected field name on the server
};

// Export all APIs as a single object for easy importing
export const api = {
  user: userApi,
  todo: todoApi,
  news: newsApi,
  test: testApi,
  chat: chatApi, // Includes the new upload function
};