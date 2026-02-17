import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const PrivacySettings = () => {
  const { toast } = useToast();
  const [essential] = useState(true);
  const [analytics, setAnalytics] = useState(true);
  const [advertising, setAdvertising] = useState(false);

  const handleSave = () => {
    toast({
      title: "Preferences saved",
      description: "Your privacy settings have been updated.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-24 max-w-3xl">
        <h1 className="font-display text-4xl font-bold text-foreground mb-4">Privacy Settings</h1>
        <p className="text-muted-foreground mb-10 leading-relaxed">
          Manage how FareFinder uses cookies and data on your device. Essential cookies cannot be disabled as they are required for the website to function.
        </p>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-5 rounded-xl border border-border bg-card">
            <div>
              <Label className="text-base font-semibold text-foreground">Essential Cookies</Label>
              <p className="text-sm text-muted-foreground mt-1">Required for core functionality like navigation and search.</p>
            </div>
            <Switch checked={essential} disabled />
          </div>

          <div className="flex items-center justify-between p-5 rounded-xl border border-border bg-card">
            <div>
              <Label className="text-base font-semibold text-foreground">Analytics Cookies</Label>
              <p className="text-sm text-muted-foreground mt-1">Help us understand how visitors use FareFinder.</p>
            </div>
            <Switch checked={analytics} onCheckedChange={setAnalytics} />
          </div>

          <div className="flex items-center justify-between p-5 rounded-xl border border-border bg-card">
            <div>
              <Label className="text-base font-semibold text-foreground">Advertising Cookies</Label>
              <p className="text-sm text-muted-foreground mt-1">Used to show you personalised travel deals.</p>
            </div>
            <Switch checked={advertising} onCheckedChange={setAdvertising} />
          </div>

          <Button onClick={handleSave} className="mt-4 rounded-full px-8">
            Save Preferences
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacySettings;
