"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import nykfillogo from "@/lib/assets/nykfil.png";

const sections = [
  {
    id: "overview",
    icon: "🛡️",
    title: "Overview",
    content: `NYK-FIL Manning Agency, Inc. ("NYK-FIL", "we", "us", or "our") is committed to protecting the privacy and personal data of our crew members, employees, and all individuals whose information we process. This Data Privacy Policy outlines how we collect, use, store, share, and protect your personal information in compliance with Republic Act No. 10173, otherwise known as the Data Privacy Act of 2012 (DPA), and its Implementing Rules and Regulations.

By using the NYK-FIL Crew Portal, you acknowledge that you have read, understood, and agree to the terms of this Privacy Policy.`,
  },
  {
    id: "data-collected",
    icon: "📋",
    title: "Personal Data We Collect",
    subsections: [
      {
        subtitle: "Identity & Contact Information",
        items: [
          "Full name, date of birth, gender, civil status, nationality",
          "Home address, provincial address, contact numbers",
          "Email address, emergency contact details",
          "Government-issued IDs (SSS, PhilHealth, Pag-IBIG, TIN)",
        ],
      },
      {
        subtitle: "Employment & Maritime Records",
        items: [
          "Rank, position, and employment history",
          "Vessel assignments and fleet records",
          "Contract details, deployment dates, and duration",
          "Performance evaluations and debriefing records",
        ],
      },
      {
        subtitle: "Documents & Credentials",
        items: [
          "Seaman's Book (SIRB), passport, and visa information",
          "STCW certificates and maritime training documents",
          "Medical certificates and fitness-for-duty records",
          "Educational background and professional qualifications",
        ],
      },
      {
        subtitle: "Financial Information",
        items: [
          "Bank account details for allotment purposes",
          "Allotee information and remittance records",
          "Salary, wages, and compensation data",
        ],
      },
      {
        subtitle: "System Usage Data",
        items: [
          "Login activity logs and access timestamps",
          "IP addresses and device identifiers for security purposes",
          "Appointment bookings and portal interaction history",
        ],
      },
    ],
  },
  {
    id: "purpose",
    icon: "🎯",
    title: "Purpose of Data Processing",
    content: `We collect and process your personal data for the following legitimate purposes:`,
    list: [
      "Manning and crew management operations — deployment, contract administration, and vessel assignments",
      "Compliance with maritime regulations, POEA requirements, and international maritime conventions (STCW, MLC 2006)",
      "Document and certificate management — issuance, renewal tracking, and verification",
      "Payroll processing, allotment remittances, and financial administration",
      "Medical monitoring, occupational health compliance, and crew welfare programs",
      "Communication regarding employment status, appointment schedules, and official notices",
      "Appointment scheduling and administrative workflow management",
      "Legal compliance with Philippine labor laws, SSS, PhilHealth, and Pag-IBIG regulations",
      "Security monitoring and prevention of unauthorized access to the portal",
      "Preparation of job description documents for government agency requirements",
    ],
  },
  {
    id: "sharing",
    icon: "🤝",
    title: "Data Sharing & Disclosure",
    content: `NYK-FIL may share your personal data with authorized third parties only to the extent necessary and for legitimate purposes:`,
    list: [
      "NYK Group of Companies (principal) — for crew deployment and vessel management coordination",
      "Philippine Overseas Employment Administration (POEA) — for employment registration and compliance",
      "Maritime Industry Authority (MARINA) — for seafarer certification and documentation",
      "Social Security System (SSS), PhilHealth, and Pag-IBIG — for mandatory government benefit contributions",
      "Insurance providers — for crew insurance and Protection & Indemnity (P&I) coverage",
      "Banks and financial institutions — for allotment remittances and salary processing",
      "Medical service providers — for pre-employment medical examinations and occupational health",
      "Government agencies and law enforcement — when required by law, court order, or legal process",
    ],
    footer: "We do not sell, rent, or trade your personal information to any third party for commercial purposes.",
  },
  {
    id: "retention",
    icon: "🗂️",
    title: "Data Retention",
    content: `We retain personal data only for as long as necessary to fulfill the purposes for which it was collected, or as required by applicable law and regulations:`,
    list: [
      "Active crew records are retained throughout the duration of employment",
      "Employment and contract records are kept for a minimum of 10 years post-employment as required by maritime and labor regulations",
      "Financial and allotment records are retained for 5 years in compliance with tax and accounting requirements",
      "Travel documents and certificate records are retained for 5 years after document expiry",
      "System access logs are retained for 2 years for security and audit purposes",
    ],
    footer: "Upon the expiration of the retention period, personal data will be disposed of securely and in a manner that prevents unauthorized access or disclosure.",
  },
  {
    id: "security",
    icon: "🔒",
    title: "Data Security Measures",
    content: `NYK-FIL implements appropriate technical, organizational, and physical security measures to protect your personal data against unauthorized access, disclosure, alteration, or destruction:`,
    list: [
      "Secure OTP-based authentication — no password storage, reducing credential theft risk",
      "Bearer token-based session management with automatic expiry",
      "Role-based access controls — crew and admin roles with strict data segregation",
      "Encrypted data transmission using HTTPS/TLS protocols",
      "Audit logging of all data access, modifications, and administrative actions",
      "Regular security assessments and vulnerability testing of the portal",
      "Device binding controls to prevent unauthorized multi-device access",
      "Staff training on data privacy obligations and information security practices",
    ],
  },
  {
    id: "rights",
    icon: "⚖️",
    title: "Your Rights as a Data Subject",
    content: `Under the Data Privacy Act of 2012, you have the following rights with respect to your personal data:`,
    subsections: [
      {
        subtitle: "Right to be Informed",
        items: ["You have the right to be informed of the collection and processing of your personal data."],
      },
      {
        subtitle: "Right to Access",
        items: ["You may request a copy of your personal data held by NYK-FIL and information on how it is being processed."],
      },
      {
        subtitle: "Right to Rectification",
        items: ["You may request correction of any inaccurate or incomplete personal data through the Profile Update Request feature in the portal."],
      },
      {
        subtitle: "Right to Erasure or Blocking",
        items: ["You may request the removal or blocking of your personal data when it is no longer necessary for the purpose it was collected, subject to applicable legal retention requirements."],
      },
      {
        subtitle: "Right to Object",
        items: ["You may object to the processing of your personal data for specific purposes, where processing is based on legitimate interests rather than legal obligation."],
      },
      {
        subtitle: "Right to Data Portability",
        items: ["You may request a copy of your personal data in a structured, commonly used, and machine-readable format."],
      },
      {
        subtitle: "Right to Lodge a Complaint",
        items: ["You have the right to file a complaint with the National Privacy Commission (NPC) if you believe your data privacy rights have been violated. Visit www.privacy.gov.ph for more information."],
      },
    ],
  },
  {
    id: "cookies",
    icon: "🍪",
    title: "Cookies & Session Data",
    content: `The NYK-FIL Crew Portal uses session tokens and browser storage mechanisms to maintain your authenticated session. These are strictly necessary for the portal to function and are not used for tracking or advertising purposes. Session tokens expire automatically after 24 hours, requiring re-authentication for continued portal access.`,
  },
  {
    id: "changes",
    icon: "📝",
    title: "Changes to This Policy",
    content: `NYK-FIL reserves the right to update or modify this Data Privacy Policy at any time to reflect changes in our practices, legal requirements, or operational needs. Material changes will be communicated to registered users through the portal or via email. Continued use of the portal after any such changes constitutes your acceptance of the updated policy. We encourage you to review this policy periodically.

This policy was last reviewed and updated in March 2026.`,
  },
  {
    id: "contact",
    icon: "📬",
    title: "Contact & Data Privacy Officer",
    content: `For any concerns, requests, or complaints regarding your personal data or this Privacy Policy, please contact our Data Privacy Officer:`,
    contactInfo: {
      company: "NYK-FIL Manning Agency, Inc.",
      address: "28th Floor, Robinsons Equitable Tower, ADB Avenue corner Poveda Road, Ortigas Center, Pasig City, Metro Manila, Philippines",
      email: "dpo@nyk-fil.com",
      phone: "+63 2 8637-XXXX",
      npc: "National Privacy Commission — www.privacy.gov.ph",
    },
  },
];

export default function DataPrivacyPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-white/10 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src={nykfillogo}
              alt="NYK-FIL Logo"
              width={100}
              height={60}
              className="object-contain"
            />
            <div className="hidden sm:block border-l border-white/20 pl-4">
              <p className="text-xs text-blue-300 uppercase tracking-widest font-medium">Official Document</p>
              <p className="text-white font-semibold text-sm">Data Privacy Policy</p>
            </div>
          </div>
          <Link
            href="/login"
            className="flex items-center gap-2 text-sm text-blue-300 hover:text-white transition-colors duration-200 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg border border-white/10"
          >
            <span>←</span>
            <span>Back to Login</span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            <span>🇵🇭</span>
            <span>Republic Act No. 10173 — Data Privacy Act of 2012</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Data Privacy
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Policy
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            NYK-FIL Manning Agency, Inc. is committed to protecting your personal information and upholding your rights as a data subject.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400"></span>
              <span>Last Updated: March 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span>DPA 2012 Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              <span>MLC 2006 Aligned</span>
            </div>
          </div>
        </div>
      </section>

      {/* Table of Contents + Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar TOC */}
          <aside className="lg:w-72 shrink-0">
            <div className="sticky top-24 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 shadow-xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Contents</p>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                      activeSection === section.id
                        ? "bg-blue-600/20 text-blue-300 border border-blue-500/30"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span>{section.icon}</span>
                    <span>{section.title}</span>
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-6">
            {sections.map((section, index) => (
              <article
                key={section.id}
                id={section.id}
                className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:border-blue-500/30 transition-all duration-300"
              >
                {/* Section Header */}
                <div className="flex items-center gap-4 p-6 sm:p-8 border-b border-white/10 bg-white/3">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 flex items-center justify-center text-2xl">
                    {section.icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-0.5">
                      Section {String(index + 1).padStart(2, "0")}
                    </p>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">{section.title}</h2>
                  </div>
                </div>

                {/* Section Body */}
                <div className="p-6 sm:p-8 space-y-6">
                  {section.content && (
                    <p className="text-slate-300 leading-relaxed text-sm sm:text-base">{section.content}</p>
                  )}

                  {section.list && (
                    <ul className="space-y-3">
                      {section.list.map((item, i) => (
                        <li key={i} className="flex gap-3 text-sm sm:text-base text-slate-300">
                          <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                          </span>
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {section.footer && (
                    <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                      <p className="text-sm text-amber-200 leading-relaxed">
                        <span className="font-semibold">Note: </span>{section.footer}
                      </p>
                    </div>
                  )}

                  {section.subsections && (
                    <div className="space-y-5">
                      {section.subsections.map((sub, si) => (
                        <div key={si} className="pl-4 border-l-2 border-blue-500/30">
                          <h3 className="font-semibold text-blue-300 mb-2 text-sm sm:text-base">{sub.subtitle}</h3>
                          <ul className="space-y-2">
                            {sub.items.map((item, ii) => (
                              <li key={ii} className="flex gap-3 text-sm text-slate-400">
                                <span className="flex-shrink-0 text-blue-500 mt-0.5">›</span>
                                <span className="leading-relaxed">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.contactInfo && (
                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                      <div className="space-y-3">
                        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-1">Company</p>
                          <p className="text-white font-medium text-sm">{section.contactInfo.company}</p>
                        </div>
                        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-1">Email</p>
                          <p className="text-white font-medium text-sm">{section.contactInfo.email}</p>
                        </div>
                        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-1">Phone</p>
                          <p className="text-white font-medium text-sm">{section.contactInfo.phone}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-1">Address</p>
                          <p className="text-white font-medium text-sm leading-relaxed">{section.contactInfo.address}</p>
                        </div>
                        <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                          <p className="text-xs font-semibold uppercase tracking-widest text-purple-400 mb-1">Regulatory Authority</p>
                          <p className="text-white font-medium text-sm">{section.contactInfo.npc}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            ))}

            {/* Footer card */}
            <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30 rounded-2xl p-8 text-center shadow-xl">
              <div className="text-4xl mb-4">⚓</div>
              <h3 className="text-xl font-bold text-white mb-2">Your Privacy Matters to Us</h3>
              <p className="text-slate-300 text-sm max-w-lg mx-auto mb-6 leading-relaxed">
                NYK-FIL Manning Agency, Inc. is dedicated to safeguarding your personal information and ensuring transparent data practices in accordance with Philippine law.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-blue-500/25 hover:scale-105"
              >
                <span>←</span>
                <span>Return to Login</span>
              </Link>
            </div>
          </main>
        </div>
      </div>

      {/* Bottom Footer */}
      <footer className="border-t border-white/10 bg-slate-900/80 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} NYK-FIL Manning Agency, Inc. All rights reserved.</p>
          <p>Data Privacy Act of 2012 (RA 10173) Compliant</p>
        </div>
      </footer>
    </div>
  );
}
