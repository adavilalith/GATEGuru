import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { ChatMessage } from "@shared/schema";

export default function ChatInterface() {
  const [newMessage, setNewMessage] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: chatHistory, isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["chat-history", 1],
    queryFn: () => api.chat.getChatHistory(1), // Hardcoded user ID
  });

  const sendMessageMutation = useMutation({
    mutationFn: (messageData: { userId: number; message: string; response: string }) =>
      api.chat.sendMessage(messageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-history", 1] });
      setNewMessage("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    // Generate a simple response for demo purposes
    const generateResponse = (message: string) => {
      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes("gate") || lowerMessage.includes("csit")) {
        return "GATE Computer Science and Information Technology is a competitive exam. I can help you with topics like algorithms, data structures, computer networks, operating systems, and more!";
      } else if (lowerMessage.includes("test") || lowerMessage.includes("exam")) {
        return "For test preparation, I recommend reviewing your notes, practicing sample questions, and managing your time effectively during the test.";
      } else if (lowerMessage.includes("algorithm") || lowerMessage.includes("data structure")) {
        return "Algorithms and data structures are fundamental topics in GATE CSIT. Focus on understanding time complexity, sorting algorithms, trees, graphs, and dynamic programming.";
      } else if (lowerMessage.includes("network") || lowerMessage.includes("os")) {
        return "Computer networks and operating systems are important subjects. Study concepts like TCP/IP, routing protocols, process scheduling, and memory management.";
      } else {
        return "That's an interesting question! Could you provide more details so I can give you a more specific answer about GATE CSIT preparation?";
      }
    };

    sendMessageMutation.mutate({
      userId: 1,
      message: newMessage.trim(),
      response: generateResponse(newMessage.trim()),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) {
    return (
      <Card className="h-[600px]">
        <CardContent className="p-6 h-full flex items-center justify-center">
          <div className="animate-pulse text-slate-500">Loading chat...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardContent className="flex-1 p-0 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">AI Study Assistant</h3>
              <p className="text-sm text-slate-500">Ask me anything about your studies!</p>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            {chatHistory?.length === 0 && (
              <div className="text-center text-slate-500 py-8">
                <Bot className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <p>Start a conversation! Ask me about your studies, tests, or any topic you need help with.</p>
              </div>
            )}
            
            {chatHistory?.map((chat) => (
              <div key={chat.id} className="space-y-3">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="flex items-start space-x-2 max-w-[80%]">
                    <div className="bg-primary text-white rounded-lg p-3">
                      <p className="text-sm">{chat.message}</p>
                    </div>
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
                
                {/* Bot response */}
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2 max-w-[80%]">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="bg-slate-100 rounded-lg p-3">
                      <p className="text-sm text-slate-800">{chat.response}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-6 border-t border-slate-200">
          <div className="flex space-x-2">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={sendMessageMutation.isPending || !newMessage.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
