import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Sparkles} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { ChatMessage, TestQuestion } from "@shared/schema";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


interface ChatInterfaceProps{
  chatId: string,
  question: TestQuestion,
  currentAnswer: string|string[],
}

export default function ChatInterface({chatId,question,currentAnswer}: ChatInterfaceProps) {
  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: chatHistory, isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["chat-history", 1,chatId],
    queryFn: () => api.chat.getChatHistory(1,chatId),
  });
  const sendMessageMutation = useMutation({
    mutationFn: (messageData: {chatId:string, userId: number; message: string; response: string; imageUrl?: string }) =>
      api.chat.sendMessage(messageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-history", 1, chatId] });
      setNewMessage("");
      setSelectedImage(null);
      setUploadedImageUrl(null)
    
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });
  const uploadImageMutation = useMutation({
    mutationFn: (file: File) => api.chat.uploadImage(file),
    onSuccess: (data) => {
      setUploadedImageUrl(data.url)
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    },
  });
  const handleSendMessage = () => {
    if (!newMessage.trim() && !selectedImage) return;
      
    console.log("###",uploadedImageUrl)
    
    if(uploadedImageUrl){
      console.log("%%%",uploadedImageUrl)
      sendMessageMutation.mutate({
        chatId:chatId,
        userId: 1,
        message: newMessage.trim(),
        imageUrl: uploadedImageUrl,
        response: "",
      });
    }else{
      sendMessageMutation.mutate({
        chatId:chatId,
        userId: 1,
        message: newMessage.trim(),
        imageUrl: "",
        response: "",
      });
    }

    
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
      uploadImageMutation.mutate(e.target.files[0]);
    }
  };

  const handleQuestionExplanation =()=>{
    const questionText = typeof question.question === 'string' ? question.question : 'N/A';
    const answerText = Array.isArray(currentAnswer) ? currentAnswer.join(', ') : currentAnswer;

    const explanationMessage = `6336Question6336${questionText}6336Answer6336${answerText}`;

    console.log(explanationMessage)
    sendMessageMutation.mutate({
      chatId: chatId,
      userId: 1,
      message: explanationMessage,
      response: "",
      imageUrl: "",
    });
  }

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
            
            {chatHistory.slice(-1)?.map((chat) => (
              <div key={chat.id} className="space-y-3">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="flex items-start space-x-2 max-w-[80%]">
                    <div className="bg-primary text-white rounded-lg p-3">
                        <p className="text-sm">{chat.message}</p>
                        {/* Display image if available in chat message */}
                        {chat.imageUrl && <img src={chat.imageUrl} alt="User uploaded" className="mt-2 rounded-md max-w-full h-auto" />}
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
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{chat.response}</ReactMarkdown>   
                      {/* You might display bot-generated images here too */}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-6 border-t border-slate-200">
          {selectedImage && (
            <div className="flex items-center space-x-2 mb-2 p-2 bg-slate-100 rounded-md">
              <span className="text-sm text-slate-700">{selectedImage.name}</span>
              <Button variant="ghost" size="sm" onClick={() => setSelectedImage(null)}>x</Button>
            </div>
          )}
          <div className="flex space-x-2">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
    
              <Button onClick={handleQuestionExplanation}  disabled={sendMessageMutation.isPending} variant="outline"  size="icon" className="cursor-pointer">
                <Sparkles className="w-4 h-4" />
              </Button>

            <Button
              onClick={handleSendMessage}
              disabled={sendMessageMutation.isPending  ||(!newMessage.trim() )}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}