# SLO Burn Rate Visualizer

A React application for visualizing SLO burn rate monitoring configurations.

## Development

```bash
bun install      # Install dependencies
bun run dev      # Start dev server
bun run build    # Build for production
bun run preview  # Preview production build
```

## Architecture

- **React** with TypeScript for the UI
- **Chart.js** via react-chartjs-2 for visualization
- **Vite** for bundling with Bun as the package manager
- CSS files for styling (no Tailwind)

## Key Concepts

- **Burn Rate**: `badEventRate / (100 - sloTarget)` - how fast you're consuming error budget
- **Multi-window alerting**: Uses short + long windows to detect sustained issues
- **Critical threshold**: The burn rate level that triggers alerts
