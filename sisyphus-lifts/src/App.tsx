import './App.css'
import { DailyTracker } from './components/DailyTracker'
import type { ExerciseData } from './components/DailyTracker'
import { OverallTracker } from './components/OverallTracker'
import { calculateAltitudeGain } from './utils/altitude'
import { useState, useMemo } from 'react'

const INITIAL_EXERCISES = ['Squat', 'Bench', 'Deadlift'];

function App() {
  // Initialize exercises state
  const [exercises, setExercises] = useState<ExerciseData[]>(
    INITIAL_EXERCISES.map(name => ({
      name,
      isExpanded: false,
      sets: [{ id: crypto.randomUUID(), reps: '', weight: '', unit: 'lbs' }]
    }))
  );

  // Calculate total altitude gain from all workouts
  // In a real app, this would aggregate across multiple days/dates
  const totalAltitude = useMemo(() => {
    const altitudeGain = calculateAltitudeGain(exercises);
    // Start with a base altitude (e.g., 0m) and add the current workout's gain
    // For now, we'll just use the current workout's gain as the total
    // In production, you'd accumulate this across dates
    return altitudeGain;
  }, [exercises]);

  return (
    <div className="app-container">
      <h1>Sisyphus Lifts</h1>
      <div className="trackers-container">
        <OverallTracker currentAltitude={totalAltitude} />
        <DailyTracker exercises={exercises} onExercisesChange={setExercises} />
      </div>
    </div>
  )
}

export default App
