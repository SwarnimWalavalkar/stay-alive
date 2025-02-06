interface InsulinParams {
  currentBG: number;
  targetBG: number;
  icr: number;
  isf: number;
  carbs: number;
}

interface InsulinDose {
  mealDose: number;
  correctionDose: number;
  totalDose: number;
}

export function calculateInsulinDose({
  currentBG,
  targetBG,
  icr,
  isf,
  carbs,
}: InsulinParams): InsulinDose {
  // Calculate meal dose based on carbs and ICR
  const mealDose = carbs / icr;

  // Calculate correction dose based on current BG, target BG, and ISF
  const bgDifference = currentBG - targetBG;
  const correctionDose = bgDifference / isf;

  // Calculate total dose
  const totalDose = mealDose + correctionDose;

  return {
    mealDose: Math.max(0, mealDose),
    correctionDose: correctionDose,
    totalDose: Math.max(0, totalDose),
  };
}