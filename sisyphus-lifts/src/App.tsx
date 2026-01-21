import './App.css'
import { DailyTracker } from './components/DailyTracker'
import { OverallTracker } from './components/OverallTracker'
import { calculateAltitudeGain } from './utils/altitude'
import { useState } from 'react'

function App() {
  // Temporary state for demo purposes - in a real app this would be aggregated from multiple DailyTracker entries
  // For now, we'll start with 0 altitude and let the DailyTracker potentially update it if we were to connect them.
  // Since DailyTracker is isolated in this demo, let's hardcode a current progress to show off the visual
  // or just pass 0. Let's give it a fun starting value to see Britton Hill context.
  const [totalAltitude, setTotalAltitude] = useState(50); // Start partway to Britton Hill (105m)

  return (
    <div className="app-container">
      <h1>Sisyphus Lifts</h1>
      <div className="trackers-container">
        <OverallTracker currentAltitude={totalAltitude} />
        <DailyTracker />
      </div>
    </div>
  )
}

export default App
