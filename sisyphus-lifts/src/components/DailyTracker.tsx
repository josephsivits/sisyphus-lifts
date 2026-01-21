import React, { useState, useRef } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { Calendar, ChevronDown, ChevronRight, ChevronLeft, ChevronRight as ChevronRightIcon, Plus } from 'lucide-react';
import './DailyTracker.css';

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
  isExpanded: boolean;
}

const INITIAL_EXERCISES = ['Squat', 'Bench', 'Deadlift'];

export const DailyTracker: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const dateInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize state with the requested exercises
  const [exercises, setExercises] = useState<ExerciseData[]>(
    INITIAL_EXERCISES.map(name => ({
      name,
      isExpanded: false,
      sets: [{ id: crypto.randomUUID(), reps: '', weight: '', unit: 'lbs' }]
    }))
  );

  const toggleExercise = (index: number) => {
    setExercises(prev => prev.map((ex, i) => 
      i === index ? { ...ex, isExpanded: !ex.isExpanded } : ex
    ));
  };

  const addSet = (exerciseIndex: number) => {
    setExercises(prev => prev.map((ex, i) => {
      if (i !== exerciseIndex) return ex;
      const lastSet = ex.sets[ex.sets.length - 1];
      return {
        ...ex,
        sets: [
          ...ex.sets, 
          { 
            id: crypto.randomUUID(), 
            reps: '', 
            weight: '', 
            unit: lastSet ? lastSet.unit : 'lbs' 
          }
        ]
      };
    }));
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof WorkoutSet, value: any) => {
    setExercises(prev => prev.map((ex, i) => {
      if (i !== exerciseIndex) return ex;
      const newSets = [...ex.sets];
      newSets[setIndex] = { ...newSets[setIndex], [field]: value };
      return { ...ex, sets: newSets };
    }));
  };

  const toggleUnit = (exerciseIndex: number, setIndex: number) => {
    setExercises(prev => prev.map((ex, i) => {
      if (i !== exerciseIndex) return ex;
      const newSets = [...ex.sets];
      const currentUnit = newSets[setIndex].unit;
      newSets[setIndex] = { ...newSets[setIndex], unit: currentUnit === 'lbs' ? 'kg' : 'lbs' };
      return { ...ex, sets: newSets };
    }));
  };

  const handleDateChange = (days: number) => {
    setCurrentDate(prev => days > 0 ? addDays(prev, days) : subDays(prev, Math.abs(days)));
  };

  const openDatePicker = () => {
    // showPicker is supported in modern browsers
    if (dateInputRef.current && 'showPicker' in dateInputRef.current) {
      (dateInputRef.current as any).showPicker();
    } else {
      dateInputRef.current?.click();
    }
  };

  return (
    <div className="daily-tracker">
      <div className="date-header">
        <button className="icon-btn" onClick={() => handleDateChange(-1)}>
          <ChevronLeft size={24} />
        </button>
        <div className="date-display" onClick={openDatePicker}>
          <Calendar size={20} className="calendar-icon" />
          <span className="date-text">{format(currentDate, 'MMM d, yyyy')}</span>
          <input
            ref={dateInputRef}
            type="date"
            value={format(currentDate, 'yyyy-MM-dd')}
            onChange={(e) => {
              if (e.target.value) {
                // Handle potential timezone issues by appending time or just parsing manually
                // But new Date(yyyy-mm-dd) is usually UTC, so we might need to adjust.
                // date-fns parse might be better, or just taking the input value.
                const [year, month, day] = e.target.value.split('-').map(Number);
                setCurrentDate(new Date(year, month - 1, day));
              }
            }}
            className="hidden-date-input"
          />
        </div>
        <button className="icon-btn" onClick={() => handleDateChange(1)}>
          <ChevronRightIcon size={24} />
        </button>
      </div>

      <div className="exercise-list">
        {exercises.map((exercise, exerciseIndex) => (
          <div key={exercise.name} className={`exercise-item ${exercise.isExpanded ? 'expanded' : ''}`}>
            <button 
              className="exercise-header" 
              onClick={() => toggleExercise(exerciseIndex)}
            >
              <span className="exercise-name">{exercise.name}</span>
              {exercise.isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>

            {exercise.isExpanded && (
              <div className="exercise-content">
                <div className="sets-list">
                  {exercise.sets.map((set, setIndex) => (
                    <div key={set.id} className="set-row">
                      <div className="set-input-group">
                        <input
                          type="number"
                          placeholder="0"
                          value={set.reps}
                          onChange={(e) => updateSet(exerciseIndex, setIndex, 'reps', e.target.value)}
                          className="tracker-input"
                        />
                        <span className="input-label">reps</span>
                      </div>
                      
                      <div className="set-input-group">
                        <input
                          type="number"
                          placeholder="0"
                          value={set.weight}
                          onChange={(e) => updateSet(exerciseIndex, setIndex, 'weight', e.target.value)}
                          className="tracker-input"
                        />
                        <button 
                          className="unit-toggle"
                          onClick={() => toggleUnit(exerciseIndex, setIndex)}
                        >
                          {set.unit}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button className="add-set-btn" onClick={() => addSet(exerciseIndex)}>
                  <Plus size={16} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
