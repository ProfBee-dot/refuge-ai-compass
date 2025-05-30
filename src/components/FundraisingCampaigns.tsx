import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Plus, DollarSign, Users, Target, TrendingUp, Loader2 } from "lucide-react";
import { useSupabase } from "@/hooks/useSupabase";
import { useToast } from "@/hooks/use-toast";

interface Campaign {
  id: string;
  title: string;
  description: string;
  target_amount: number;
  raised_amount: number;
  donor_count: number;
  days_left: number;
  status: 'active' | 'completed' | 'urgent';
  category: string;
  created_at: string;
}

export const FundraisingCampaigns = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_amount: '',
    category: 'Medical',
    days_left: '30'
  });

  const { getCampaigns, createCampaign } = useSupabase();
  const { toast } = useToast();

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const data = await getCampaigns();
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast({
        title: "Error",
        description: "Failed to load campaigns",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await createCampaign({
        title: formData.title,
        description: formData.description,
        target_amount: parseFloat(formData.target_amount),
        category: formData.category,
        days_left: parseInt(formData.days_left),
      });

      toast({
        title: "Success",
        description: "Campaign created successfully!",
      });

      setFormData({
        title: '',
        description: '',
        target_amount: '',
        category: 'Medical',
        days_left: '30'
      });
      setShowCreateForm(false);
      loadCampaigns();
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: "Error",
        description: "Failed to create campaign",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const totalStats = {
    totalRaised: campaigns.reduce((sum, campaign) => sum + (campaign.raised_amount || 0), 0),
    totalTarget: campaigns.reduce((sum, campaign) => sum + campaign.target_amount, 0),
    totalDonors: campaigns.reduce((sum, campaign) => sum + (campaign.donor_count || 0), 0),
    activeCampaigns: campaigns.filter(c => c.status === 'active' || c.status === 'urgent').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

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
          <CardContent>
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Campaign Title</label>
                  <Input 
                    placeholder="Enter campaign title" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Funding Target ($)</label>
                  <Input 
                    type="number" 
                    placeholder="50000"
                    value={formData.target_amount}
                    onChange={(e) => setFormData({...formData, target_amount: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea 
                  placeholder="Describe the campaign purpose and impact..." 
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="Medical">Medical</option>
                    <option value="Education">Education</option>
                    <option value="Food">Food</option>
                    <option value="Shelter">Shelter</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Legal">Legal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Duration (days)</label>
                  <Input 
                    type="number" 
                    placeholder="30"
                    value={formData.days_left}
                    onChange={(e) => setFormData({...formData, days_left: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-3">
                <Button 
                  type="submit"
                  className="bg-gradient-to-r from-green-500 to-green-600"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Campaign'
                  )}
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Campaign List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {campaigns.map((campaign) => {
          const progressPercentage = (campaign.raised_amount / campaign.target_amount) * 100;
          
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
                      ${(campaign.raised_amount || 0).toLocaleString()} / ${campaign.target_amount.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-3" />
                  <div className="text-sm text-gray-600 mt-1">
                    {progressPercentage.toFixed(1)}% funded
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-blue-600">{campaign.donor_count || 0}</p>
                    <p className="text-xs text-gray-600">Donors</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-600">
                      {campaign.days_left === 0 ? 'Ended' : `${campaign.days_left}d`}
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
