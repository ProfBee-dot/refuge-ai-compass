
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
import { LandingPage } from "@/components/LandingPage";
import { UserProvider, useUser } from "@/contexts/UserContext";
import { MessageCircle, DollarSign, FileText, Package, Heart, BarChart3, Shield } from "lucide-react";

const AppContent = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user, isAdmin, hasPermission, isLoggedIn, loading } = useUser();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show landing page if not logged in
  if (!isLoggedIn) {
    return <LandingPage />;
  }

  const renderActiveComponent = () => {
    // Check permissions before rendering sensitive components
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "chatbot":
        return <ChatbotInterface />;
      case "fundraising":
        return hasPermission(['donor', 'admin', 'volunteer']) ? <FundraisingCampaigns /> : <Dashboard />;
      case "needs":
        return hasPermission(['user', 'admin', 'volunteer']) ? <NeedsAssessment /> : <Dashboard />;
      case "matching":
        return hasPermission(['admin', 'volunteer']) ? <ResourceMatching /> : <Dashboard />;
      case "transparency":
        return <DonorPortal />;
      case "admin":
        return isAdmin ? <AdminDashboard /> : <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  const getMenuItems = () => {
    const allItems = [
      { id: "dashboard", label: "Dashboard", icon: BarChart3, requiredRoles: [] },
      { id: "chatbot", label: "AI Assistant", icon: MessageCircle, requiredRoles: [] },
      { id: "fundraising", label: "Fundraising", icon: DollarSign, requiredRoles: ['donor', 'admin', 'volunteer'] },
      { id: "needs", label: "Needs Assessment", icon: FileText, requiredRoles: ['user', 'admin', 'volunteer'] },
      { id: "matching", label: "Resource Matching", icon: Package, requiredRoles: ['admin', 'volunteer'] },
      { id: "transparency", label: "Donor Portal", icon: Heart, requiredRoles: [] },
      { id: "admin", label: "Admin Panel", icon: Shield, requiredRoles: ['admin'] },
    ];

    return allItems;
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
