import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { calculateInsulinDose } from "@/lib/calculations";
import SettingsDialog from "./SettingsDialog";

const InsulinCalculator = () => {
  const { toast } = useToast();
  const [values, setValues] = useState({
    currentBG: "",
    targetBG: "",
    carbs: "",
  });

  // Load ICR and ISF from localStorage or use defaults
  const [icr, setIcr] = useState(() => localStorage.getItem("icr") || "");
  const [isf, setIsf] = useState(() => localStorage.getItem("isf") || "");

  const [result, setResult] = useState<{
    mealDose: number;
    correctionDose: number;
    totalDose: number;
  } | null>(null);

  // Save ICR and ISF to localStorage whenever they change
  useEffect(() => {
    if (icr) localStorage.setItem("icr", icr);
  }, [icr]);

  useEffect(() => {
    if (isf) localStorage.setItem("isf", isf);
  }, [isf]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setValues((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSettingsSave = (newIcr: string, newIsf: string) => {
    setIcr(newIcr);
    setIsf(newIsf);
  };

  const handleCalculate = () => {
    // Check if settings are configured
    if (!icr || !isf) {
      toast({
        title: "Settings Required",
        description:
          "Please configure your ICR and ISF values in settings first.",
        variant: "destructive",
      });
      return;
    }

    // Validate required inputs are present (excluding carbs)
    if (values.currentBG === "" || values.targetBG === "") {
      toast({
        title: "Missing Information",
        description:
          "Please fill in Current BG and Target BG fields to calculate insulin dose.",
        variant: "destructive",
      });
      return;
    }

    // Convert strings to numbers, defaulting carbs to 0 if left empty
    const params = {
      currentBG: parseFloat(values.currentBG),
      targetBG: parseFloat(values.targetBG),
      icr: parseFloat(icr),
      isf: parseFloat(isf),
      carbs: values.carbs === "" ? 0 : parseFloat(values.carbs),
    };

    // Validate numbers: Allow carbs to be 0 or more, enforce > 0 for all other values
    const isInvalid = Object.entries(params).some(([key, value]) =>
      key === "carbs" ? value < 0 : value <= 0
    );

    if (isInvalid) {
      toast({
        title: "Invalid Values",
        description:
          "Current BG, Target BG, ICR, and ISF must be greater than 0, and Carbs cannot be negative.",
        variant: "destructive",
      });
      return;
    }

    try {
      const calculatedResult = calculateInsulinDose(params);
      setResult(calculatedResult);
    } catch (error) {
      toast({
        title: "Calculation Error",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred during calculation.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-medical-light p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn relative">
        <SettingsDialog icr={icr} isf={isf} onSave={handleSettingsSave} />

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold text-medical-dark">
            Insulin Dose Calculator
          </h1>
          <p className="text-gray-600">
            Calculate your insulin dose based on your current readings and
            ratios
          </p>
          {(icr || isf) && (
            <div className="flex justify-center gap-4 mt-2 text-sm text-medical">
              {icr && <p>ICR: 1:{icr}</p>}
              {isf && <p>ISF: 1:{isf}</p>}
            </div>
          )}
        </div>

        <Card className="p-6 space-y-6 bg-white/80 backdrop-blur-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentBG">Current Blood Glucose</Label>
              <Input
                id="currentBG"
                name="currentBG"
                placeholder="mg/dL"
                value={values.currentBG}
                onChange={handleInputChange}
                className="text-lg"
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetBG">Target Blood Glucose</Label>
              <Input
                id="targetBG"
                name="targetBG"
                placeholder="mg/dL"
                value={values.targetBG}
                onChange={handleInputChange}
                className="text-lg"
                autoComplete="off"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="carbs">Carbohydrates to Consume</Label>
              <Input
                id="carbs"
                name="carbs"
                placeholder="grams"
                value={values.carbs}
                onChange={handleInputChange}
                className="text-lg"
                autoComplete="off"
              />
            </div>
          </div>

          <Button
            onClick={handleCalculate}
            className="w-full bg-medical hover:bg-medical-dark text-white text-lg py-6"
          >
            Calculate Insulin Dose
          </Button>
        </Card>

        {result && (
          <Card className="p-6 bg-white/80 backdrop-blur-sm animate-fadeIn">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-medical-light">
                  <p className="text-sm text-gray-600 mb-1">Meal Dose</p>
                  <p className="text-2xl font-semibold text-medical">
                    {result.mealDose.toFixed(1)} units
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-medical-light">
                  <p className="text-sm text-gray-600 mb-1">Correction Dose</p>
                  <p className="text-2xl font-semibold text-medical">
                    {result.correctionDose.toFixed(1)} units
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-medical">
                  <p className="text-sm text-white mb-1">Total Dose</p>
                  <p className="text-2xl font-semibold text-white">
                    {result.totalDose.toFixed(1)} units
                  </p>
                </div>
              </div>
              <p className="text-center text-sm text-gray-500 mt-4">
                Please verify these calculations with your healthcare provider.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InsulinCalculator;
