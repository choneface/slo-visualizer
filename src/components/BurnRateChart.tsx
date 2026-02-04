import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import type { SloConfig } from '../App'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
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

export default function BurnRateChart({ config }: BurnRateChartProps) {
  const burnRate = computeBurnRate(config.sloTarget, config.badEventRate)
  const burnRateLine = computeBurnRateLine(
    config.sloTarget,
    config.badEventRate,
    config.badEventDurationMinutes
  )

  const xAxisMax = config.longWindowMinutes * 1.3
  const yAxisMax = Math.max(burnRate * 1.5, config.criticalBurnRate * 1.2)

  const data = {
    datasets: [
      {
        label: 'Burn Rate',
        data: burnRateLine,
        borderColor: '#2196f3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        fill: true,
        tension: 0,
        pointRadius: 0,
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
    },
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Line data={data} options={options} />
    </div>
  )
}
