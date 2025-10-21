# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Next.js 15 frontend** for the NYK-FIL Crew Portal, a maritime crew management system. It provides separate interfaces for crew members and administrators to manage crew information, documents, and employment workflows.

**Tech Stack:**
- Next.js 15.5.0 with App Router
- React 19.1.0
- TypeScript 5
- Tailwind CSS 4
- Axios for API communication
- Laravel Sanctum authentication (via backend)

## Common Commands

```bash
# Development server (runs on http://localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Architecture

### Route Structure

The application uses Next.js App Router with route groups for role-based access:

```
src/app/
├── (auth)/              # Unauthenticated routes
│   └── login/           # OTP-based login
├── (crew)/              # Crew member routes (is_crew = 1)
│   └── crew/
│       ├── home/
│       ├── documents/
│       ├── inbox/
│       ├── profile/[crew_id]/
│       └── job-description/
└── (admin)/             # Admin routes (is_crew = 0)
    └── admin/
        ├── crew/
        ├── documents/
        ├── programs/
        ├── chat/
        └── user-management/
```

**Layout Pattern:**
- `(crew)/layout.tsx`: Minimal layout with Navigation component (top nav + bottom mobile nav)
- `(admin)/layout.tsx`: Sidebar layout with collapsible navigation and dropdown menus
- `(auth)/layout.tsx`: Clean layout for authentication pages

### Authentication Flow

**OTP-Based Authentication:**
1. User enters email at `/login`
2. Backend sends OTP to email, returns `session_token`
3. User enters OTP code
4. Backend verifies OTP, returns Sanctum `token` + user data
5. Frontend stores in localStorage + cookies via `AuthService.storeAuthData()`
6. Middleware checks auth state and redirects based on `is_crew` flag

**Key Files:**
- [src/services/auth.ts](src/services/auth.ts) - Authentication service with helper methods
- [src/middleware.ts](src/middleware.ts) - Route protection and role-based redirects
- [src/lib/axios.ts](src/lib/axios.ts) - Axios instance with auth interceptors

**Token Storage:**
- `localStorage`: `auth_token`, `user` (JSON)
- `cookies`: `auth_token`, `user` (for middleware access)
- Max age: 24 hours (86400 seconds)

### Service Layer Pattern

All API communication goes through TypeScript service classes in `src/services/`:

```typescript
// Example: EmploymentDocumentService
export class EmploymentDocumentService {
  static async getEmploymentDocumentsByCrewId(crewId: number): Promise<EmploymentDocument[]> {
    const response = await api.get(`/employment-documents/crew/${crewId}`);
    return response.data.data;
  }
}
```

**Service Organization:**
- One class per entity type
- Static methods for API calls
- Type-safe interfaces from `src/types/api.ts`
- Error handling via axios interceptors

**Common Services:**
- `auth.ts` - Authentication and session management
- `user.ts` - User CRUD operations
- `employment-document.ts` / `travel-document.ts` - Document management
- `geography.ts` - Philippine address hierarchy (regions → provinces → cities → barangays)
- `program.ts` - Program management (admin only)

### Component Architecture

**Modular Document Components:**
```
src/components/crew/documents/employment-document/
├── EmploymentDocumentListComponent.tsx          # Main list container
├── EmploymentDocumentListItemComponent.tsx      # Individual card
├── EmploymentDocumentListSkeleton.tsx           # Loading state
├── AddEmploymentDocumentModal.tsx               # Create modal
├── ViewEmploymentDocumentModal.tsx              # View/edit modal
└── MissingEmploymentDocumentCardComponent.tsx   # Missing docs alert
```

**Profile Components:**
```
src/components/crew-profile/
├── BasicInformation.tsx       # Name, birthdate, gender, etc.
├── ContactInformation.tsx     # Phone, email, addresses
├── EducationInformation.tsx   # School history
├── EmploymentInformation.tsx  # Fleet, rank, hire status
└── PhysicalTraits.tsx         # Height, weight, blood type
```

Each section is independently editable with its own validation.

**Navigation Components:**
- Crew: [src/components/Navigation.tsx](src/components/Navigation.tsx) - Responsive top nav + bottom mobile nav
- Admin: Built into [src/app/(admin)/layout.tsx](src/app/(admin)/layout.tsx) - Sidebar with dropdowns

### Middleware and Route Protection

[src/middleware.ts](src/middleware.ts) handles:
- Redirect logged-in users away from `/login`
- Redirect unauthenticated users to `/login`
- Role-based access: crew → `/crew/*`, admin → `/admin/*`
- Profile access control: crew can only view their own profile
- Root redirect: `/` → `/crew/home` or `/admin` based on role

**How It Works:**
1. Reads `auth_token` and `user` from cookies
2. Checks `is_crew` flag in user object
3. Blocks cross-role access with redirects
4. Runs on all routes except API, static files, and Next.js internals

### API Configuration

**Environment Variables:**
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

**Axios Setup ([src/lib/axios.ts](src/lib/axios.ts)):**
- Base URL: `${NEXT_PUBLIC_BACKEND_URL}/api`
- CSRF cookie: `/sanctum/csrf-cookie` (called before auth requests)
- `withCredentials: true` for cookie-based sessions
- Bearer token auto-injected from localStorage
- 401 responses trigger logout + redirect

**Response Interceptors:**
- Success: Logs response (can be disabled)
- 401 Unauthorized: Clears auth data, redirects to `/login`
- Network errors: User-friendly error messages

### TypeScript Types

All API types defined in [src/types/api.ts](src/types/api.ts):

```typescript
// User structure with nested data
export interface User {
  id: number;
  name: string;
  email: string;
  is_crew: number;  // 1 = crew, 0 = admin

  profile?: UserProfile;       // crew_id, name parts, birth info
  contacts?: UserContact;      // phone, addresses
  employment?: UserEmployment; // fleet, rank, hire status
  education?: UserEducation;   // school info
  physical_traits?: UserPhysicalTraits;
}
```

**Common Patterns:**
- All responses extend `BaseApiResponse` (success, message)
- Request interfaces named `*Request`
- Response interfaces named `*Response`
- Entity interfaces match Laravel model structure

### State Management

**Client-Side State:**
- React `useState` / `useEffect` for component state
- No global state library (Redux, Zustand, etc.)
- User data from localStorage via `AuthService.getStoredUser()`
- Toast notifications via `react-hot-toast`

**Server State:**
- No server components used (all pages are `"use client"`)
- API calls in `useEffect` hooks
- Loading states with skeleton components
- Error handling with try-catch + toast

### Common Development Patterns

**Page Component Template:**
```typescript
"use client";  // Required for all pages

import { useState, useEffect } from "react";
import { SomeService } from "@/services/some-service";
import toast from "react-hot-toast";

export default function PageName() {
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const result = await SomeService.getData();
      setData(result);
    } catch (error: any) {
      toast.error(error.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  return <div>{/* Content */}</div>;
}
```

**Service Method Template:**
```typescript
static async createResource(data: CreateData): Promise<Resource> {
  const response = await api.post<CreateResponse>('/resources', data);
  return response.data.data;
}

static async updateResource(id: number, data: UpdateData): Promise<Resource> {
  const response = await api.put<UpdateResponse>(`/resources/${id}`, data);
  return response.data.data;
}

static async deleteResource(id: number): Promise<void> {
  await api.delete(`/resources/${id}`);
}
```

**Form Submission Pattern:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const result = await SomeService.createResource(formData);
    toast.success("Resource created successfully!");
    // Update state, close modal, etc.
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Operation failed";
    toast.error(message);
  } finally {
    setLoading(false);
  }
};
```

## Key Features

### Document Management
- Employment documents (contracts, certificates) with type classification
- Travel documents (passports, visas) with expiry tracking
- File uploads via FormData
- Missing document alerts
- Approval workflow for document updates (admin side)

### Crew Profile System
- Modular profile sections (basic, contact, education, employment, physical)
- Philippine address system (4-level hierarchy)
- Each section independently editable
- Validation with Yup schemas (where implemented)

### Role-Based Navigation
- **Crew**: Top navigation bar (desktop) + bottom navigation bar (mobile)
  - Links: Home, Documents, Inbox, Job Description
  - Profile access via dropdown
- **Admin**: Collapsible sidebar with nested dropdowns
  - Main: Dashboard, Crew Management, Documents, Chat, Reports
  - Maintenance: User Management, Settings (with sub-menus)

### UI Components
- Radix UI primitives: Avatar, Dialog, Dropdown Menu
- Material UI: Date Pickers
- Custom components in `src/components/ui/`: Button, Textarea
- Tailwind CSS for styling
- Bootstrap Icons (`bi` class prefix)

## Important Conventions

### Path Aliases
- `@/*` maps to `src/*` (configured in [tsconfig.json](tsconfig.json))
- Example: `import { AuthService } from "@/services/auth"`

### File Naming
- Pages: `page.tsx` (Next.js convention)
- Layouts: `layout.tsx` (Next.js convention)
- Components: PascalCase, e.g., `EmploymentDocumentListComponent.tsx`
- Services: lowercase with hyphens, e.g., `employment-document.ts`
- Types: `api.ts` for all API-related types

### API Endpoints
All endpoints are relative to `http://localhost:8000/api`:
- Auth: `/auth/login`, `/auth/verify`, `/auth/logout`
- User: `/user` (current user)
- Documents: `/employment-documents/crew/{crew_id}`, `/travel-documents/crew/{crew_id}`
- Geography: `/regions`, `/provinces/{region_code}`, `/cities/{province_code}`, `/barangays/{city_code}`

### Role Detection
```typescript
const isCrew = user.is_crew === 1;
const isAdmin = user.is_crew === 0;
```

**Never use `role` string field** - it's unreliable. Always use `is_crew` numeric flag.

## Development Tips

### Adding a New Page
1. Create folder in `src/app/(crew)/crew/` or `src/app/(admin)/admin/`
2. Add `page.tsx` with `"use client"` directive
3. Update navigation links in respective layout component
4. Create supporting components in `src/components/`
5. Create service methods in `src/services/` if API calls needed

### Adding a New Service
1. Create `src/services/entity-name.ts`
2. Define TypeScript interfaces (or add to `src/types/api.ts`)
3. Create service class with static methods
4. Use axios instance from `src/lib/axios.ts`
5. Export service from `src/services/index.ts` (if exists)

### Styling Guidelines
- Use Tailwind utility classes
- Responsive design: mobile-first with `md:` and `lg:` breakpoints
- Color scheme: Blue primary (`blue-600`, `blue-900`), gray neutrals
- Icons: Bootstrap Icons via `<i className="bi bi-icon-name"></i>`
- Animations: Use Tailwind's `transition-*` utilities

### Error Handling
- Always wrap API calls in try-catch
- Show user-friendly messages with `react-hot-toast`
- Log errors to console for debugging
- Handle network errors separately from API errors
- Axios interceptor handles 401 globally

### Testing Backend Connection
1. Ensure backend is running at `http://localhost:8000`
2. Check `.env` file has correct `NEXT_PUBLIC_BACKEND_URL`
3. Test CSRF cookie endpoint: `http://localhost:8000/sanctum/csrf-cookie`
4. Check browser Network tab for failed requests
5. Verify CORS configuration on backend (should allow `localhost:3000`)

## Related Documentation

This frontend is part of a monorepo structure:
- Parent repo: `CREW_PORTAL/CLAUDE.md` - Monorepo overview
- Backend: `CREW_PORTAL_BACKEND/CLAUDE.md` - Laravel API documentation
- Backend DB: `CREW_PORTAL_BACKEND/database/DATABASE_STRUCTURE.md` - Database schema
