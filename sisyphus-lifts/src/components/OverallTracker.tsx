import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { US_STATE_HIGHPOINTS } from '../constants/peaks';
import './OverallTracker.css';

interface OverallTrackerProps {
  currentAltitude: number; // in meters
}

export const OverallTracker: React.FC<OverallTrackerProps> = ({ currentAltitude }) => {
  // Determine the next peak to show progress towards
  const { currentPeak, previousPeak, progress } = useMemo(() => {
    const nextPeakIndex = US_STATE_HIGHPOINTS.findIndex(p => p.elevation > currentAltitude);
    
    // If we've surpassed all peaks (congrats!), show the last one
    if (nextPeakIndex === -1) {
      return {
        currentPeak: US_STATE_HIGHPOINTS[US_STATE_HIGHPOINTS.length - 1],
        previousPeak: US_STATE_HIGHPOINTS[US_STATE_HIGHPOINTS.length - 2],
        progress: 100
      };
    }

    const currentPeak = US_STATE_HIGHPOINTS[nextPeakIndex];
    // If it's the first peak, start from 0
    const previousPeak = nextPeakIndex > 0 ? US_STATE_HIGHPOINTS[nextPeakIndex - 1] : { elevation: 0, name: 'Sea Level', state: '' };
    
    const elevationDiff = currentPeak.elevation - previousPeak.elevation;
    const progressInSegment = currentAltitude - previousPeak.elevation;
    const rawProgress = (progressInSegment / elevationDiff) * 100;
    
    // Clamp progress between 0 and 100
    return {
      currentPeak,
      previousPeak,
      progress: Math.min(Math.max(rawProgress, 0), 100)
    };
  }, [currentAltitude]);

  // SVG Path logic
  // Simple cubic bezier curve to look like a mountain slope
  // Starting bottom-left, ending top-right
  const pathD = "M 10 290 C 80 290, 100 200, 150 150 S 220 10, 290 10";

  // Calculate boulder position along the path
  // For a simple visualization, we can approximate the position or use a straight line interpolation for now,
  // but since we want it "on the line", we can use framer-motion's path length animation or just map X/Y coordinates if we know the function.
  // To keep it robust without complex path math, we'll let Framer Motion handle the path stroke and place the ball visually relative to height.
  // Actually, to place the ball *on* the curve at a specific percentage is tricky without getPointAtLength.
  // A simpler approach for the sketch's "wavy line" is to map the progress to the Y axis primarily.
  
  // Let's assume the path goes from 0% to 100% of the CURRENT SEGMENT.
  // The Y axis represents elevation.
  
  // We'll visualize a fixed "view" of the mountain between previous and next peak.
  // Bottom of chart = previous peak elevation
  // Top of chart = next peak elevation
  
  return (
    <div className="overall-tracker">
      <div className="tracker-header">
        <h3 className="mode-title">Mode: 50 States</h3>
      </div>
      
      <div className="chart-container">
        <svg viewBox="0 0 300 300" className="mountain-chart">
          {/* Background grid lines / decoration */}
          
          {/* The Goal Line (Next Peak) */}
          <line x1="0" y1="20" x2="300" y2="20" stroke="#3498db" strokeWidth="2" strokeDasharray="5,5" opacity="0.5" />
          <text x="290" y="15" textAnchor="end" fontSize="12" fill="#3498db">
            {currentPeak.name} ({currentPeak.elevation}m)
          </text>

          {/* The Base Line (Previous Peak) */}
          <line x1="0" y1="280" x2="300" y2="280" stroke="#95a5a6" strokeWidth="2" strokeDasharray="5,5" opacity="0.3" />
          <text x="10" y="295" textAnchor="start" fontSize="12" fill="#95a5a6">
            {previousPeak.name} ({previousPeak.elevation}m)
          </text>

          {/* The Mountain Path */}
          <motion.path
            d={pathD}
            fill="none"
            stroke="#3498db"
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />

          {/* The Boulder */}
          {/* Using offset-path for CSS motion if supported, or falling back to a computed transform. 
              Since offset-path is widely supported in modern browsers, we can try using style.
              But simpler: Framer Motion's 'animate' on a value, then mapping that to coordinates.
              
              We used a cubic bezier: M 10 290 C 80 290, 100 200, 150 150 S 220 10, 290 10
              Let's use a simpler path that we can easily calculate Y for X: A Sine wave or just a standard cubic.
              For now, the visual approximation (Sigmoid) is good enough for "on the line" effect.
          */}
          <motion.circle
            r="8"
            fill="white"
            stroke="#2c3e50"
            strokeWidth="3"
            animate={{ 
              cx: 10 + (280 * (progress / 100)),
              cy: 290 - (280 * ((progress / 100) * (progress / 100) * (3 - 2 * (progress / 100))))
            }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </svg>
      </div>
      
      <div className="tracker-footer">
        <div className="stat-box">
          <span className="stat-label">Current</span>
          <span className="stat-value">{currentAltitude}m</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Next Peak</span>
          <span className="stat-value">{Math.round(currentPeak.elevation - currentAltitude)}m to go</span>
        </div>
      </div>
    </div>
  );
};
