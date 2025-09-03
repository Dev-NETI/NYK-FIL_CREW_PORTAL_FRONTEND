# Job Description Request Module

A comprehensive module for managing job description requests in the NYK-FIL Crew Portal. This module enables crew members to request official job description documents and provides administrators with tools to process and approve these requests.

## 📁 Module Structure

```
src/components/job-description-module/
├── JobDescriptionRequestForm.tsx    # Form component for creating requests
├── JobDescriptionStatus.tsx         # Status tracking and history component
├── PDFViewer.tsx                   # PDF generation and editing component
├── index.ts                        # Export barrel file
└── README.md                       # This documentation
```

## 🚢 Pages

```
src/app/
├── (crew)/
│   └── job-description/
│       └── page.tsx                # Crew request interface
└── (admin)/
    └── admin/
        └── job-descriptions/
            ├── page.tsx            # EA management interface
            └── vp-approval/
                └── page.tsx        # VP approval interface
```

## 🎯 Features Overview

### For Crew Members
- ✅ Request job description for various purposes (SSS, Pag-Ibig, PhilHealth, VISA)
- ✅ Select specific VISA types when applicable
- ✅ Track request status with visual progress indicators
- ✅ Download approved job description PDFs
- ✅ View request history and status updates

### For Executive Assistant (EA)
- ✅ View all pending job description requests
- ✅ Process requests with status management
- ✅ Generate PDF documents using browser-based editor
- ✅ Forward completed requests to VP for approval
- ✅ Dashboard with request statistics

### For Vice President (VP)
- ✅ Review job description documents
- ✅ Approve or disapprove requests with reasons
- ✅ Add digital signature to approved documents
- ✅ Email notifications to crew members (ready for backend)

## 📋 Component API

### JobDescriptionRequestForm

Form component for crew members to submit job description requests.

**Props:**
```typescript
interface JobDescriptionRequestFormProps {
  onSubmit: (data: JobDescriptionRequest) => void;
  isSubmitting?: boolean;
}

interface JobDescriptionRequest {
  purpose: string;           // Required: SSS, PAG_IBIG, PHILHEALTH, VISA
  visaType?: string;         // Optional: Required when purpose is VISA
  notes?: string;            // Optional: Additional notes
}
```

**Usage:**
```tsx
import { JobDescriptionRequestForm } from '@/components/job-description-module';

<JobDescriptionRequestForm
  onSubmit={(data) => console.log(data)}
  isSubmitting={false}
/>
```

**Purpose Options:**
- `SSS` - Social Security System
- `PAG_IBIG` - Pag-Ibig Fund
- `PHILHEALTH` - PhilHealth
- `VISA` - VISA Application

**VISA Types (when purpose is VISA):**
- `TOURIST` - Tourist Visa
- `BUSINESS` - Business Visa
- `WORK` - Work Visa
- `TRANSIT` - Transit Visa
- `STUDENT` - Student Visa
- `FAMILY` - Family/Dependent Visa
- `SEAMAN` - Seaman's Visa

### JobDescriptionStatus

Component for displaying request status and history.

**Props:**
```typescript
interface JobDescriptionStatusProps {
  crewId?: string;          // Optional: Filter by crew ID
  className?: string;       // Optional: Additional CSS classes
}
```

**Usage:**
```tsx
import { JobDescriptionStatus } from '@/components/job-description-module';

<JobDescriptionStatus 
  crewId="NYC-2024-001" 
  className="mt-8" 
/>
```

**Status Types:**
- `pending` - Request submitted, awaiting EA review
- `in_progress` - EA is processing the request
- `ready_for_approval` - Awaiting VP approval
- `approved` - Approved and ready for download
- `disapproved` - Rejected with reason

### PDFViewer

PDF generation and editing component with digital signature support.

**Props:**
```typescript
interface PDFViewerProps {
  pdfData: PDFData;           // PDF content data
  crewInfo: CrewInfo;         // Crew member information
  isEditable?: boolean;       // Enable editing mode
  onDataChange?: (data: PDFData) => void;  // Data change callback
  showSignature?: boolean;    // Show signature area
  signatureAdded?: boolean;   // Signature status
  onSignatureToggle?: () => void;  // Signature toggle callback
}

interface PDFData {
  memoNo: string;            // Memo number
  hireDate: string;          // Employee hire date
  rank: string;              // Employee rank/position
  vesselType: string;        // Type of vessel
  contractStart: string;     // Contract start date
  contractEnd: string;       // Contract end date
  purpose: string;           // Purpose of request
}

interface CrewInfo {
  name: string;              // Crew member name
  id: string;                // Crew member ID
}
```

**Usage:**
```tsx
import { PDFViewer } from '@/components/job-description-module';

<PDFViewer
  pdfData={{
    memoNo: "NYK-JD-2025-001",
    hireDate: "2024-06-01",
    rank: "Able Seaman",
    vesselType: "Container Vessel",
    contractStart: "2024-06-01",
    contractEnd: "2025-05-31",
    purpose: "SSS Application"
  }}
  crewInfo={{
    name: "Juan Dela Cruz",
    id: "NYC-2024-001"
  }}
  isEditable={true}
  onDataChange={(data) => console.log(data)}
  showSignature={true}
  signatureAdded={false}
  onSignatureToggle={() => console.log("Toggle signature")}
/>
```

## 🔄 Workflow

### 1. Request Submission
```
Crew Member → Select Purpose → Fill Form → Submit Request
```

### 2. EA Processing
```
EA → View Requests → Process → Generate PDF → Forward to VP
```

### 3. VP Approval
```
VP → Review PDF → Approve/Disapprove → Add Signature (if approved) → Notify Crew
```

### 4. Download
```
Crew Member → Receive Notification → Download PDF
```

## 🎨 Styling & Design

The module follows the existing design system:

- **Colors**: Blue primary (`blue-600`, `blue-700`), status-based colors
- **Typography**: Poppins font family with various weights
- **Spacing**: Consistent padding and margins using Tailwind classes
- **Components**: Rounded corners, shadows, and smooth transitions
- **Responsive**: Mobile-first design with responsive breakpoints

## 📱 Navigation Integration

### Crew Navigation
Added to `/src/components/Navigation.tsx`:
```tsx
{
  href: "/job-description",
  label: "Job Description",
  icon: "file-earmark-text",
  activeIcon: "file-earmark-text-fill",
}
```

### Admin Navigation
Added to `/src/app/(admin)/layout.tsx`:
```tsx
<Link href="/admin/job-descriptions">
  <i className="bi bi-file-earmark-check mr-3"></i>
  Job Descriptions
</Link>
```

## 🔧 Backend Integration Points

### API Endpoints (Ready for Implementation)

```typescript
// Crew endpoints
POST /api/job-descriptions/request          // Submit new request
GET  /api/job-descriptions/crew/:crewId     // Get crew requests
GET  /api/job-descriptions/:id/download     // Download PDF

// EA endpoints
GET  /api/job-descriptions/pending          // Get pending requests
PUT  /api/job-descriptions/:id/process      // Process request
POST /api/job-descriptions/:id/generate-pdf // Generate PDF

// VP endpoints
GET  /api/job-descriptions/approval         // Get requests for approval
PUT  /api/job-descriptions/:id/approve      // Approve request
PUT  /api/job-descriptions/:id/disapprove   // Disapprove request
```

### Email Notifications (Ready for Backend)

```typescript
// Email templates needed:
- crew_request_submitted.html       // Notify EA/VP of new request
- crew_request_approved.html        // Notify crew of approval
- crew_request_disapproved.html     // Notify crew of disapproval
```

### Database Schema Suggestion

```sql
CREATE TABLE job_description_requests (
  id UUID PRIMARY KEY,
  crew_id VARCHAR(50) NOT NULL,
  purpose VARCHAR(20) NOT NULL,
  visa_type VARCHAR(20),
  notes TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  memo_no VARCHAR(50),
  pdf_data JSONB,
  processed_by VARCHAR(50),
  processed_date TIMESTAMP,
  approved_by VARCHAR(50),
  approved_date TIMESTAMP,
  disapproval_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🚀 Usage Examples

### Basic Crew Request Page
```tsx
"use client";

import { useState } from "react";
import { JobDescriptionRequestForm } from "@/components/job-description-module";

export default function RequestPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await fetch('/api/job-descriptions/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <JobDescriptionRequestForm
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
}
```

### Admin Management Interface
```tsx
"use client";

import { useState, useEffect } from "react";
import { PDFViewer } from "@/components/job-description-module";

export default function AdminPage() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    // Fetch pending requests
    fetch('/api/job-descriptions/pending')
      .then(res => res.json())
      .then(setRequests);
  }, []);

  const handleProcess = (request) => {
    setSelectedRequest(request);
  };

  return (
    <div>
      {/* Request list */}
      {requests.map(request => (
        <button key={request.id} onClick={() => handleProcess(request)}>
          Process {request.id}
        </button>
      ))}

      {/* PDF Editor */}
      {selectedRequest && (
        <PDFViewer
          pdfData={selectedRequest.pdfData}
          crewInfo={selectedRequest.crewInfo}
          isEditable={true}
          onDataChange={(data) => {
            setSelectedRequest({
              ...selectedRequest,
              pdfData: data
            });
          }}
        />
      )}
    </div>
  );
}
```

## 🔒 Security Considerations

1. **Access Control**: Ensure crew members can only view their own requests
2. **Input Validation**: Validate all form inputs on both client and server
3. **File Security**: Secure PDF generation and storage
4. **Audit Trail**: Log all status changes and approvals
5. **Rate Limiting**: Prevent spam requests

## 🧪 Testing Recommendations

### Unit Tests
- Form validation logic
- Status calculation functions
- PDF data formatting

### Integration Tests
- Complete request workflow
- Email notification triggers
- PDF generation process

### E2E Tests
- Full user journey from request to download
- Admin approval workflow
- Error handling scenarios

## 📈 Future Enhancements

1. **Bulk Processing**: Allow EA to process multiple requests
2. **Templates**: Pre-defined job description templates
3. **Analytics**: Request statistics and reporting
4. **Mobile App**: Native mobile support
5. **Multi-language**: Support for Filipino/Tagalog
6. **Digital Certificates**: Enhanced PDF security

## 🐛 Troubleshooting

### Common Issues

**Form not submitting:**
- Check if all required fields are filled
- Verify VISA type is selected when purpose is VISA

**PDF not generating:**
- Ensure all PDF data fields have values
- Check browser PDF generation support

**Status not updating:**
- Verify backend API endpoints are working
- Check network requests in browser dev tools

### Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 📞 Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.

---

*This module is part of the NYK-FIL Crew Portal system and follows the established coding standards and design patterns.*