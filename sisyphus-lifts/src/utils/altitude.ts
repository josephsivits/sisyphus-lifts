type Unit = 'lbs' | 'kg';

interface WorkoutSet {
  id: string;
  reps: number | '';
  weight: number | '';
  unit: Unit;
}

interface ExerciseData {
  name: string;
  sets: WorkoutSet[];
  isExpanded?: boolean;
  customJoules?: number; // Optional: pre-calculated work for custom exercises
}

// Exercise heights in meters
const EXERCISE_HEIGHTS: Record<string, number> = {
  bench: 0.4,
  squat: 0.6,
  deadlift: 0.5,
};

const BOULDER_MASS_KG = 90.7;
const GRAVITY = 9.81; // m/s²
const LBS_TO_KG = 0.453592;

/**
 * Converts weight to kilograms
 */
function toKilograms(weight: number | '', unit: Unit): number {
  if (weight === '' || weight === null || weight === undefined) {
    return 0;
  }
  return unit === 'lbs' ? weight * LBS_TO_KG : weight;
}

/**
 * Finds the exercise height using fuzzy matching.
 * Matches if the exercise name includes any of the known exercise keywords.
 * 
 * @param exerciseName - The exercise name (case-insensitive)
 * @returns The height in meters, or 0.4 as default fallback for unknown exercises
 */
function getExerciseHeight(exerciseName: string): number {
  const normalizedName = exerciseName.toLowerCase();
  
  // Try to find a matching exercise using fuzzy matching
  const match = Object.entries(EXERCISE_HEIGHTS).find(([key]) => 
    normalizedName.includes(key)
  );
  
  // Return matched height or default to 0.4m for custom/unknown exercises
  return match ? match[1] : 0.4;
}

/**
 * Calculates the altitude gain (in meters) that a 90.7kg boulder would move
 * based on the total work performed in a workout.
 * 
 * @param workoutData - Array of exercise data with sets, reps, weights, and units
 * @returns Altitude gain in meters
 */
export function calculateAltitudeGain(workoutData: ExerciseData[]): number {
  let totalWork = 0; // Total work in Joules

  for (const exercise of workoutData) {
    // If custom joules are provided (e.g., from GPT estimation), use those directly
    if (exercise.customJoules !== undefined && exercise.customJoules > 0) {
      totalWork += exercise.customJoules;
      continue;
    }

    // Use fuzzy matching to find exercise height
    const height = getExerciseHeight(exercise.name);

    for (const set of exercise.sets) {
      const weightKg = toKilograms(set.weight, set.unit);
      const reps = typeof set.reps === 'number' ? set.reps : 0;

      // Skip sets with invalid or zero values
      if (weightKg <= 0 || reps <= 0) {
        continue;
      }

      // Work = Force × Distance = mass × gravity × height × reps
      const work = weightKg * GRAVITY * height * reps;
      totalWork += work;
    }
  }

  // Altitude gain = Total work / (boulder mass × gravity)
  const altitudeGain = totalWork / (BOULDER_MASS_KG * GRAVITY);

  // Round to 2 decimal places to avoid floating point precision issues
  return Math.round(altitudeGain * 100) / 100;
}
