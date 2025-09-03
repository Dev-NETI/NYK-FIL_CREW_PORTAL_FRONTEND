# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
- `npm run dev` - Start development server (runs on http://localhost:3000)
- `npm run build` - Build the application for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

### Notes
- No test framework is currently configured
- TypeScript is enabled with strict mode
- Uses Next.js 15.5.0 with App Router

## Project Architecture

This is a Next.js crew portal application for NYK-FIL with a dual-interface architecture:

### Route Structure
The application uses Next.js App Router with route groups:

- **`(auth)`** - Authentication routes (login)
- **`(admin)`** - Admin interface with dedicated layout
- **`(crew)`** - Crew member interface with various modules

### Layout System
- **Root Layout** (`src/app/layout.tsx`): Configures Poppins font, Bootstrap Icons CDN, and global metadata
- **Admin Layout** (`src/app/(admin)/layout.tsx`): Full sidebar with navigation for dashboard, crew management, applications, documents, reports, and settings
- **Crew Navigation** (`src/components/Navigation.tsx`): Responsive top/bottom navigation for crew members

### Key Features
- **Admin Interface**: Complete sidebar navigation with sections for Dashboard, Crew Management, Applications, Documents, Reports, and Settings
- **Crew Interface**: Module-based navigation including Home, Profile, Documents, Appointment Schedule, Finance, Feedback, Notifications, and Inquiry
- **Responsive Design**: Mobile-first approach with different navigation patterns for desktop/mobile
- **Styling**: TailwindCSS with custom animations and transitions

### Component Architecture
- Shared components in `src/components/` (Navigation, CrewForm, CrewTable, DeleteConfirmModal)
- Page-specific layouts using Next.js route groups
- Client-side state management with React hooks

### Styling & UI
- **Font**: Poppins (Google Fonts) with multiple weights
- **Icons**: Bootstrap Icons via CDN
- **CSS Framework**: TailwindCSS v4
- **Design System**: Consistent blue color scheme, gradient backgrounds, and smooth animations

### Path Aliases
- `@/*` maps to `./src/*` for clean imports