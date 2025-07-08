import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Send, Bot, Dumbbell, Utensils, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { openaiClient } from "@/lib/openai-client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  user: {
    id: number;
    subscriptionStatus?: string;
    subscriptionTier?: string;
  };
  onSubscribeRequired?: () => void;
}

export function ChatInterface({ user, onSubscribeRequired }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [userStatus, setUserStatus] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, user: authUser } = useAuth();

  // Check authentication and email verification on component mount
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !authUser?.emailVerified)) {
      // Don't redirect or show error in chat interface - parent component should handle this
      return;
    }
  }, [authLoading, isAuthenticated, authUser]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCurrentMessage(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast({
          title: "Voice Recognition Error",
          description: "Could not process voice input. Please try again.",
          variant: "destructive",
        });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognition);
    }
  }, [toast]);

  // Load chat history and user status
  useEffect(() => {
    loadChatHistory();
    loadUserStatus();
  }, [user]);

  const loadUserStatus = async () => {
    try {
      const response = await fetch(`/api/user-status/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setUserStatus(data);
      }
    } catch (error) {
      console.error('Failed to load user status:', error);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const history = await openaiClient.getChatHistory(user.id);
      setMessages(history.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })));
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;

    // Check message limits for free users
    if (userStatus?.permissions && !userStatus.permissions.hasUnlimitedMessages) {
      if (userStatus.permissions.messagesUsed >= userStatus.permissions.dailyMessageLimit) {
        toast({
          title: "Daily Limit Reached",
          description: "You've reached your daily message limit. Upgrade to Premium for unlimited messages!",
          variant: "destructive",
        });
        if (onSubscribeRequired) onSubscribeRequired();
        return;
      }
    }

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage("");
    setIsLoading(true);

    try {
      const aiResponse = await openaiClient.sendMessage(user.id, currentMessage);
      setMessages(prev => [...prev, {
        ...aiResponse,
        timestamp: new Date(aiResponse.timestamp)
      }]);
      
      // Refresh user status after sending message
      loadUserStatus();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoiceInput = () => {
    if (!recognition) {
      toast({
        title: "Voice Recognition Unavailable",
        description: "Voice recognition is not supported in this browser.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setCurrentMessage(prompt);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Show authentication required message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600 mb-4">Please sign in and verify your email to access the AI chat feature.</p>
          <Button onClick={() => window.location.reload()} className="bg-primary hover:bg-primary/90">
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Chat Interface */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Chat Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <Bot className="text-white w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Fit Coach AI</h2>
                <p className="text-sm text-gray-500">Your personal health & fitness assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Usage Status for Free Users */}
              {userStatus?.permissions && !userStatus.permissions.hasUnlimitedMessages && (
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-600">
                    {userStatus.permissions.messagesUsed}/{userStatus.permissions.dailyMessageLimit} messages
                  </div>
                  <div className="text-xs text-gray-500">
                    {userStatus.permissions.dailyMessageLimit - userStatus.permissions.messagesUsed} remaining today
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-gray-500">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="h-96 overflow-y-auto p-6 space-y-4">
          {/* Welcome Message */}
          {messages.length === 0 && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="text-white w-4 h-4" />
              </div>
              <div className="bg-gray-50 rounded-2xl rounded-tl-md px-4 py-3 max-w-xs sm:max-w-md">
                <p className="text-gray-800">
                  👋 Hi! I'm your Fit Coach AI. I'm here to help you with personalized diet plans, 
                  workout routines, and health advice. 
                </p>
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <strong>Important:</strong> This is AI-powered fitness guidance. Always consult healthcare professionals for medical concerns, injuries, or before starting new exercise programs. This advice is for general wellness and should not replace professional medical advice.
                  </p>
                </div>
                <p className="text-gray-800 mt-2">
                  What would you like to work on today?
                </p>
                <span className="text-xs text-gray-500 mt-1 block">{formatTime(new Date())}</span>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.role === 'user' ? 'justify-end' : ''
              }`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="text-white w-4 h-4" />
                </div>
              )}
              
              <div className={`rounded-2xl px-4 py-3 max-w-xs sm:max-w-md ${
                message.role === 'user'
                  ? 'bg-primary text-white rounded-tr-md'
                  : 'bg-gray-50 text-gray-800 rounded-tl-md'
              }`}>
                <p className="whitespace-pre-wrap">{message.content}</p>
                <span className={`text-xs mt-1 block ${
                  message.role === 'user' ? 'text-primary-100' : 'text-gray-500'
                }`}>
                  {formatTime(message.timestamp)}
                </span>
              </div>

              {message.role === 'user' && (
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    U
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="text-white w-4 h-4" />
              </div>
              <div className="bg-gray-50 rounded-2xl rounded-tl-md px-4 py-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse animation-delay-200"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse animation-delay-400"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <div className="relative">
                <Textarea
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Ask me about diet, workouts, or health advice..."
                  className="resize-none border border-gray-300 rounded-2xl px-4 py-3 pr-12 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  rows={1}
                />
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleVoiceInput}
                  className={`absolute right-3 bottom-3 w-6 h-6 p-0 ${
                    isListening ? 'text-red-500' : 'text-gray-400 hover:text-primary'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
              </div>
              
              {isListening && (
                <div className="mt-2 text-sm text-gray-500 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span>Listening... Speak now</span>
                </div>
              )}
            </div>
            
            <Button
              onClick={sendMessage}
              disabled={isLoading || !currentMessage.trim()}
              className="bg-primary hover:bg-primary/90 text-white rounded-2xl px-6 py-3 font-medium transition-all duration-200"
            >
              <Send className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Start</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            variant="outline"
            onClick={() => handleQuickPrompt("Create a workout plan for me")}
            className="bg-white border border-gray-200 rounded-xl p-4 h-auto text-left hover:border-primary hover:bg-primary/5 transition-all duration-200 group justify-start"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                <Dumbbell className="text-secondary w-5 h-5" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Workout Plan</h4>
                <p className="text-sm text-gray-500">Get a personalized exercise routine</p>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={() => handleQuickPrompt("Help me with meal planning")}
            className="bg-white border border-gray-200 rounded-xl p-4 h-auto text-left hover:border-primary hover:bg-primary/5 transition-all duration-200 group justify-start"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                <Utensils className="text-orange-600 w-5 h-5" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Meal Planning</h4>
                <p className="text-sm text-gray-500">Design healthy meal plans</p>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={() => handleQuickPrompt("Help me track my fitness progress")}
            className="bg-white border border-gray-200 rounded-xl p-4 h-auto text-left hover:border-primary hover:bg-primary/5 transition-all duration-200 group justify-start"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <TrendingUp className="text-primary w-5 h-5" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Progress Tracking</h4>
                <p className="text-sm text-gray-500">Monitor your health journey</p>
              </div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
