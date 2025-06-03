
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, DollarSign, Package, Users, MapPin, Calendar, Eye, Download, Shield, Plus, Wallet2Icon, Hand, HandHeart, HandHeartIcon, PlusIcon, MedalIcon, ArrowLeftIcon } from "lucide-react";
import { CampaignCreation } from "./CampaignCreation";
import { WalletIntegration } from "./WalletIntegration";
import { SmartFilter } from "./SmartFilter";
import { DonorImpact } from "./DonorImpact";


interface Donation {
  id: number;
  amount: number;
  campaign: string;
  date: Date;
  status: 'completed' | 'pending' | 'processing';
  type: 'monetary' | 'resource';
  recipient?: string;
  impact?: string;
}

interface ImpactMetric {
  label: string;
  value: string;
  icon: any;
  color: string;
}

export const DonorPortal = () => {
  console.log("DonorPortal component rendered");
  
  const [donations] = useState<Donation[]>([
    {
      id: 1,
      amount: 500,
      campaign: "Emergency Medical Supplies for Syrian Families",
      date: new Date('2024-01-15'),
      status: 'completed',
      type: 'monetary',
      recipient: "Ahmad Hassan's Family",
      impact: "Provided medical supplies for 5 people"
    },
    {
      id: 2,
      amount: 250,
      campaign: "Education Support for Refugee Children",
      date: new Date('2024-01-10'),
      status: 'completed',
      type: 'monetary',
      recipient: "Zaatari Camp School",
      impact: "Funded school supplies for 12 children"
    },
    {
      id: 3,
      amount: 1000,
      campaign: "Winter Clothing Distribution",
      date: new Date('2024-01-08'),
      status: 'processing',
      type: 'monetary',
      impact: "Processing winter clothing for 20 families"
    }
  ]);


  const blockchainEntries = [
    {
      id: 1,
      hash: "0x1a2b3c4d5e6f7890abcdef1234567890",
      type: "Donation",
      amount: "$500",
      timestamp: "2024-01-15 14:32:18 UTC",
      recipient: "Ahmad Hassan",
      verified: true
    },
    {
      id: 2,
      hash: "0x9876543210fedcba0987654321abcdef",
      type: "Delivery",
      amount: "Medical Kit",
      timestamp: "2024-01-16 09:45:22 UTC",
      recipient: "Ahmad Hassan",
      verified: true
    },
    {
      id: 3,
      hash: "0xabcdef1234567890fedcba9876543210",
      type: "Donation",
      amount: "$250",
      timestamp: "2024-01-10 16:21:45 UTC",
      recipient: "Zaatari School",
      verified: true
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 w-full min-h-screen p-4 md:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Donor Portal</h2>
          <p className="text-gray-600 mt-1">Create campaigns, track impact, and manage donations</p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-green-500" />
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Verified Donor
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="discover" className="space-y-4 w-full">
        <TabsList className="fixed flex z-20 h-max gap-3 p-2 shadow-md items-center justify-between left-0 bottom-0 md:grid md:p-0 w-full md:grid-cols-5 md:relative">
          <TabsTrigger className="flex gap-1" value="discover">
            <Package className="w-5 flex-shrink-0 h-5 mr-1" />
            <span className="hidden md:block">
            Discover
            </span>
          </TabsTrigger>
          <TabsTrigger className="flex gap-1" value="create">
            <PlusIcon className="w-5 flex-shrink-0 h-5 mr-1" />
            <span className="hidden md:block">
              Create Campaign
            </span>
          </TabsTrigger>
          <TabsTrigger className="flex gap-1" value="donations">
            <HandHeartIcon className="w-5 flex-shrink-0 h-5 mr-1" />
            <span className="hidden md:block">
            My Donations
            </span>
          </TabsTrigger>
          <TabsTrigger className="flex gap-1" value="wallet">
            <Wallet2Icon className="w-5 flex-shrink-0 h-5 mr-1" />
              <span className="hidden md:block">
              Wallet
              </span>
          </TabsTrigger>
          <TabsTrigger className="flex gap-1" value="impact">
              <MedalIcon className="w-5 h-5 flex-shrink-0 mr-1" />
              <span className="hidden md:block">
              Impact
              </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discover"  className="anime-start space-y-4">
          <SmartFilter />
        </TabsContent>

        <TabsContent value="create"  className="anime-start space-y-4">
          <CampaignCreation />
        </TabsContent>

        <TabsContent value="donations"  className="anime-start space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {donations.map((donation) => (
              <Card key={donation.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{donation.campaign}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4" />
                          <span>${donation.amount}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{donation.date.toLocaleDateString()}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {donation.type}
                        </Badge>
                      </div>
                      {donation.recipient && (
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Recipient:</strong> {donation.recipient}
                        </p>
                      )}
                      {donation.impact && (
                        <p className="text-sm text-green-700 bg-green-50 p-2 rounded-lg">
                          <strong>Impact:</strong> {donation.impact}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(donation.status)}>
                        {donation.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Receipt
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="wallet"  className="anime-start space-y-4">
          <WalletIntegration />
        </TabsContent>

        <TabsContent value="impact"  className="anime-start space-y-4">
          <DonorImpact />
        </TabsContent>

        <TabsContent value="blockchain"  className="anime-start space-y-4">

          <Card>
            <CardHeader>
              <TabsTrigger className="flex gap-1" value="wallet">
                <ArrowLeftIcon className="w-5 flex-shrink-0 h-5 mr-1" />
                <span className="hidden md:block">
                  Back
                </span>
              </TabsTrigger>

              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-500" />
                <span>Blockchain Transaction Ledger</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div  className="anime-start space-y-4">
                {blockchainEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {entry.type}
                        </Badge>
                        <span className="text-sm font-medium">{entry.amount}</span>
                        {entry.verified && (
                          <div className="flex items-center space-x-1">
                            <Shield className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-green-600">Verified</span>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <p><strong>Hash:</strong> {entry.hash}</p>
                        <p><strong>Timestamp:</strong> {entry.timestamp}</p>
                        <p><strong>Recipient:</strong> {entry.recipient}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      View on Chain
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};


const BlockchainIntegration = _ =>{

  

}