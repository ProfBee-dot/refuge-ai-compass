
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, MapPin, DollarSign, Calendar, Heart } from "lucide-react";

interface FilterState {
  search: string;
  category: string;
  location: string;
  urgency: string;
  amountRange: string;
  sortBy: string;
}

interface Campaign {
  id: number;
  title: string;
  description: string;
  targetAmount: number;
  raisedAmount: number;
  location: string;
  category: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  daysLeft: number;
  beneficiaries: number;
}

export const SmartFilter = () => {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "all",
    location: "all",
    urgency: "all",
    amountRange: "any",
    sortBy: "newest"
  });

  const [campaigns] = useState<Campaign[]>([
    {
      id: 1,
      title: "Emergency Medical Care for Syrian Refugees",
      description: "Urgent medical supplies needed for refugee families in Jordan",
      targetAmount: 15000,
      raisedAmount: 8500,
      location: "Jordan",
      category: "Medical Emergency",
      urgency: "critical",
      daysLeft: 12,
      beneficiaries: 45
    },
    {
      id: 2,
      title: "Education Support for Refugee Children",
      description: "School supplies and educational materials for displaced children",
      targetAmount: 8000,
      raisedAmount: 5200,
      location: "Lebanon",
      category: "Education",
      urgency: "high",
      daysLeft: 28,
      beneficiaries: 120
    },
    {
      id: 3,
      title: "Winter Shelter Initiative",
      description: "Providing warm shelter for families during winter months",
      targetAmount: 25000,
      raisedAmount: 18000,
      location: "Germany",
      category: "Shelter & Housing",
      urgency: "medium",
      daysLeft: 45,
      beneficiaries: 80
    }
  ]);

  const categories = [
    "Medical Emergency",
    "Food & Nutrition", 
    "Shelter & Housing",
    "Education",
    "Legal Aid",
    "Mental Health"
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgressPercentage = (raised: number, target: number) => {
    return Math.min((raised / target) * 100, 100);
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    return (
      campaign.title.toLowerCase().includes(filters.search.toLowerCase()) &&
      (filters.category === "all" || campaign.category === filters.category) &&
      (filters.location === "all" || campaign.location.toLowerCase().includes(filters.location.toLowerCase())) &&
      (filters.urgency === "all" || campaign.urgency === filters.urgency)
    );
  });

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-blue-500" />
            <span>Smart Campaign Filter</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search campaigns..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="pl-10"
              />
            </div>
            <Select onValueChange={(value) => setFilters({...filters, category: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem> {/* Use "all" instead of an empty string */}
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Location..."
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select onValueChange={(value) => setFilters({...filters, urgency: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Urgency</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={(value) => setFilters({...filters, amountRange: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Target Amount" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Amount</SelectItem>
                <SelectItem value="0-5000">$0 - $5,000</SelectItem>
                <SelectItem value="5000-15000">$5,000 - $15,000</SelectItem>
                <SelectItem value="15000+">$15,000+</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={(value) => setFilters({...filters, sortBy: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="urgent">Most Urgent</SelectItem>
                <SelectItem value="progress">Progress</SelectItem>
                <SelectItem value="amount">Target Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            variant="outline" 
            onClick={() => setFilters({
              search: "",
              category: "",
              location: "",
              urgency: "",
              amountRange: "",
              sortBy: "newest"
            })}
          >
            Clear Filters
          </Button>
        </CardContent>
      </Card>

      {/* Campaign Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {filteredCampaigns.length} Campaigns Found
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCampaigns.map((campaign) => (
            <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-sm line-clamp-2">{campaign.title}</h4>
                    <Badge className={getUrgencyColor(campaign.urgency)}>
                      {campaign.urgency}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2">{campaign.description}</p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">
                        ${campaign.raisedAmount.toLocaleString()} / ${campaign.targetAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage(campaign.raisedAmount, campaign.targetAmount)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span>{campaign.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{campaign.daysLeft} days left</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1">
                      <Heart className="w-3 h-3 mr-1" />
                      Donate
                    </Button>
                    <Button size="sm" variant="outline">
                      <DollarSign className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
