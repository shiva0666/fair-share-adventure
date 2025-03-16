
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Paperclip, Send, Smile, Image as ImageIcon, Mic, X } from "lucide-react";
import { Trip } from "@/types";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TripChatProps {
  trip: Trip;
}

interface ChatMessage {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  attachments?: {
    id: string;
    type: 'image' | 'file';
    url: string;
    name: string;
  }[];
}

const EMOJIS = [
  "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", 
  "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙",
  "👍", "👋", "👌", "🙏", "🤝", "❤️", "👏", "🎉", "🔥", "✅"
];

export function TripChat({ trip }: TripChatProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Mock data for demo
  useEffect(() => {
    // Generate some mock messages
    const mockMessages: ChatMessage[] = [
      {
        id: "1",
        content: `Hi everyone! Welcome to the ${trip.name} chat 👋`,
        sender: {
          id: "system",
          name: "Trip Organizer",
          avatar: "/placeholder.svg"
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
      },
      {
        id: "2",
        content: "Hello! When are we meeting tomorrow?",
        sender: {
          id: trip.participants[0]?.id || "user1",
          name: trip.participants[0]?.name || "John Doe",
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
      },
      {
        id: "3",
        content: "I think the plan was to meet at the hotel lobby at 9am",
        sender: {
          id: trip.participants[1]?.id || "user2",
          name: trip.participants[1]?.name || "Sarah Smith", 
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 20) // 20 minutes ago
      }
    ];
    
    setMessages(mockMessages);
  }, [trip]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const handleSendMessage = () => {
    if (message.trim() === "" && uploadedFiles.length === 0) return;
    
    const attachments = uploadedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      type: file.type.startsWith('image/') ? 'image' as const : 'file' as const,
      url: URL.createObjectURL(file),
      name: file.name
    }));
    
    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      content: message,
      sender: {
        id: "current-user", // In a real app, this would be the current user's ID
        name: "You", // In a real app, this would be the current user's name
      },
      timestamp: new Date(),
      attachments: attachments.length > 0 ? attachments : undefined
    };
    
    setMessages([...messages, newMessage]);
    setMessage("");
    setUploadedFiles([]);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleEmojiClick = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...filesArray]);
      
      // Clear the input value so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  
  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleMicClick = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Start recording logic would go here
      toast({
        title: "Recording started",
        description: "Your voice is being recorded...",
      });
    } else {
      // Stop recording logic would go here
      toast({
        title: "Recording stopped",
        description: "Voice message added to chat",
      });
      
      // Simulate adding a voice message
      const newMessage: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        content: "🎤 Voice message",
        sender: {
          id: "current-user",
          name: "You",
        },
        timestamp: new Date(),
        attachments: [{
          id: Math.random().toString(36).substr(2, 9),
          type: 'file',
          url: "#",
          name: "voice_message.mp3"
        }]
      };
      
      setMessages([...messages, newMessage]);
    }
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };
  
  return (
    <Card className="w-full h-[500px] flex flex-col mt-6">
      <CardHeader className="px-4 py-3 border-b">
        <CardTitle className="text-lg flex items-center gap-2">
          <span>Trip Chat</span>
          <span className="text-xs text-muted-foreground">
            ({trip.participants.length} participants)
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender.id === "current-user" ? "justify-end" : "justify-start"}`}
          >
            <div className="flex gap-2 max-w-[80%]">
              {msg.sender.id !== "current-user" && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={msg.sender.avatar} alt={msg.sender.name} />
                  <AvatarFallback>
                    {msg.sender.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div>
                {msg.sender.id !== "current-user" && (
                  <p className="text-xs font-medium mb-1">{msg.sender.name}</p>
                )}
                
                <div
                  className={`rounded-lg px-3 py-2 ${
                    msg.sender.id === "current-user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p>{msg.content}</p>
                  
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {msg.attachments.map(attachment => (
                        <div key={attachment.id}>
                          {attachment.type === 'image' ? (
                            <div className="rounded overflow-hidden mt-2">
                              <img
                                src={attachment.url}
                                alt="Attachment"
                                className="max-h-48 w-auto object-contain"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 p-2 bg-background/50 rounded">
                              <Paperclip className="h-4 w-4" />
                              <span className="text-sm truncate">{attachment.name}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground mt-1">
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </CardContent>
      
      {uploadedFiles.length > 0 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2 mb-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center bg-muted rounded-full px-3 py-1">
                {file.type.startsWith('image/') ? (
                  <ImageIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                ) : (
                  <Paperclip className="h-4 w-4 mr-1 text-muted-foreground" />
                )}
                <span className="text-xs truncate max-w-[100px]">{file.name}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5 ml-1" 
                  onClick={() => removeFile(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <CardFooter className="p-3 border-t">
        <div className="flex w-full items-center gap-2">
          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Smile className="h-5 w-5 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2" align="start">
              <div className="grid grid-cols-5 gap-2">
                {EMOJIS.map((emoji, i) => (
                  <Button
                    key={i}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-lg"
                    onClick={() => handleEmojiClick(emoji)}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-5 w-5 text-muted-foreground" />
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              onChange={handleFileUpload}
            />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-9 w-9 ${isRecording ? 'text-red-500' : ''}`}
            onClick={handleMicClick}
          >
            <Mic className={`h-5 w-5 ${isRecording ? 'animate-pulse' : 'text-muted-foreground'}`} />
          </Button>
          
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          
          <Button
            variant="default"
            size="icon"
            className="h-9 w-9"
            onClick={handleSendMessage}
            disabled={message.trim() === "" && uploadedFiles.length === 0}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
