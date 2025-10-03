# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NYK-FIL Crew Portal Frontend is a Next.js 15 application for maritime crew management. It provides role-based interfaces for crew members and administrators to manage crew information, documents, contracts, and administrative workflows.

**Tech Stack:**
- **Framework**: Next.js 15 (App Router) with React 19
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS 4 with custom design system
- **State**: React hooks and client-side state
- **HTTP Client**: Axios with interceptors
- **UI Components**: Radix UI primitives + custom components
- **Notifications**: react-hot-toast
- **Icons**: Bootstrap Icons (CDN)
- **Fonts**: Poppins (Google Fonts)

## Development Commands

### Running the Application
```bash
npm run dev          # Development server (http://localhost:3000)
npm run build        # Production build
npm start            # Start production server
```

### Code Quality
```bash
npm run lint         # Run ESLint checks
```

## Architecture Overview

### Route Structure (App Router)

The application uses Next.js 15 App Router with **route groups** for role-based layouts:

```
src/app/
├── (auth)/          # Authentication routes (no sidebar)
│   ├── layout.tsx   # Auth layout
│   └── login/       # Login page
├── (crew)/          # Crew member routes
│   ├── crew/
│   │   ├── home/
│   │   ├── profile/[crew_id]/
│   │   ├── documents/
│   │   ├── appointment-schedule/
│   │   ├── job-description/
│   │   ├── finance/
│   │   ├── feedback/
│   │   ├── notifications/
│   │   └── inquiry/
└── (admin)/         # Admin routes
    ├── layout.tsx   # Admin layout with sidebar
    └── admin/
        ├── crew/
        ├── programs/
        └── job-descriptions/
```

### Authentication & Authorization

**Authentication Flow:**
1. **OTP-based login**: Email → OTP verification → Token + User data
2. **Storage**: Token + user stored in both localStorage and cookies
3. **Token injection**: Axios interceptor adds Bearer token to requests
4. **Role-based routing**: Middleware enforces role-based access

**Key Files:**
- `src/services/auth.ts` - AuthService class with all auth methods
- `src/lib/axios.ts` - Axios instance with auth interceptors
- `src/middleware.ts` - Route protection and role-based redirects

**Middleware Protection:**
- Unauthenticated users → redirected to `/login`
- Crew members (is_crew: 1) → restricted to `/crew/*` routes
- Admin users (is_crew: 0) → restricted to `/admin/*` routes
- Profile access control: Crew can only view their own profile

### API Communication

**Base Configuration:**
- Base URL: `process.env.NEXT_PUBLIC_API_BASE_URL` (default: `http://localhost:8000/api`)
- CSRF: Laravel Sanctum CSRF protection enabled
- Credentials: `withCredentials: true`
- Timeout: 10 seconds

**Service Layer Pattern:**
All API calls go through service classes in `src/services/`:
- `auth.ts` - Authentication (login, logout, OTP)
- `user.ts` - User management
- `program.ts` - Program management
- `employment.ts` - Employment/contract data

**Standard Pattern:**
```typescript
// Service class method
static async getResource(): Promise<Response> {
  const response = await api.get<Response>('/endpoint');
  return response.data;
}
```

### Component Architecture

**Component Organization:**
```
src/components/
├── ui/                    # Reusable UI primitives (Radix-based)
│   ├── button.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── avatar.tsx
│   └── textarea.tsx
├── job-description-module/  # Feature-specific module
│   ├── JobDescriptionRequestForm.tsx
│   ├── JobDescriptionStatus.tsx
│   ├── PDFViewer.tsx (+ variants)
│   └── README.md
├── CrewTable.tsx          # Shared components
├── CrewForm.tsx
├── Navigation.tsx
├── Pagination.tsx
└── OTPInput.tsx
```

**Layout Components:**
- **Root Layout** (`src/app/layout.tsx`): Global styles, fonts, Toaster
- **Admin Layout** (`src/app/(admin)/layout.tsx`): Sidebar, header, footer with user context
- **Auth Layout** (`src/app/(auth)/layout.tsx`): Minimal layout for login

### State Management

**Current Approach:**
- React hooks (useState, useEffect) for local state
- localStorage for persistent user/token data
- No global state library (Context/Redux/Zustand)

**User Context Pattern:**
```typescript
// Load user from localStorage
const [currentUser, setCurrentUser] = useState<any>(null);

useEffect(() => {
  const userData = localStorage.getItem("user");
  if (userData) {
    setCurrentUser(JSON.parse(userData));
  }
}, []);
```

### Styling System

**TailwindCSS 4 Configuration:**
- Custom design tokens via CSS variables
- Path alias: `@/*` → `./src/*`
- PostCSS setup with Tailwind plugin
- Animation library: `tw-animate-css`

**Design Tokens:**
- **Primary Color**: Blue (`blue-600`, `blue-700`, `blue-800`, `blue-900`)
- **Typography**: Poppins font family with weights 100-900
- **Spacing**: Tailwind's default spacing scale
- **Components**: Consistent rounded corners, shadows, transitions

**Common Patterns:**
```tsx
// Active navigation item
className={`flex items-center px-6 py-3 transition-colors ${
  pathname === "/admin"
    ? "bg-blue-700 text-white border-r-2 border-blue-300"
    : "text-white hover:bg-blue-800 hover:text-blue-100"
}`}

// Mobile-first responsive
className="p-4 lg:p-6"  // 4 on mobile, 6 on desktop
```

## Special Features

### Job Description Module

A comprehensive workflow system for crew job description requests:

**Workflow:** Crew request → EA processing → VP approval → Document delivery

**Components:**
- `JobDescriptionRequestForm` - Multi-step form with purpose/VISA type selection
- `JobDescriptionStatus` - Status tracking with progress indicators
- `PDFViewer` variants - Browser-based PDF generation with digital signatures

**Documentation:** See `src/components/job-description-module/README.md` for detailed API docs, integration points, and backend schema suggestions.

**Key Features:**
- Purpose selection (SSS, Pag-Ibig, PhilHealth, VISA)
- VISA type sub-selection for VISA requests
- Status flow: pending → in_progress → ready_for_approval → approved/disapproved
- PDF generation using pdf-lib + QR codes

## TypeScript Configuration

**Strict Mode Enabled:**
- Path alias: `@/*` maps to `./src/*`
- Target: ES2017
- Module: ESNext with bundler resolution
- JSX: preserve (Next.js handles compilation)

**Type Safety:**
- Type definitions in `src/types/api.ts` for API responses
- Strict null checks enabled
- Interface-first approach for props

## Environment Variables

**Required:**
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api  # Backend API URL
```

## Common Patterns

### Page Component Pattern
```tsx
"use client";  // Client component for interactivity

import { useState, useEffect } from "react";

export default function PageName() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Fetch data
  }, []);

  return <div>{/* Content */}</div>;
}
```

### Service Integration Pattern
```tsx
import { AuthService } from "@/services/auth";
import toast from "react-hot-toast";

const handleAction = async () => {
  try {
    const result = await AuthService.someMethod();
    toast.success("Success!");
  } catch (error) {
    toast.error(error.message || "An error occurred");
  }
};
```

### Layout Sidebar Pattern
Both admin and crew layouts use:
- Sticky sidebar (mobile: overlay, desktop: sticky)
- Mobile hamburger menu
- Active route highlighting using `usePathname()`
- User avatar with initials
- Logout button at bottom

## Error Handling

**Axios Interceptor Handles:**
- 401 Unauthorized → Clear auth data + redirect to `/login`
- Network errors → User-friendly error messages
- All responses logged to console in development

**Toast Notifications:**
```tsx
import toast from "react-hot-toast";

toast.success("Success message");
toast.error("Error message");
toast.loading("Loading...");
```

**Toast Configuration:**
- Position: top-right
- Duration: 4s (default), 3s (success), 5s (error)
- Custom colors: Success (green), Error (red), Default (dark gray)

## Code Quality

**ESLint Configuration:**
- Next.js core-web-vitals preset
- TypeScript rules enabled
- Ignores: `node_modules/`, `.next/`, `build/`

**Running Linter:**
```bash
npm run lint  # Check for issues
```

## Dependencies

**Key Production Dependencies:**
- `next@15.5.0` - Framework
- `react@19.1.0` - UI library
- `axios@^1.11.0` - HTTP client
- `react-hot-toast@^2.6.0` - Notifications
- `pdf-lib@^1.17.1` - PDF generation
- `qrcode@^1.5.4` - QR code generation
- `@radix-ui/*` - Accessible UI primitives
- `lucide-react@^0.542.0` - Icon library (in addition to Bootstrap Icons)
- `tailwind-merge@^3.3.1` - Class merging utility
- `class-variance-authority@^0.7.1` - Component variants

## Important Notes

- **Client vs Server Components**: Most components use `"use client"` directive for interactivity
- **localStorage Usage**: Only access localStorage after checking `typeof window !== 'undefined'`
- **Path Aliases**: Always use `@/` prefix for imports (e.g., `@/components/Button`)
- **Bootstrap Icons**: Loaded via CDN in root layout, use `<i className="bi bi-icon-name" />`
- **No Backend Yet**: Some features have mock data and are ready for API integration
