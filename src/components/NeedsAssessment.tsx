
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { FileText, Users, MapPin, Clock, AlertTriangle, CheckCircle } from "lucide-react";

interface NeedCase {
  id: number;
  name: string;
  location: string;
  familySize: number;
  primaryNeeds: string[];
  urgencyScore: number;
  status: 'pending' | 'in-progress' | 'completed';
  submittedDate: Date;
  description: string;
}

export const NeedsAssessment = () => {
  const [showForm, setShowForm] = useState(false);
  const [cases] = useState<NeedCase[]>([
    {
      id: 1,
      name: "Ahmad Hassan",
      location: "Zaatari Camp, Jordan",
      familySize: 5,
      primaryNeeds: ["Medical", "Food", "Education"],
      urgencyScore: 95,
      status: 'pending',
      submittedDate: new Date('2024-01-15'),
      description: "Family with sick child, needs immediate medical attention and ongoing food support"
    },
    {
      id: 2,
      name: "Fatima Al-Said",
      location: "Beirut, Lebanon",
      familySize: 3,
      primaryNeeds: ["Housing", "Legal Aid"],
      urgencyScore: 78,
      status: 'in-progress',
      submittedDate: new Date('2024-01-12'),
      description: "Single mother with two children seeking housing assistance and legal aid for asylum process"
    },
    {
      id: 3,
      name: "Omar Abdullah",
      location: "Berlin, Germany",
      familySize: 4,
      primaryNeeds: ["Education", "Language Support"],
      urgencyScore: 45,
      status: 'completed',
      submittedDate: new Date('2024-01-10'),
      description: "Family settled, children need educational support and language learning resources"
    }
  ]);

  const getUrgencyColor = (score: number) => {
    if (score >= 80) return 'bg-red-100 text-red-800 border-red-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getUrgencyLabel = (score: number) => {
    if (score >= 80) return 'Critical';
    if (score >= 60) return 'High';
    return 'Medium';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'in-progress': return <AlertTriangle className="w-4 h-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const needsCategories = [
    "Medical/Healthcare", "Food & Nutrition", "Housing/Shelter", 
    "Education", "Legal Aid", "Clothing", "Transportation", 
    "Mental Health", "Language Support", "Employment"
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Needs Assessment</h2>
          <p className="text-gray-600 mt-1">Register and prioritize refugee support needs</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
        >
          <FileText className="w-4 h-4 mr-2" />
          New Assessment
        </Button>
      </div>

      {/* Assessment Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Needs Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <Input placeholder="Enter full name" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Family Size</label>
                <Input type="number" placeholder="Number of family members" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Current Location</label>
              <Input placeholder="City, Country or Camp Name" />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Primary Needs (Select all that apply)</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {needsCategories.map((need) => (
                  <label key={need} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">{need}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Detailed Description</label>
              <Textarea 
                placeholder="Please provide detailed information about your situation and specific needs..." 
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Contact Information</label>
                <Input placeholder="Phone number or email" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Preferred Language</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option>English</option>
                  <option>Arabic</option>
                  <option>French</option>
                  <option>Spanish</option>
                  <option>Turkish</option>
                  <option>Persian</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button className="bg-gradient-to-r from-blue-500 to-blue-600">
                Submit Assessment
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cases List */}
      <div className="space-y-4">
        {cases.map((caseItem) => (
          <Card key={caseItem.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold">{caseItem.name}</h3>
                    {getStatusIcon(caseItem.status)}
                    <Badge variant="outline" className="capitalize">
                      {caseItem.status.replace('-', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{caseItem.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{caseItem.familySize} members</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{caseItem.submittedDate.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getUrgencyColor(caseItem.urgencyScore)}>
                    {getUrgencyLabel(caseItem.urgencyScore)}
                  </Badge>
                  <div className="mt-2">
                    <div className="text-sm text-gray-600 mb-1">Urgency Score</div>
                    <div className="w-24">
                      <Progress value={caseItem.urgencyScore} className="h-2" />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{caseItem.urgencyScore}/100</div>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4">{caseItem.description}</p>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-600">Primary Needs: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {caseItem.primaryNeeds.map((need) => (
                      <Badge key={need} variant="secondary" className="text-xs">
                        {need}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                  <Button size="sm">
                    Take Action
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
