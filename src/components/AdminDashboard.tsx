
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Shield, AlertTriangle, TrendingUp, Heart, DollarSign } from 'lucide-react';

export const AdminDashboard = () => {
  const stats = [
    { label: 'Total Users', value: '1,247', icon: Users, color: 'text-blue-600', trend: '+12%' },
    { label: 'Active Cases', value: '89', icon: AlertTriangle, color: 'text-orange-600', trend: '+5%' },
    { label: 'Funds Raised', value: '$45,670', icon: DollarSign, color: 'text-green-600', trend: '+18%' },
    { label: 'Resources Delivered', value: '234', icon: Heart, color: 'text-red-600', trend: '+8%' },
  ];

  const recentActivity = [
    { user: 'Sarah Johnson', action: 'Created new case', time: '2 minutes ago', type: 'case' },
    { user: 'Admin System', action: 'Generated monthly report', time: '1 hour ago', type: 'system' },
    { user: 'Mike Chen', action: 'Donated $500', time: '3 hours ago', type: 'donation' },
    { user: 'Emma Wilson', action: 'Volunteer registered', time: '5 hours ago', type: 'volunteer' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h2>
          <p className="text-gray-600 mt-1">Manage and monitor the RefugeeAI platform</p>
        </div>
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 px-3 py-1">
          <Shield className="w-4 h-4 mr-1" />
          Administrator Access
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="hover:shadow-lg transition-all duration-300 hover:scale-105 animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.label}
                </CardTitle>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center space-x-1 text-xs text-green-600 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>{stat.trend}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-slide-in-right">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">{activity.user}</p>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className={
                      activity.type === 'case' ? 'bg-orange-50 text-orange-700' :
                      activity.type === 'donation' ? 'bg-green-50 text-green-700' :
                      activity.type === 'volunteer' ? 'bg-blue-50 text-blue-700' :
                      'bg-gray-50 text-gray-700'
                    }>
                      {activity.type}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-in-left">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-20 flex flex-col hover:scale-105 transition-all duration-300">
                <Users className="w-6 h-6 mb-2 text-blue-600" />
                <span className="text-sm">Manage Users</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col hover:scale-105 transition-all duration-300">
                <AlertTriangle className="w-6 h-6 mb-2 text-orange-600" />
                <span className="text-sm">Review Cases</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col hover:scale-105 transition-all duration-300">
                <DollarSign className="w-6 h-6 mb-2 text-green-600" />
                <span className="text-sm">Fund Management</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col hover:scale-105 transition-all duration-300">
                <Heart className="w-6 h-6 mb-2 text-red-600" />
                <span className="text-sm">Resources</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
