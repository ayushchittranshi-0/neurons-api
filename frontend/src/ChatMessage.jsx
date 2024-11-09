import  { useState, } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ChatResponseUI from './ChatResponseUI';
import { Badge } from "@/components/ui/badge";
import {
    Send,
    Home,
    List,
    MessageCircle,
    Train,
    RefreshCcw,
    User,
    Bean
} from 'lucide-react';
import { useTrainData } from './useTrainData';
import TrainsData from './TrainsData';
import { API_URL } from './config';


const ChatBot = () => {
    const [messages, setMessages] = useState([
        { text: "Welcome to TrainBot! How can I assist you with your journey today?", isUser: false, timestamp: "Just now" }
    ]);
    const [inputText, setInputText] = useState("");
    const [activeTab, setActiveTab] = useState("home");
    const [isLoading, setIsLoading] = useState(false);

    const { trains, seeding, seedData, error, loading } = useTrainData();

  const handleSend = async (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      // Add user message
      setMessages(prev => [...prev, { 
        text: inputText, 
        isUser: true, 
        timestamp: now 
      }]);
      
      setIsLoading(true);

      try {
            const response = await fetch(`${API_URL}/chatResponse`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input_text: inputText
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to get response from server');
        }

        const data = await response.json();
        
        const formattedResponse = formatTrainsResponse(data);
        const messageObject = {
          text: formattedResponse,
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        if (data.trains && data.trains.length > 0) {
          messageObject.found_trains = data.trains;
        }
        setMessages(prev => [...prev, messageObject]);

      } catch (error) {
        // Handle error case
        setMessages(prev => [...prev, {
          text: "Sorry, I encountered an error while searching for trains. Please try again.",
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
        setInputText("");
      }
    }
  };

  const formatTrainsResponse = (apiResponse) => {
    let formattedText = apiResponse.message + "\n\n";
    if (apiResponse.trains && apiResponse.trains.length > 0) {
      apiResponse.trains.forEach((train, index) => {
        formattedText += `${index + 1}. ${train.train_name} (${train.train_number})\n`;
        formattedText += `   From: ${train.source_station} To: ${train.destination_station}\n\n`;
      });
    }
    return formattedText.trim();
  };

    const renderContent = () => {
        switch (activeTab) {
            case "chat":
                return (
                    <div className="h-[600px] flex flex-col bg-gray-50">
                        <div className="bg-white border-b border-blue-100 p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="bg-blue-100 p-2 rounded-full">
                                        <Train className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">TrainBot Assistant</h3>
                                        <p className="text-sm text-gray-500">Always here to help</p>
                                    </div>
                                </div>
                                <Badge variant="secondary" className="bg-blue-100 text-blue-600">
                                    Online
                                </Badge>
                            </div>
                        </div>

                        <ScrollArea className="flex-1 px-4 py-6">
                            {messages.map((message, index) => (
                                <ChatResponseUI key={index} {...message} />
                            ))}
                            {isLoading && (
                                <div className="flex items-center gap-2 text-sm text-gray-500 ml-4">
                                    <RefreshCcw className="w-4 h-4 animate-spin" />
                                    TrainBot is typing...
                                </div>
                            )}
                        </ScrollArea>

                        <div className="bg-white border-t border-blue-100 p-4">
                            <form onSubmit={handleSend}>
                                <div className="flex gap-2">
                                    <Input
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        placeholder="Type your message..."
                                        className="flex-1 border-blue-100 focus:ring-blue-200"
                                    />
                                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                );
            case "train":
                return (
                    <TrainsData loading={loading} error={error} seeding={seeding} seedData={seedData} trains={trains} />
                );
            default:
                return (
                    <div className="p-6 bg-gray-50">
                        <div className="mx-auto text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Train Enquiry</h2>
                            <p className="text-gray-600 mb-6">Your smart assistant for all train-related information</p>
                            <div className="flex justify-center gap-4">
                                <Button
                                    className="text-white rounded-md bg-blue-600 hover:bg-blue-700"
                                    onClick={() => setActiveTab("chat")}
                                >
                                    Start Chatting <MessageCircle className="w-4 h-4 ml-2" />
                                </Button>

                                {
                                    (error === 'NEED_SEED') ?
                                        <Button
                                            className="text-white rounded-md bg-emerald-600 hover:bg-emerald-700"
                                            onClick={() => seedData()}
                                        >
                                            Seed Data <Bean className="w-4 h-4 ml-2" />
                                        </Button>
                                        :
                                        <Button
                                            className="text-white rounded-md bg-blue-600 hover:bg-blue-700"
                                            onClick={() => setActiveTab("train")}
                                        >
                                            Train List <Train className="w-4 h-4 ml-2" />
                                        </Button>
                                }
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                            <Card className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MessageCircle className="w-5 h-5 text-blue-600" />
                                        Chat Assistance
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    Get real-time support and answers to all your train-related queries
                                </CardContent>
                            </Card>

                            <Card className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Train className="w-5 h-5 text-blue-600" />
                                        Live Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    Track trains in real-time and get instant updates on schedules
                                </CardContent>
                            </Card>

                            <Card className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <List className="w-5 h-5 text-blue-600" />
                                        Route Planning
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    Find the best routes and plan your journey efficiently
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="w-full min-h-screen flex flex-col ">
            <Card className="w-full shadow-lg flex-1">
                <div className="border-b border-blue-100">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="w-full justify-start bg-white p-0">
                            <TabsTrigger value="home" className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
                                <Home className="w-4 h-4" />
                                Home
                            </TabsTrigger>
                            <TabsTrigger value="chat" className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
                                <MessageCircle className="w-4 h-4" />
                                Chat
                            </TabsTrigger>
                            <TabsTrigger value="train" className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
                                <Train className="w-4 h-4" />
                                Train
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
                <CardContent className="p-0">
                    {renderContent()}
                </CardContent>
            </Card>
        </div>
    );
};

export default ChatBot;
