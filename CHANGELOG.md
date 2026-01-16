# Changelog

All notable changes to MM2-Next will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-01-16

### Added

- Custom Google Maps overlay system for precise aircraft marker positioning
- Aircraft trajectory lines that accurately connect to aircraft tail
- Polar coverage pattern chart with multi-series visualization (area + line)
- Country flag emoji support for all aircraft registrations (fixed 16+ broken emojis)
- Vertical speed indicators (climb/descent arrows) on aircraft markers
- Real-time statistics with 30-second auto-refresh

### Changed

- Replaced AdvancedMarker with CustomOverlay for better rotation control
- Improved aircraft icon positioning to eliminate trajectory line drift at all angles
- Enhanced statistics charts with gradient fills and modern styling
- Updated coverage pattern chart from column to area+line style for better visualization
- Optimized chart rendering using React Portal to prevent lifecycle errors

### Fixed

- Aircraft trajectory line alignment at all rotation angles
- React Portal lifecycle management to prevent removeChild errors
- Statistics initialization on server startup (eliminated zeros on first modal open)
- Flag emoji rendering for Spain, Ukraine, Canada, Venezuela, Libya, Uganda, Kuwait, Qatar, Iran, Myanmar, Laos, Thailand, Cambodia, Mozambique, Cuba, Panama
- Chart flickering when opening StatsModal
- Aircraft marker anchor point drift during rotation

## [1.2.0] - 2026-01-15

### Added

- Real-time statistics dashboard with Highcharts integration
- Coverage pattern polar chart showing receiver range by direction
- Messages per hour chart (ADS-B vs Mode-S breakdown)
- Message type breakdown pie chart
- Server-side statistics tracking and aggregation
- Socket.IO connection status indicator
- Global server stats accessible via API

### Changed

- Enhanced aircraft markers with better visual feedback
- Improved trajectory line rendering
- Refined ICAO country data and flag mappings

### Fixed

- Aircraft marker rotation precision
- Statistics data persistence across page reloads

## [1.1.2] - 2026-01-15

### Changed

- Migrated to runtime environment variables for better Docker compatibility
- Refactored client configuration to use runtime API

### Fixed

- Environment variable handling in production builds

## [1.1.1] - 2026-01-15

### Added

- Project screenshot and comprehensive README
- Aircraft position display in detail panel

### Changed

- Made aircraft detail panel vertically scrollable
- Enhanced Docker build logging
- Updated application metadata and icons

### Fixed

- UI overflow issues in detail panel

## [1.1.0] - 2026-01-15

### Changed

- Downgraded to Next.js 15 for ARM v7 (Raspberry Pi 3) support
- Removed Turbopack dependency for better ARM compatibility

### Fixed

- Docker builds on ARM v7 architecture
- Alpine Linux compatibility issues

## [1.0.0] - 2026-01-14

### Added

- Initial production release
- Real-time aircraft tracking with Socket.IO
- Interactive Google Maps integration with custom markers
- Aircraft selection and detail panel
- Altitude formatting (feet/meters toggle)
- Dark mode UI with glassmorphism effects
- Aircraft trace/history visualization
- Settings panel with unit preferences
- dump1090 JSON API integration
- ICAO address to country mapping
- Comprehensive Docker deployment support
- FlightAware AeroAPI integration for flight details
- Flight route and progress visualization
- Airline logos in aircraft details

### Changed

- Migrated from Create React App to Next.js 15
- Implemented App Router architecture
- Added TypeScript strict mode
- Modernized UI with Tailwind CSS
- Refactored server to use dump1090 JSON API

---

**Legend:**

- `Added` for new features
- `Changed` for changes in existing functionality
- `Deprecated` for soon-to-be removed features
- `Removed` for now removed features
- `Fixed` for any bug fixes
- `Security` for vulnerability fixes
