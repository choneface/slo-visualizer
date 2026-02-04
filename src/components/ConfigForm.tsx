import type { SloConfig } from '../App'
import './ConfigForm.css'

interface ConfigFormProps {
  config: SloConfig
  onChange: (config: SloConfig) => void
}

export default function ConfigForm({ config, onChange }: ConfigFormProps) {
  const handleChange = (field: keyof SloConfig) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onChange({
      ...config,
      [field]: Number(e.target.value),
    })
  }

  return (
    <form className="config-form" onSubmit={(e) => e.preventDefault()}>
      <fieldset>
        <legend>SLO Information</legend>
        <label>
          <span>SLO Target (%)</span>
          <input
            type="number"
            value={config.sloTarget}
            onChange={handleChange('sloTarget')}
            min="0"
            max="100"
            step="0.01"
          />
        </label>
        <label>
          <span>Evaluation Window (days)</span>
          <input
            type="number"
            value={config.evaluationWindowDays}
            onChange={handleChange('evaluationWindowDays')}
            min="1"
          />
        </label>
      </fieldset>

      <fieldset>
        <legend>Burn Rate Windows</legend>
        <label>
          <span>Short Window (minutes)</span>
          <input
            type="number"
            value={config.shortWindowMinutes}
            onChange={handleChange('shortWindowMinutes')}
            min="1"
          />
        </label>
        <label>
          <span>Long Window (minutes)</span>
          <input
            type="number"
            value={config.longWindowMinutes}
            onChange={handleChange('longWindowMinutes')}
            min="1"
          />
        </label>
      </fieldset>

      <fieldset>
        <legend>Alert Threshold</legend>
        <label>
          <span>Critical Burn Rate</span>
          <input
            type="number"
            value={config.criticalBurnRate}
            onChange={handleChange('criticalBurnRate')}
            min="0"
            step="0.01"
          />
        </label>
      </fieldset>

      <fieldset>
        <legend>Hypothetical Situation</legend>
        <label>
          <span>Bad Event Rate (%)</span>
          <input
            type="number"
            value={config.badEventRate}
            onChange={handleChange('badEventRate')}
            min="0"
            max="100"
          />
        </label>
        <label>
          <span>Bad Event Duration (minutes)</span>
          <input
            type="number"
            value={config.badEventDurationMinutes}
            onChange={handleChange('badEventDurationMinutes')}
            min="1"
          />
        </label>
      </fieldset>
    </form>
  )
}
