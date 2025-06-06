import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Mic, Heart, Loader2 } from "lucide-react";
import { useSupabase } from "@/hooks/useSupabase";
import { useUser } from "@/hooks/useUserContext";

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  language?: string;
}

export const ChatbotInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [loading, setLoading] = useState(true);

  const { getChatHistory, saveChatMessage } = useSupabase();
  const { user } = useUser();

  const languages = [
    { code: "en", name: "English" },
    { code: "ar", name: "العربية" },
    { code: "fr", name: "Français" },
    { code: "es", name: "Español" },
    { code: "tr", name: "Türkçe" },
    { code: "fa", name: "فارسی" }
  ];

  const quickActions = [
    "Register my family",
    "I need medical help",
    "Find food assistance",
    "Legal aid needed",
    "Housing support",
    "Emergency help"
  ];

  useEffect(() => {
    loadChatHistory();
  }, [user]);

  const loadChatHistory = async () => {
    if (!user) {
      setMessages([getWelcomeMessage()]);
      setLoading(false);
      return;
    }

    try {
      const history = await getChatHistory();
      const formattedMessages: Message[] = [];

      // Add welcome message
      formattedMessages.push(getWelcomeMessage());

      // Add chat history
      history?.forEach((chat: any) => {
        formattedMessages.push({
          id: `user-${chat.id}`,
          type: 'user',
          content: chat.message,
          timestamp: new Date(chat.created_at),
        });

        if (chat.response) {
          formattedMessages.push({
            id: `bot-${chat.id}`,
            type: 'bot',
            content: chat.response,
            timestamp: new Date(chat.created_at),
            language: chat.language,
          });
        }
      });

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading chat history:', error);
      setMessages([getWelcomeMessage()]);
    } finally {
      setLoading(false);
    }
  };

  const getWelcomeMessage = (): Message => ({
    id: 'welcome',
    type: 'bot',
    content: user
      ? `Hello ${user.name}! I'm your AI assistant for refugee support. I can help you register your needs, find resources, or connect you with support services. How can I assist you today?`
      : "Hello! I'm your AI assistant for refugee support. I can help you register your needs, find resources, or connect you with support services. Please sign in to save your conversation history. How can I assist you today?",
    timestamp: new Date(),
    language: 'en'
  });

  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        type: 'user',
        content: inputMessage,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      setInputMessage("");
      setIsTyping(true);

      try {
        const response = await fetch('/api/chat', { // Your FastAPI endpoint
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: inputMessage }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const botMessage: Message = {
          id: `bot-${Date.now()}`,
          type: 'bot',
          content: data.response,
          timestamp: new Date(),
          language: selectedLanguage // Or you might want to handle language differently
        };

        setMessages(prev => [...prev, botMessage]);

        // Save to database if user is logged in
        if (user) {
          try {
            await saveChatMessage(inputMessage, data.response);
          } catch (error) {
            console.error('Error saving chat message:', error);
          }
        }
      } catch (error) {
        console.error('Error sending message to chatbot API:', error);
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          type: 'bot',
          content: 'Sorry, I encountered an error communicating with the AI.',
          timestamp: new Date(),
          language: selectedLanguage
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleQuickAction = (action: string) => {
    setInputMessage(action);
    setTimeout(() => handleSendMessage(), 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">AI Assistant</h2>
          <p className="text-gray-600 mt-1">Multilingual support for refugees</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <Heart className="w-3 h-3 mr-1" />
            Live Support
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-blue-500" />
              <span>Chat Assistant</span>
              {!user && (
                <Badge variant="outline" className="text-xs">
                  Sign in to save history
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {message.type === 'bot' ? (
                          <Bot className="w-4 h-4" />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                        <span className="text-xs font-medium">
                          {message.type === 'bot' ? 'AI Assistant' : 'You'}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-75 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Bot className="w-4 h-4" />
                        <span className="text-xs font-medium">AI Assistant</span>
                      </div>
                      <div className="flex items-center space-x-1 mt-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button size="icon" variant="outline">
                  <Mic className="w-4 h-4" />
                </Button>
                <Button onClick={handleSendMessage} size="icon">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3 px-4"
                onClick={() => handleQuickAction(action)}
              >
                {action}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
