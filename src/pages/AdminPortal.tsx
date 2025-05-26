
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, Users, AlertTriangle, DollarSign, Package, 
  CheckCircle, XCircle, Clock, Eye, Settings, BarChart3 
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";

export const AdminPortal = () => {
  const { user } = useUser();

  const pendingApprovals = [
    { id: 1, type: "Refugee Registration", name: "Ahmad Hassan", location: "Jordan", priority: "high", submitted: "2 hours ago" },
    { id: 2, type: "Campaign Creation", name: "Winter Aid 2024", amount: "$50,000", priority: "medium", submitted: "5 hours ago" },
    { id: 3, type: "Donor Verification", name: "Sarah Johnson", amount: "$10,000", priority: "low", submitted: "1 day ago" },
  ];

  const systemAlerts = [
    { id: 1, type: "Critical", message: "Low medical supplies in Zaatari Camp", time: "30 min ago", status: "active" },
    { id: 2, type: "Warning", message: "High volume of new registrations", time: "2 hours ago", status: "active" },
    { id: 3, type: "Info", message: "Monthly report ready for review", time: "1 day ago", status: "resolved" },
  ];

  const quickStats = [
    { label: "Pending Approvals", value: "12", icon: Clock, color: "text-orange-600", bgColor: "bg-orange-50" },
    { label: "Active Campaigns", value: "47", icon: DollarSign, color: "text-green-600", bgColor: "bg-green-50" },
    { label: "Registered Refugees", value: "2,847", icon: Users, color: "text-blue-600", bgColor: "bg-blue-50" },
    { label: "Critical Alerts", value: "3", icon: AlertTriangle, color: "text-red-600", bgColor: "bg-red-50" },
  ];

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'Warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Admin Control Panel</h2>
          <p className="text-gray-600 mt-1">Manage all platform operations and approvals</p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-green-500" />
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Super Admin
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="approvals" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingApprovals.map((item) => (
                  <div key={item.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold">{item.type}</h4>
                          <Badge variant={item.priority === 'high' ? 'destructive' : item.priority === 'medium' ? 'default' : 'secondary'}>
                            {item.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{item.name}</p>
                        {item.location && <p className="text-xs text-gray-500">Location: {item.location}</p>}
                        {item.amount && <p className="text-xs text-gray-500">Amount: {item.amount}</p>}
                        <p className="text-xs text-gray-400 mt-1">Submitted: {item.submitted}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemAlerts.map((alert) => (
                  <div key={alert.id} className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {alert.type}
                          </Badge>
                          <span className="text-xs text-gray-600">{alert.time}</span>
                        </div>
                        <p className="font-medium">{alert.message}</p>
                      </div>
                      <Badge variant={alert.status === 'active' ? 'destructive' : 'default'} className="text-xs">
                        {alert.status}
                      </Badge>
                    </div>
                    {alert.status === 'active' && (
                      <div className="flex space-x-2 mt-3">
                        <Button size="sm">
                          Resolve
                        </Button>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">2,847</div>
                  <div className="text-sm text-blue-700">Total Refugees</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">1,234</div>
                  <div className="text-sm text-green-700">Active Donors</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">89</div>
                  <div className="text-sm text-purple-700">Volunteers</div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button>
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  User Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">$1.2M</div>
                    <div className="text-sm text-green-700">Total Funds Raised</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">47</div>
                    <div className="text-sm text-blue-700">Active Campaigns</div>
                  </div>
                </div>
                <Button>
                  <Package className="w-4 h-4 mr-2" />
                  Manage Campaigns
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-600">89%</div>
                    <div className="text-sm text-gray-700">User Satisfaction</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-600">24h</div>
                    <div className="text-sm text-gray-700">Avg Response Time</div>
                  </div>
                </div>
                <Button>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Full Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPortal;
