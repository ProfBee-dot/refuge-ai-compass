
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Package, MapPin, Clock, Users, Truck, CheckCircle, AlertCircle } from "lucide-react";

interface Resource {
  id: number;
  name: string;
  type: string;
  quantity: number;
  unit: string;
  location: string;
  donor: string;
  status: 'available' | 'allocated' | 'delivered';
  urgencyMatch: number;
}

interface Match {
  id: number;
  needId: number;
  resourceId: number;
  recipientName: string;
  recipientLocation: string;
  matchScore: number;
  distance: number;
  estimatedDelivery: string;
  status: 'pending' | 'approved' | 'in-transit' | 'delivered';
}

export const ResourceMatching = () => {
  const [activeTab, setActiveTab] = useState<'resources' | 'matches'>('resources');
  
  const [resources] = useState<Resource[]>([
    {
      id: 1,
      name: "Medical Supply Kit",
      type: "Medical",
      quantity: 50,
      unit: "kits",
      location: "Amman, Jordan",
      donor: "Doctors Without Borders",
      status: 'available',
      urgencyMatch: 95
    },
    {
      id: 2,
      name: "Food Packages",
      type: "Food",
      quantity: 200,
      unit: "packages",
      location: "Beirut, Lebanon",
      donor: "World Food Programme",
      status: 'allocated',
      urgencyMatch: 88
    },
    {
      id: 3,
      name: "Winter Clothing",
      type: "Clothing",
      quantity: 100,
      unit: "sets",
      location: "Berlin, Germany",
      donor: "Local NGO Coalition",
      status: 'delivered',
      urgencyMatch: 72
    }
  ]);

  const [matches] = useState<Match[]>([
    {
      id: 1,
      needId: 1,
      resourceId: 1,
      recipientName: "Ahmad Hassan",
      recipientLocation: "Zaatari Camp, Jordan",
      matchScore: 96,
      distance: 45,
      estimatedDelivery: "2024-01-18",
      status: 'approved'
    },
    {
      id: 2,
      needId: 2,
      resourceId: 2,
      recipientName: "Fatima Al-Said",
      recipientLocation: "Beirut, Lebanon",
      matchScore: 89,
      distance: 12,
      estimatedDelivery: "2024-01-20",
      status: 'in-transit'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'allocated': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delivered': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-transit': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <Package className="w-4 h-4 text-green-500" />;
      case 'allocated': return <Users className="w-4 h-4 text-blue-500" />;
      case 'delivered': return <CheckCircle className="w-4 h-4 text-gray-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'in-transit': return <Truck className="w-4 h-4 text-purple-500" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Resource Matching</h2>
          <p className="text-gray-600 mt-1">AI-powered matching of resources to needs</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={activeTab === 'resources' ? 'default' : 'outline'}
            onClick={() => setActiveTab('resources')}
          >
            <Package className="w-4 h-4 mr-2" />
            Resources
          </Button>
          <Button
            variant={activeTab === 'matches' ? 'default' : 'outline'}
            onClick={() => setActiveTab('matches')}
          >
            <Users className="w-4 h-4 mr-2" />
            Matches
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Available Resources</p>
                <p className="text-xl font-bold">{resources.filter(r => r.status === 'available').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Active Matches</p>
                <p className="text-xl font-bold">{matches.filter(m => m.status !== 'delivered').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Truck className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">In Transit</p>
                <p className="text-xl font-bold">{matches.filter(m => m.status === 'in-transit').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Delivered</p>
                <p className="text-xl font-bold">{matches.filter(m => m.status === 'delivered').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resources Tab */}
      {activeTab === 'resources' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {resources.map((resource) => (
            <Card key={resource.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold">{resource.name}</h3>
                      {getStatusIcon(resource.status)}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <span className="font-medium">{resource.type}</span>
                      <span>{resource.quantity} {resource.unit}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{resource.location}</span>
                    </div>
                  </div>
                  <Badge className={getStatusColor(resource.status)}>
                    {resource.status}
                  </Badge>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Urgency Match</span>
                    <span className="text-sm text-gray-600">{resource.urgencyMatch}%</span>
                  </div>
                  <Progress value={resource.urgencyMatch} className="h-2" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-600">Donor: </span>
                    <span className="text-sm font-medium">{resource.donor}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      Details
                    </Button>
                    {resource.status === 'available' && (
                      <Button size="sm">
                        Match Now
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Matches Tab */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          {matches.map((match) => (
            <Card key={match.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{match.recipientName}</h3>
                      {getStatusIcon(match.status)}
                      <Badge className={getStatusColor(match.status)}>
                        {match.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{match.recipientLocation}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 mb-1">Match Score</div>
                    <div className="text-2xl font-bold text-green-600">{match.matchScore}%</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold text-blue-600">{match.distance} km</p>
                    <p className="text-xs text-gray-600">Distance</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold text-purple-600">{match.estimatedDelivery}</p>
                    <p className="text-xs text-gray-600">Est. Delivery</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold text-green-600">#{match.resourceId}</p>
                    <p className="text-xs text-gray-600">Resource ID</p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    View Details
                  </Button>
                  <Button size="sm" className="flex-1">
                    Track Delivery
                  </Button>
                  {match.status === 'pending' && (
                    <Button size="sm" variant="outline">
                      Approve
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
