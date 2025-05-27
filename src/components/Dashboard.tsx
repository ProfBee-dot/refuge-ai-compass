
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Users, DollarSign, Package, AlertTriangle, TrendingUp, Globe } from "lucide-react";

export const Dashboard = () => {
  const stats = [
    {
      title: "Active Cases",
      value: "2,847",
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Funds Raised",
      value: "$1.2M",
      change: "+8%",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Resources Delivered",
      value: "15,234",
      change: "+23%",
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Urgent Cases",
      value: "127",
      change: "-5%",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50"
    }
  ];

  const recentActivity = [
    { id: 1, type: "New Case", description: "Family of 4 registered in Lebanon", time: "2 min ago", status: "urgent" },
    { id: 2, type: "Donation", description: "$500 received for medical supplies", time: "5 min ago", status: "success" },
    { id: 3, type: "Delivery", description: "Food package delivered to Jordan camp", time: "12 min ago", status: "completed" },
    { id: 4, type: "Alert", description: "Low inventory: medical supplies", time: "18 min ago", status: "warning" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1">Global refugee support overview</p>
        </div>
        <div className="flex items-center space-x-2">
          <Globe className="w-5 h-5 text-blue-500" />
          <span className="text-sm font-medium text-gray-600">Last updated: Just now</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">{stat.change}</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Impact */}
        <Card>
          <CardHeader>
            <CardTitle>Regional Impact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Middle East</span>
                  <span className="text-sm text-gray-600">1,247 cases</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Europe</span>
                  <span className="text-sm text-gray-600">892 cases</span>
                </div>
                <Progress value={55} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Africa</span>
                  <span className="text-sm text-gray-600">708 cases</span>
                </div>
                <Progress value={42} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{activity.type}</span>
                      <Badge
                        variant={activity.status === 'urgent' ? 'destructive' : 
                               activity.status === 'success' ? 'default' :
                               activity.status === 'warning' ? 'secondary' : 'outline'}
                        className="text-xs"
                      >
                        {activity.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Setup Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">Admin Access</h3>
              <p className="text-sm text-blue-700">
                To access admin features and create test accounts, please contact your system administrator or check the AdminSetup component.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
