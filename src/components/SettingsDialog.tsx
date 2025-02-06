import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface SettingsProps {
  icr: string;
  isf: string;
  onSave: (icr: string, isf: string) => void;
}

const SettingsDialog = ({ icr, isf, onSave }: SettingsProps) => {
  const [localIcr, setLocalIcr] = React.useState(icr);
  const [localIsf, setLocalIsf] = React.useState(isf);
  const { toast } = useToast();

  const handleSave = () => {
    if (!localIcr || !localIsf) {
      toast({
        title: "Invalid Values",
        description: "Please provide both ICR and ISF values.",
        variant: "destructive",
      });
      return;
    }
    
    if (parseFloat(localIcr) <= 0 || parseFloat(localIsf) <= 0) {
      toast({
        title: "Invalid Values",
        description: "Values must be greater than 0.",
        variant: "destructive",
      });
      return;
    }

    onSave(localIcr, localIsf);
    toast({
      title: "Settings Saved",
      description: "Your ICR and ISF values have been updated.",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="absolute top-4 right-4">
          <Settings2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Calculator Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="icr">Insulin to Carb Ratio (ICR)</Label>
            <Input
              id="icr"
              value={localIcr}
              onChange={(e) => {
                if (e.target.value === "" || /^\d*\.?\d*$/.test(e.target.value)) {
                  setLocalIcr(e.target.value);
                }
              }}
              placeholder="1:x grams"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="isf">Insulin Sensitivity Factor (ISF)</Label>
            <Input
              id="isf"
              value={localIsf}
              onChange={(e) => {
                if (e.target.value === "" || /^\d*\.?\d*$/.test(e.target.value)) {
                  setLocalIsf(e.target.value);
                }
              }}
              placeholder="mg/dL per unit"
            />
          </div>
          <Button onClick={handleSave} className="w-full">Save Settings</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;