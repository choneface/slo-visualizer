import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import annotationPlugin from 'chartjs-plugin-annotation'
import { Line } from 'react-chartjs-2'
import type { SloConfig } from '../App'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  annotationPlugin
)

interface BurnRateChartProps {
  config: SloConfig
}

function computeBurnRate(sloTarget: number, badEventRate: number): number {
  const errorBudget = 100 - sloTarget
  if (errorBudget === 0) return 0
  return badEventRate / errorBudget
}

function computeBurnRateLine(
  sloTarget: number,
  badEventRate: number,
  badEventDurationMinutes: number
): { x: number; y: number }[] {
  const burnRate = computeBurnRate(sloTarget, badEventRate)
  const startTime = 5
  const endTime = startTime + badEventDurationMinutes

  return [
    { x: startTime - 0.001, y: 0 },
    { x: startTime, y: burnRate },
    { x: endTime, y: burnRate },
    { x: endTime + 0.001, y: 0 },
  ]
}

function computeWindowedBurnRate(
  instantBurnRate: number,
  windowSize: number,
  incidentStart: number,
  incidentEnd: number,
  currentTime: number
): number {
  const windowStart = currentTime - windowSize
  const windowEnd = currentTime

  const overlapStart = Math.max(windowStart, incidentStart)
  const overlapEnd = Math.min(windowEnd, incidentEnd)
  const overlap = Math.max(0, overlapEnd - overlapStart)

  return (instantBurnRate * overlap) / windowSize
}

function computeWindowedBurnRateLine(
  instantBurnRate: number,
  windowSize: number,
  incidentStart: number,
  incidentEnd: number,
  maxTime: number
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = []
  const step = maxTime / 200

  for (let t = 0; t <= maxTime; t += step) {
    const y = computeWindowedBurnRate(
      instantBurnRate,
      windowSize,
      incidentStart,
      incidentEnd,
      t
    )
    points.push({ x: t, y })
  }

  return points
}

function findAlertZone(
  instantBurnRate: number,
  shortWindow: number,
  longWindow: number,
  incidentStart: number,
  incidentEnd: number,
  threshold: number,
  maxTime: number
): { start: number; end: number } | null {
  const step = maxTime / 500
  let alertStart: number | null = null
  let alertEnd: number | null = null

  for (let t = 0; t <= maxTime; t += step) {
    const shortRate = computeWindowedBurnRate(
      instantBurnRate,
      shortWindow,
      incidentStart,
      incidentEnd,
      t
    )
    const longRate = computeWindowedBurnRate(
      instantBurnRate,
      longWindow,
      incidentStart,
      incidentEnd,
      t
    )

    const bothAbove = shortRate >= threshold && longRate >= threshold

    if (bothAbove && alertStart === null) {
      alertStart = t
    } else if (!bothAbove && alertStart !== null && alertEnd === null) {
      alertEnd = t
    }
  }

  if (alertStart !== null) {
    return { start: alertStart, end: alertEnd ?? maxTime }
  }

  return null
}

export default function BurnRateChart({ config }: BurnRateChartProps) {
  const burnRate = computeBurnRate(config.sloTarget, config.badEventRate)
  const incidentStart = 5
  const incidentEnd = incidentStart + config.badEventDurationMinutes

  const burnRateLine = computeBurnRateLine(
    config.sloTarget,
    config.badEventRate,
    config.badEventDurationMinutes
  )

  const xAxisMax = config.longWindowMinutes * 1.3
  const yAxisMax = Math.max(burnRate * 1.5, config.criticalBurnRate * 1.2)

  const shortWindowLine = computeWindowedBurnRateLine(
    burnRate,
    config.shortWindowMinutes,
    incidentStart,
    incidentEnd,
    xAxisMax
  )

  const longWindowLine = computeWindowedBurnRateLine(
    burnRate,
    config.longWindowMinutes,
    incidentStart,
    incidentEnd,
    xAxisMax
  )

  const alertZone = findAlertZone(
    burnRate,
    config.shortWindowMinutes,
    config.longWindowMinutes,
    incidentStart,
    incidentEnd,
    config.criticalBurnRate,
    xAxisMax
  )

  const data = {
    datasets: [
      {
        label: 'Instantaneous Burn Rate',
        data: burnRateLine,
        borderColor: '#2196f3',
        tension: 0,
        pointRadius: 0,
      },
      {
        label: `Short Window (${config.shortWindowMinutes}m)`,
        data: shortWindowLine,
        borderColor: '#4caf50',
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
      },
      {
        label: `Long Window (${config.longWindowMinutes}m)`,
        data: longWindowLine,
        borderColor: '#ff9800',
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
      },
      {
        label: 'Critical Threshold',
        data: [
          { x: 0, y: config.criticalBurnRate },
          { x: xAxisMax, y: config.criticalBurnRate },
        ],
        borderColor: '#f44336',
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'linear' as const,
        min: 0,
        max: xAxisMax,
        title: {
          display: true,
          text: 'Time (minutes)',
        },
      },
      y: {
        type: 'linear' as const,
        min: 0,
        max: yAxisMax,
        title: {
          display: true,
          text: 'Burn Rate',
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      annotation: {
        annotations: alertZone
          ? {
              alertBox: {
                type: 'box' as const,
                xMin: alertZone.start,
                xMax: alertZone.end,
                yMin: 0,
                yMax: yAxisMax,
                backgroundColor: 'rgba(244, 67, 54, 0.15)',
                borderColor: 'rgba(244, 67, 54, 0.3)',
                borderWidth: 1,
              },
            }
          : {},
      },
    },
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Line data={data} options={options} />
    </div>
  )
}
