import { useState } from 'react'
import BurnRateChart from './components/BurnRateChart'
import ConfigForm from './components/ConfigForm'
import './App.css'

export interface SloConfig {
  sloTarget: number
  evaluationWindowDays: number
  shortWindowMinutes: number
  longWindowMinutes: number
  criticalBurnRate: number
  badEventRate: number
  badEventDurationMinutes: number
}

const defaultConfig: SloConfig = {
  sloTarget: 99,
  evaluationWindowDays: 7,
  shortWindowMinutes: 5,
  longWindowMinutes: 60,
  criticalBurnRate: 3.36,
  badEventRate: 20,
  badEventDurationMinutes: 5,
}

function App() {
  const [config, setConfig] = useState<SloConfig>(defaultConfig)

  return (
    <div className="app">
      <h1>SLO Burn Rate Visualizer</h1>
      <div className="main-content">
        <div className="chart-content">
          <BurnRateChart config={config} />
        </div>
        <ConfigForm config={config} onChange={setConfig} />
      </div>
    </div>
  )
}

export default App
