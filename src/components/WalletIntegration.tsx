
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Wallet, CreditCard, Bitcoin, Shield, Plus, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WalletBalance {
  currency: string;
  amount: number;
  symbol: string;
}

export const WalletIntegration = () => {
  const [balances] = useState<WalletBalance[]>([
    { currency: "USD", amount: 1250.75, symbol: "$" },
    { currency: "Bitcoin", amount: 0.0234, symbol: "₿" },
    { currency: "Ethereum", amount: 0.85, symbol: "Ξ" },
  ]);

  const [showBalances, setShowBalances] = useState(true);
  const [depositAmount, setDepositAmount] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const { toast } = useToast();

  const handleDeposit = () => {
    if (!depositAmount) return;
    
    toast({
      title: "Deposit Initiated",
      description: `$${depositAmount} deposit is being processed.`,
    });
    setDepositAmount("");
  };

  const handleCryptoConnect = (wallet: string) => {
    toast({
      title: "Wallet Connection",
      description: `${wallet} wallet connection initiated.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Wallet Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wallet className="w-5 h-5 text-blue-500" />
              <span>Donor Wallet</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBalances(!showBalances)}
            >
              {showBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {balances.map((balance) => (
              <div key={balance.currency} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{balance.currency}</p>
                    <p className="text-lg font-semibold">
                      {showBalances 
                        ? `${balance.symbol}${balance.amount.toLocaleString()}`
                        : "••••••"
                      }
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Active
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Funds
            </Button>
            <Button variant="outline" size="sm">
              <CreditCard className="w-4 h-4 mr-2" />
              Link Card
            </Button>
            <Button variant="outline" size="sm">
              <Shield className="w-4 h-4 mr-2" />
              Security
            </Button>
            <Button variant="outline" size="sm">
              History
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Deposit Section */}
      <Card>
        <CardHeader>
          <CardTitle>Add Funds</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <select 
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button onClick={handleDeposit} className="w-full">
              <CreditCard className="w-4 h-4 mr-2" />
              Deposit with Card
            </Button>
            <Button variant="outline" className="w-full">
              Bank Transfer
            </Button>
          </div>

          <Separator />

          <div>
            <Label className="text-sm font-medium">Payment Methods</Label>
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium">•••• •••• •••• 4567</p>
                    <p className="text-xs text-gray-500">Expires 12/26</p>
                  </div>
                </div>
                <Badge variant="outline">Primary</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Crypto Wallet Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bitcoin className="w-5 h-5 text-orange-500" />
            <span>Crypto Wallets</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => handleCryptoConnect('MetaMask')}
            >
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">M</span>
              </div>
              <span>Connect MetaMask</span>
            </Button>

            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => handleCryptoConnect('WalletConnect')}
            >
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">W</span>
              </div>
              <span>WalletConnect</span>
            </Button>

            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => handleCryptoConnect('Coinbase')}
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">C</span>
              </div>
              <span>Coinbase Wallet</span>
            </Button>

            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => handleCryptoConnect('Trust')}
            >
              <div className="w-8 h-8 bg-blue-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">T</span>
              </div>
              <span>Trust Wallet</span>
            </Button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Secure & Transparent</h4>
                <p className="text-sm text-blue-700 mt-1">
                  All crypto donations are recorded on blockchain for complete transparency. 
                  Your funds are secured with industry-standard encryption.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
