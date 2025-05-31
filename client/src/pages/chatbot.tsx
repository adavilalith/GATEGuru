import Topbar from "@/components/layout/topbar";
import ChatInterface from "@/components/chatbot/chat-interface";

export default function Chatbot() {
  return (
    <div>
      <Topbar
        title="AI Assistant"
        subtitle="Get instant help and answers to your study questions"
      />
      
      <main className="p-6">
        <div className="max-w-4xl mx-auto ">
          <ChatInterface chatId="main_chat"/>
        </div>
      </main>
    </div>
  );
}
