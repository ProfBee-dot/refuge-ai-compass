
import { useState } from "react";
import { Dashboard } from "@/components/Dashboard";
import { ChatbotInterface } from "@/components/ChatbotInterface";
import { FundraisingCampaigns } from "@/components/FundraisingCampaigns";
import { NeedsAssessment } from "@/components/NeedsAssessment";
import { ResourceMatching } from "@/components/ResourceMatching";
import { DonorPortal } from "@/components/DonorPortal";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { MessageCircle, DollarSign, FileText, Package, Heart, BarChart3 } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "chatbot":
        return <ChatbotInterface />;
      case "fundraising":
        return <FundraisingCampaigns />;
      case "needs":
        return <NeedsAssessment />;
      case "matching":
        return <ResourceMatching />;
      case "transparency":
        return <DonorPortal />;
      default:
        return <Dashboard />;
    }
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "chatbot", label: "AI Assistant", icon: MessageCircle },
    { id: "fundraising", label: "Fundraising", icon: DollarSign },
    { id: "needs", label: "Needs Assessment", icon: FileText },
    { id: "matching", label: "Resource Matching", icon: Package },
    { id: "transparency", label: "Donor Portal", icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <Header />
      <div className="flex">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          menuItems={menuItems}
        />
        <main className="flex-1 p-6 ml-64">
          <div className="max-w-7xl mx-auto">
            {renderActiveComponent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
