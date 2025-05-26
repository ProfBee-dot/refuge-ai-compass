import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Upload, FileText, Heart, Languages, User, AlertTriangle } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { ChatbotInterface } from "@/components/ChatbotInterface";
import { AidRequestForm } from "@/components/AidRequestForm";
import { DocumentUpload } from "@/components/DocumentUpload";

export const RefugeePortal = () => {
  const { user } = useUser();
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const languages = [
    { code: "en", name: "English" },
    { code: "ar", name: "العربية" },
    { code: "fa", name: "فارسی" },
    { code: "fr", name: "Français" },
    { code: "de", name: "Deutsch" },
  ];

  const urgentNeeds = [
    { id: 1, type: "Medical", description: "Emergency medical supplies needed", priority: "urgent", status: "pending" },
    { id: 2, type: "Food", description: "Baby formula and food supplies", priority: "high", status: "in_progress" },
    { id: 3, type: "Legal", description: "Documentation assistance", priority: "medium", status: "pending" },
  ];

  const campaignUpdates = [
    { id: 1, title: "Winter Clothing Distribution", status: "active", progress: 75, lastUpdate: "2 days ago" },
    { id: 2, title: "Medical Aid Package", status: "completed", progress: 100, lastUpdate: "1 week ago" },
  ];

  return (
    <div className="space-y-6 p-4 max-w-6xl mx-auto">
      {/* Header with Language Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Refugee Support Portal</h2>
          <p className="text-gray-600">Your personalized assistance dashboard</p>
        </div>
        <div className="flex items-center space-x-2">
          <Languages className="w-4 h-4 text-gray-500" />
          <select 
            value={selectedLanguage} 
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="text-sm border rounded-md px-2 py-1"
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="chat">Chat Support</TabsTrigger>
          <TabsTrigger value="request">Request Aid</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Urgent Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span>Urgent Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded">
                  <p className="text-sm font-medium text-red-800">Medical appointment scheduled for tomorrow at 2:00 PM</p>
                  <p className="text-xs text-red-600 mt-1">Location: Health Center, Building A</p>
                </div>
                <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                  <p className="text-sm font-medium text-blue-800">New aid package available for pickup</p>
                  <p className="text-xs text-blue-600 mt-1">Available until Friday</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">3</div>
                <div className="text-sm text-gray-600">Active Requests</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">8</div>
                <div className="text-sm text-gray-600">Completed Aids</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">2</div>
                <div className="text-sm text-gray-600">Linked Campaigns</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">89%</div>
                <div className="text-sm text-gray-600">Profile Complete</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <ChatbotInterface />
        </TabsContent>

        <TabsContent value="request" className="space-y-4">
          <AidRequestForm />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <DocumentUpload />
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Linked Aid Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaignUpdates.map((campaign) => (
                  <div key={campaign.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold">{campaign.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">Last updated: {campaign.lastUpdate}</p>
                      </div>
                      <Badge variant={campaign.status === 'completed' ? 'default' : 'secondary'}>
                        {campaign.status}
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${campaign.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{campaign.progress}% complete</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Profile Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-sm text-gray-900">{user?.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{user?.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Current Location</label>
                    <p className="mt-1 text-sm text-gray-900">Jordan - Amman</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Registration Date</label>
                    <p className="mt-1 text-sm text-gray-900">January 15, 2024</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Update Profile Information
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RefugeePortal;
