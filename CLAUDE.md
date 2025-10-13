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
- **UI Components**: Radix UI primitives + custom components + Material-UI (date pickers)
- **Notifications**: react-hot-toast
- **Icons**: Bootstrap Icons (CDN) + Lucide React
- **Fonts**: Poppins (Google Fonts)
- **Date Handling**: Day.js with MUI DatePicker
- **Validation**: Yup schema validation

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
│   │   │   ├── employment-document/
│   │   │   └── travel-document/
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
        │   └── [id]/       # Individual crew detail page
        ├── programs/
        ├── job-descriptions/
        ├── applications/
        ├── documents/
        └── reports/
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
- Base URL: `process.env.NEXT_PUBLIC_BACKEND_URL + '/api'` (default: `http://localhost:8000/api`)
- CSRF: Laravel Sanctum CSRF protection enabled via `/sanctum/csrf-cookie`
- Credentials: `withCredentials: true`
- XSRF Token: `withXSRFToken: true`
- Timeout: 10 seconds
- Headers: `Content-Type: application/json`, `Accept: application/json`

**Service Layer Pattern:**
All API calls go through service classes in `src/services/`:
- `auth.ts` - Authentication (login, logout, OTP)
- `user.ts` - User management
- `program.ts` - Program management
- `employment.ts` - Employment/contract data
- `employment-document.ts` & `employment-document-type.ts` - Employment document management
- `travel-document.ts` & `travel-document-type.ts` - Travel document management
- `nationality.ts` - Nationality data
- `index.ts` - Service exports

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
├── crew/                  # Crew-specific components
│   └── documents/
│       ├── employment-document/
│       │   ├── EmploymentDocumentListComponent.tsx
│       │   ├── EmploymentDocumentListItemComponent.tsx
│       │   ├── EmploymentDocumentListSkeleton.tsx
│       │   ├── AddEmploymentDocumentModal.tsx
│       │   └── MissingEmploymentDocumentCardComponent.tsx
│       └── travel-document/
│           ├── TravelDocumentListComponent.tsx
│           ├── TravelDocumentListItemComponent.tsx
│           ├── TravelDocumentListSkeleton.tsx
│           ├── AddTravelDocumentModal.tsx
│           └── MissingTravelDocumentCardComponent.tsx
├── crew-profile/          # Profile page components
│   ├── BasicInformation.tsx
│   ├── ContactInformation.tsx
│   ├── EducationInformation.tsx
│   ├── EmploymentInformation.tsx
│   └── PhysicalTraits.tsx
├── job-description-module/  # Feature-specific module
│   ├── JobDescriptionRequestForm.tsx
│   ├── JobDescriptionStatus.tsx
│   ├── PDFViewer.tsx (+ variants)
│   └── README.md
├── CrewTable.tsx          # Shared components
├── CrewForm.tsx
├── Navigation.tsx
├── Pagination.tsx
├── OTPInput.tsx
├── DeleteConfirmModal.tsx
└── FeedbackDialog.tsx
```

**Layout Components:**
- **Root Layout** (`src/app/layout.tsx`): Global styles, fonts, Toaster, LocalizationProvider (MUI DatePicker)
- **Admin Layout** (`src/app/(admin)/layout.tsx`): Sidebar with nested dropdowns, header with user avatar, footer
- **Auth Layout** (`src/app/(auth)/layout.tsx`): Minimal layout for login

**Admin Sidebar Features:**
- Collapsible navigation with dropdowns for Maintenance and General Settings
- Active route highlighting with border indicators
- User initials avatar generation
- Mobile-responsive overlay menu
- Logout button with loading state

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

### Document Management System

**Employment Documents:**
- Upload and manage employment-related documents (contracts, certificates, etc.)
- Document type classification with employment-document-type service
- List, add, and track missing required documents
- Skeleton loading states for better UX

**Travel Documents:**
- Manage passports, visas, and travel-related documents
- Nationality selection with nationality service
- Document expiry tracking
- Add/edit/delete functionality with modals

**Key Components Pattern:**
- List component: Displays all documents
- List item component: Individual document card
- Skeleton component: Loading state
- Add modal: Form for new documents
- Missing card: Highlights required missing documents

### Job Description Module

A comprehensive workflow system for crew job description requests:

**Workflow:** Crew request → EA processing → VP approval → Document delivery

**Components:**
- `JobDescriptionRequestForm` - Multi-step form with purpose/VISA type selection
- `JobDescriptionStatus` - Status tracking with progress indicators
- `PDFViewer` variants - Browser-based PDF generation with digital signatures

**Key Features:**
- Purpose selection (SSS, Pag-Ibig, PhilHealth, VISA)
- VISA type sub-selection for VISA requests
- Status flow: pending → in_progress → ready_for_approval → approved/disapproved
- PDF generation using pdf-lib + QR codes

### Crew Profile System

Modular profile page with separate components for different information sections:
- **BasicInformation**: Name, date of birth, civil status, nationality
- **ContactInformation**: Email, phone, address details
- **EducationInformation**: Educational background and qualifications
- **EmploymentInformation**: Current and past employment records
- **PhysicalTraits**: Height, weight, distinctive marks, etc.

Each component can be edited independently with proper form validation.

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
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000  # Backend base URL (API will be appended as /api)
```

**Note:** The `.env` file should contain `NEXT_PUBLIC_BACKEND_URL` (not `NEXT_PUBLIC_API_BASE_URL`). The axios instance in `src/lib/axios.ts` appends `/api` automatically.

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
- **Mixed File Extensions**: Some files use `.tsx`, others use `.jsx` (e.g., travel-document page)
- **Date Pickers**: Use MUI DatePicker wrapped with LocalizationProvider and Day.js adapter
- **Form Validation**: Yup is available for schema validation in forms
- **API Routes**: Next.js API routes available in `src/app/api/` (e.g., job-description-requests)

## Development Best Practices

- **Component Structure**: Follow the established pattern of List → ListItem → Skeleton → Modal for data views
- **Service Layer**: Always use service classes for API calls, never call axios directly from components
- **Error Handling**: Wrap all async operations in try-catch blocks with toast notifications
- **Loading States**: Provide skeleton components or loading indicators for all data fetching
- **Type Safety**: Define TypeScript interfaces in `src/types/api.ts` for all API responses
- **Responsive Design**: Use mobile-first approach with Tailwind breakpoints (lg:, md:, sm:)
- **Authentication**: Always check for authentication and role before rendering protected content
