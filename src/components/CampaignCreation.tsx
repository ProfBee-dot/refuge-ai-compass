
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, DollarSign, Calendar, Target, Image, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CampaignForm {
  title: string;
  description: string;
  targetAmount: string;
  location: string;
  category: string;
  urgency: string;
  endDate: string;
}

export const CampaignCreation = () => {
  const [formData, setFormData] = useState<CampaignForm>({
    title: "",
    description: "",
    targetAmount: "",
    location: "",
    category: "",
    urgency: "",
    endDate: ""
  });
  const { toast } = useToast();

  const categories = [
    "Medical Emergency",
    "Food & Nutrition",
    "Shelter & Housing",
    "Education",
    "Legal Aid",
    "Mental Health",
    "Family Reunification"
  ];

  const urgencyLevels = [
    { value: "critical", label: "Critical", color: "bg-red-100 text-red-800" },
    { value: "high", label: "High", color: "bg-orange-100 text-orange-800" },
    { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
    { value: "low", label: "Low", color: "bg-green-100 text-green-800" }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Campaign Created",
      description: "Your campaign has been submitted for review.",
    });
    // Reset form
    setFormData({
      title: "",
      description: "",
      targetAmount: "",
      location: "",
      category: "",
      urgency: "",
      endDate: ""
    });
  };

  const handleInputChange = (field: keyof CampaignForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-blue-500" />
          <span>Create New Campaign</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Campaign Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Emergency medical aid for..."
                required
                className="mt-1"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe the situation and how donations will help..."
                rows={4}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="targetAmount" className="flex items-center space-x-1">
                <DollarSign className="w-4 h-4" />
                <span>Target Amount (USD)</span>
              </Label>
              <Input
                id="targetAmount"
                type="number"
                value={formData.targetAmount}
                onChange={(e) => handleInputChange("targetAmount", e.target.value)}
                placeholder="5000"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="location" className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>Location</span>
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="City, Country"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="urgency">Urgency Level</Label>
              <Select onValueChange={(value) => handleInputChange("urgency", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select urgency" />
                </SelectTrigger>
                <SelectContent>
                  {urgencyLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${level.color}`}>
                        {level.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="endDate" className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>End Date</span>
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange("endDate", e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="media">Campaign Media</Label>
              <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer">
                <Image className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Click to upload images or videos</p>
                <p className="text-xs text-gray-500 mt-1">Max 5 files, 10MB each</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button type="submit" className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
            <Button type="button" variant="outline" onClick={() => setFormData({
              title: "",
              description: "",
              targetAmount: "",
              location: "",
              category: "",
              urgency: "",
              endDate: ""
            })}>
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
