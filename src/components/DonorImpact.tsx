import { DollarSignIcon, HeartIcon, MapPinIcon, UsersIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";



interface ImpactMetric {
    label: string;
    value: string;
    icon: any;
    color: string;
  }


export const DonorImpact = _ => {
    
  const impactMetrics: ImpactMetric[] = [
    {
      label: "People Helped",
      value: "127",
      icon: UsersIcon,
      color: "text-blue-600"
    },
    {
      label: "Total Donated",
      value: "$1,750",
      icon: DollarSignIcon,
      color: "text-green-600"
    },
    {
      label: "Campaigns Supported",
      value: "8",
      icon: HeartIcon,
      color: "text-red-600"
    },
    {
      label: "Countries Reached",
      value: "3",
      icon: MapPinIcon,
      color: "text-purple-600"
    }
  ];

    return (
        <>

          {/* Impact Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {impactMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <Card key={metric.label}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-50 rounded-lg">
                        <Icon className={`w-5 h-5 ${metric.color}`} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{metric.label}</p>
                        <p className="text-xl font-bold">{metric.value}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Geographic Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div  className="anime-start space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Jordan</span>
                      <span className="text-sm text-gray-600">65 people</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Lebanon</span>
                      <span className="text-sm text-gray-600">42 people</span>
                    </div>
                    <Progress value={55} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Germany</span>
                      <span className="text-sm text-gray-600">20 people</span>
                    </div>
                    <Progress value={30} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Support Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div  className="anime-start space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Medical</span>
                      <span className="text-sm text-gray-600">$850</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Education</span>
                      <span className="text-sm text-gray-600">$500</span>
                    </div>
                    <Progress value={50} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Housing</span>
                      <span className="text-sm text-gray-600">$400</span>
                    </div>
                    <Progress value={40} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Success Stories</CardTitle>
            </CardHeader>
            <CardContent>
              <div  className="anime-start space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <h4 className="font-semibold text-blue-900">Ahmad Hassan's Recovery</h4>
                  <p className="text-blue-800 text-sm mt-1">
                    Thanks to your $500 donation, Ahmad's family received critical medical supplies. 
                    His daughter's condition has improved significantly, and the family is now stable.
                  </p>
                  <p className="text-xs text-blue-600 mt-2">Updated 2 days ago</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                  <h4 className="font-semibold text-green-900">Zaatari School Program</h4>
                  <p className="text-green-800 text-sm mt-1">
                    Your education support helped 12 children return to school with proper supplies. 
                    All children are now attending classes regularly.
                  </p>
                  <p className="text-xs text-green-600 mt-2">Updated 5 days ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
    )
}