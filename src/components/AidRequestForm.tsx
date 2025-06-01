
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, MapPin, Users, Calendar, AlertTriangle, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AidRequest {
  requestType: string;
  urgency: string;
  description: string;
  location: string;
  familySize: string;
  contactInfo: string;
  preferredLanguage: string;
  additionalNotes: string;
}

export const AidRequestForm = () => {
  const [formData, setFormData] = useState<AidRequest>({
    requestType: "",
    urgency: "",
    description: "",
    location: "",
    familySize: "",
    contactInfo: "",
    preferredLanguage: "",
    additionalNotes: ""
  });

  const { toast } = useToast();

  const requestTypes = [
    "Medical Emergency",
    "Food & Water",
    "Shelter & Housing",
    "Legal Assistance",
    "Education Support",
    "Mental Health",
    "Documentation Help",
    "Family Reunification",
    "Transportation",
    "Employment Assistance"
  ];

  const urgencyLevels = [
    { value: "critical", label: "Critical - Life Threatening", color: "bg-red-100 text-red-800" },
    { value: "urgent", label: "Urgent - Within 24 Hours", color: "bg-orange-100 text-orange-800" },
    { value: "high", label: "High - Within 3 Days", color: "bg-yellow-100 text-yellow-800" },
    { value: "normal", label: "Normal - Within 1 Week", color: "bg-green-100 text-green-800" }
  ];

  const languages = [
    "English", "Arabic", "French", "Spanish", "German", 
    "Turkish", "Persian", "Kurdish", "Somali", "Dari"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "Request Submitted",
      description: "Your aid request has been submitted. You'll receive updates via your preferred contact method.",
    });

    // Reset form
    setFormData({
      requestType: "",
      urgency: "",
      description: "",
      location: "",
      familySize: "",
      contactInfo: "",
      preferredLanguage: "",
      additionalNotes: ""
    });
  };

  const handleInputChange = (field: keyof AidRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-blue-500" />
          <span>Submit Aid Request</span>
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          Fill out this form to request assistance. All information is confidential and secure.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Priority Information */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Emergency?</h4>
                <p className="text-sm text-blue-700 mt-1">
                  If this is a life-threatening emergency, please contact local emergency services first.
                  Then submit this form for additional support.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="requestType">Type of Assistance Needed</Label>
              <Select onValueChange={(value) => handleInputChange("requestType", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select assistance type" />
                </SelectTrigger>
                <SelectContent>
                  {requestTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
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
                      <div className="flex items-center space-x-2">
                        <Badge className={level.color} variant="outline">
                          {level.label}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description of Need</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Please describe your situation and what kind of help you need..."
              rows={4}
              required
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location" className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>Current Location</span>
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="City, Country or Camp Name"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="familySize" className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>Family Size</span>
              </Label>
              <Input
                id="familySize"
                type="number"
                value={formData.familySize}
                onChange={(e) => handleInputChange("familySize", e.target.value)}
                placeholder="Number of people"
                required
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactInfo">Contact Information</Label>
              <Input
                id="contactInfo"
                value={formData.contactInfo}
                onChange={(e) => handleInputChange("contactInfo", e.target.value)}
                placeholder="Phone number or email"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="preferredLanguage">Preferred Language</Label>
              <Select onValueChange={(value) => handleInputChange("preferredLanguage", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((language) => (
                    <SelectItem key={language} value={language}>
                      {language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
            <Textarea
              id="additionalNotes"
              value={formData.additionalNotes}
              onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
              placeholder="Any additional information that might be helpful..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="flex space-x-4">
            <Button type="submit" className="flex-1">
              <Send className="w-4 h-4 mr-2" />
              Submit Request
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setFormData({
                requestType: "",
                urgency: "",
                description: "",
                location: "",
                familySize: "",
                contactInfo: "",
                preferredLanguage: "",
                additionalNotes: ""
              })}
            >
              Clear Form
            </Button>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>• Your request will be reviewed within 24 hours</p>
            <p>• You'll receive updates at your provided contact information</p>
            <p>• All information is kept confidential and secure</p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
