
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Plus, DollarSign, Users, Calendar, Target, TrendingUp } from "lucide-react";

interface Campaign {
  id: number;
  title: string;
  description: string;
  target: number;
  raised: number;
  donors: number;
  daysLeft: number;
  status: 'active' | 'completed' | 'urgent';
  category: string;
}

export const FundraisingCampaigns = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [campaigns] = useState<Campaign[]>([
    {
      id: 1,
      title: "Emergency Medical Supplies for Syrian Families",
      description: "Urgent medical supplies needed for 200 families in refugee camps",
      target: 50000,
      raised: 32500,
      donors: 127,
      daysLeft: 12,
      status: 'urgent',
      category: 'Medical'
    },
    {
      id: 2,
      title: "Education Support for Refugee Children",
      description: "School supplies and educational materials for displaced children",
      target: 25000,
      raised: 18750,
      donors: 89,
      daysLeft: 25,
      status: 'active',
      category: 'Education'
    },
    {
      id: 3,
      title: "Winter Clothing Distribution",
      description: "Warm clothing for families facing harsh winter conditions",
      target: 35000,
      raised: 35000,
      donors: 156,
      daysLeft: 0,
      status: 'completed',
      category: 'Clothing'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const totalStats = {
    totalRaised: campaigns.reduce((sum, campaign) => sum + campaign.raised, 0),
    totalTarget: campaigns.reduce((sum, campaign) => sum + campaign.target, 0),
    totalDonors: campaigns.reduce((sum, campaign) => sum + campaign.donors, 0),
    activeCampaigns: campaigns.filter(c => c.status === 'active' || c.status === 'urgent').length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Fundraising Campaigns</h2>
          <p className="text-gray-600 mt-1">Manage and track donation campaigns</p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Raised</p>
                <p className="text-xl font-bold">${totalStats.totalRaised.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Target</p>
                <p className="text-xl font-bold">${totalStats.totalTarget.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Donors</p>
                <p className="text-xl font-bold">{totalStats.totalDonors}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Active Campaigns</p>
                <p className="text-xl font-bold">{totalStats.activeCampaigns}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Campaign Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Campaign</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Campaign Title</label>
                <Input placeholder="Enter campaign title" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Funding Target ($)</label>
                <Input type="number" placeholder="50000" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea placeholder="Describe the campaign purpose and impact..." rows={3} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option>Medical</option>
                  <option>Education</option>
                  <option>Food</option>
                  <option>Shelter</option>
                  <option>Clothing</option>
                  <option>Emergency</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Duration (days)</label>
                <Input type="number" placeholder="30" />
              </div>
            </div>
            <div className="flex space-x-3">
              <Button className="bg-gradient-to-r from-green-500 to-green-600">
                Create Campaign
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campaign List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {campaigns.map((campaign) => {
          const progressPercentage = (campaign.raised / campaign.target) * 100;
          
          return (
            <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{campaign.title}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{campaign.description}</p>
                  </div>
                  <Badge className={getStatusColor(campaign.status)}>
                    {campaign.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-gray-600">
                      ${campaign.raised.toLocaleString()} / ${campaign.target.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-3" />
                  <div className="text-sm text-gray-600 mt-1">
                    {progressPercentage.toFixed(1)}% funded
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-blue-600">{campaign.donors}</p>
                    <p className="text-xs text-gray-600">Donors</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-600">
                      {campaign.daysLeft === 0 ? 'Ended' : `${campaign.daysLeft}d`}
                    </p>
                    <p className="text-xs text-gray-600">Days Left</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-purple-600">{campaign.category}</p>
                    <p className="text-xs text-gray-600">Category</p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button size="sm" className="flex-1">
                    View Details
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
