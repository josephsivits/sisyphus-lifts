import './App.css'
import { DailyTracker } from './components/DailyTracker'
import type { ExerciseData } from './components/DailyTracker'
import { OverallTracker } from './components/OverallTracker'
import { calculateAltitudeGain } from './utils/altitude'
import { useState, useMemo, useEffect } from 'react'
import { format } from 'date-fns'

const INITIAL_EXERCISES = ['Squat', 'Bench', 'Deadlift'];
const STORAGE_KEY = 'sisyphus-lifts-history';

// Helper to format date as YYYY-MM-DD
const formatDateKey = (date: Date): string => format(date, 'yyyy-MM-dd');

// Helper to create default exercises
const createDefaultExercises = (): ExerciseData[] => 
  INITIAL_EXERCISES.map(name => ({
    name,
    isExpanded: false,
    sets: [{ id: crypto.randomUUID(), reps: '', weight: '', unit: 'lbs' }]
  }));

// Load history from localStorage
const loadHistory = (): Record<string, ExerciseData[]> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load history from localStorage:', error);
  }
  return {};
};

// Save history to localStorage
const saveHistory = (history: Record<string, ExerciseData[]>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save history to localStorage:', error);
  }
};

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [history, setHistory] = useState<Record<string, ExerciseData[]>>(() => loadHistory());

  // Load exercises for current date or initialize defaults
  const currentDateKey = formatDateKey(currentDate);
  const exercises = history[currentDateKey] || createDefaultExercises();

  // Save history to localStorage whenever it changes
  useEffect(() => {
    saveHistory(history);
  }, [history]);

  // Handle exercises change - save to history for current date
  const handleExercisesChange = (newExercises: ExerciseData[]) => {
    setHistory(prev => ({
      ...prev,
      [currentDateKey]: newExercises
    }));
  };

  // Handle date change - load exercises for new date
  const handleDateChange = (newDate: Date) => {
    setCurrentDate(newDate);
    const newDateKey = formatDateKey(newDate);
    
    // If no data exists for this date, initialize with defaults
    if (!history[newDateKey]) {
      setHistory(prev => ({
        ...prev,
        [newDateKey]: createDefaultExercises()
      }));
    }
  };

  // Calculate total altitude gain from ALL workouts in history
  const totalAltitude = useMemo(() => {
    let totalGain = 0;
    Object.values(history).forEach(dayExercises => {
      totalGain += calculateAltitudeGain(dayExercises);
    });
    return totalGain;
  }, [history]);

  return (
    <div className="app-container">
      <h1>Sisyphus Lifts</h1>
      <div className="trackers-container">
        <OverallTracker currentAltitude={totalAltitude} />
        <DailyTracker 
          currentDate={currentDate}
          exercises={exercises} 
          onExercisesChange={handleExercisesChange}
          onDateChange={handleDateChange}
        />
      </div>
    </div>
  )
}

export default App
