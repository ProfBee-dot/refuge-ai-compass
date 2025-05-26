
import { useState } from "react";
import { Dashboard } from "@/components/Dashboard";
import { ChatbotInterface } from "@/components/ChatbotInterface";
import { FundraisingCampaigns } from "@/components/FundraisingCampaigns";
import { NeedsAssessment } from "@/components/NeedsAssessment";
import { ResourceMatching } from "@/components/ResourceMatching";
import { DonorPortal } from "@/components/DonorPortal";
import { AdminDashboard } from "@/components/AdminDashboard";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { UserProvider, useUser } from "@/contexts/UserContext";
import { MessageCircle, DollarSign, FileText, Package, Heart, BarChart3, Shield } from "lucide-react";

const AppContent = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user, isAdmin } = useUser();

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
      case "admin":
        return isAdmin ? <AdminDashboard /> : <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  const getMenuItems = () => {
    const baseItems = [
      { id: "dashboard", label: "Dashboard", icon: BarChart3 },
      { id: "chatbot", label: "AI Assistant", icon: MessageCircle },
      { id: "fundraising", label: "Fundraising", icon: DollarSign },
      { id: "needs", label: "Needs Assessment", icon: FileText },
      { id: "matching", label: "Resource Matching", icon: Package },
      { id: "transparency", label: "Donor Portal", icon: Heart },
    ];

    if (isAdmin) {
      baseItems.push({ id: "admin", label: "Admin Panel", icon: Shield });
    }

    return baseItems;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 animate-fade-in">
      <Header />
      <div className="flex">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          menuItems={getMenuItems()}
        />
        <main className="flex-1 p-6 ml-64 animate-slide-in-right">
          <div className="max-w-7xl mx-auto">
            {renderActiveComponent()}
          </div>
        </main>
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
};

export default Index;
