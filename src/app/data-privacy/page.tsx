"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import nykfillogo from "@/lib/assets/nykfil.png";

const sections = [
  {
    roman: "I",
    icon: "🎯",
    title: "Purpose of Data Collection",
    content: `The Voyager: Connecting and Empowering NYK-Fil Seafarers is developed by NYK-Fil Ship Management, Inc. to enhance documentation, communication, efficiency, and access to services for its seafarers and employees. To achieve this, the app collects personal and employment-related information necessary for crew management, deployment, training, and welfare programs.`,
  },
  {
    roman: "II",
    icon: "📋",
    title: "Information We Collect",
    intro:
      "The following types of data may be collected, stored, and processed through the NYK-FIL App:",
    items: [
      {
        label: "Personal Identification Information",
        detail:
          "Name, birthdate, nationality, contact details, passport, seaman's book, and government-issued IDs.",
      },
      {
        label: "Employment and Training Records",
        detail:
          "Employment history, rank, vessel assignment, licenses, certificates, and training results.",
      },
      {
        label: "Health and Medical Information",
        detail:
          "Pre-employment medical results, vaccination records, and other health-related documents required for deployment and compliance with maritime regulations.",
      },
      {
        label: "App Usage Data",
        detail:
          "Log-in details, activity logs, device information, and location data (for deployment tracking, embarkation and debarkation of NYK-Fil Crew).",
      },
    ],
  },
  {
    roman: "III",
    icon: "⚙️",
    title: "Use of Information",
    intro: "Your data will be used for:",
    list: [
      "Crew recruitment, deployment, and repatriation processes.",
      "Compliance with statutory and regulatory requirements (DMW, MARINA, POEA, and international and other local maritime standards).",
      "Training, validation of licenses, performance monitoring, and career development programs.",
      "Communication regarding company updates, welfare initiatives, and safety alerts.",
      "Digital services such as document verification, schedule notifications, and crew tracking.",
    ],
  },
  {
    roman: "IV",
    icon: "🤝",
    title: "Data Sharing and Disclosure",
    intro:
      "NYK-FIL Ship Management, Inc. may share your information only with:",
    list: [
      "Affiliated Companies within the NYK Group for operational and management purposes.",
      "Principals and Vessel Owners for crew selection, assignment, and management.",
      "Authorized Government Agencies (e.g., DMW, MARINA, POEA, DOH, DFA) as required by law.",
      "Accredited Third Parties such as medical clinics, training centers, and service providers, bound by confidentiality and data sharing agreements.",
    ],
    footer:
      "No personal data will be sold, distributed, or disclosed for commercial gain.",
  },
  {
    roman: "V",
    icon: "🗄️",
    title: "Data Storage and Retention",
    content: `Your information is securely stored in NYK-FIL's protected servers and digital systems with access limited to authorized personnel.\n\nData will be retained only as long as necessary to fulfill the purposes stated above or as required by law and company policy.`,
  },
  {
    roman: "VI",
    icon: "🔒",
    title: "Data Protection Measures",
    intro:
      "NYK-FIL implements organizational, physical, and technical safeguards including:",
    list: [
      "Encryption of sensitive data",
      "Regular security audits and monitoring",
      "Compliance with the Data Privacy Act of 2012 (R.A. 10173) and other relevant international privacy standards",
    ],
  },
  {
    roman: "VII",
    icon: "⚖️",
    title: "Your Rights",
    intro: "As a data subject, you have the right to:",
    list: [
      "Be informed about the processing of your personal data",
      "Access, correct, or update your personal information",
      "Withdraw consent, subject to legal or contractual restrictions",
      "File a complaint with the National Privacy Commission (NPC) in case of any privacy violations",
    ],
    contactInfo: {
      label:
        "Requests for data access or correction may be directed to NYK-FIL's Data Protection Officer:",
      role: "Data Protection Officer",
      company: "NYK-FIL Ship Management, Inc.",
      email: "dpo@nykfil.com.ph",
    },
  },
  {
    roman: "VIII",
    icon: "✅",
    title: "Consent",
    content: `By downloading, accessing, or using the Voyager: Connecting and Empowering NYK-Fil Seafarers App, you signify your consent to the collection, use, and processing of your personal data in accordance with this Privacy Statement.`,
  },
];

export default function DataPrivacyPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<number>>(
    new Set(),
  );
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(
              entry.target.getAttribute("data-index") || "0",
            );
            setVisibleSections((prev) => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 relative overflow-x-hidden">
      {/* Animated background — matching login page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600 rounded-full opacity-20 animate-pulse" />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-700 rounded-full opacity-20 animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full opacity-10 animate-ping"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/4 right-1/3 w-64 h-64 bg-indigo-500 rounded-full opacity-10 animate-pulse"
          style={{ animationDelay: "0.5s" }}
        />
        <div
          className="absolute bottom-1/3 left-1/4 w-48 h-48 bg-blue-400 rounded-full opacity-10 animate-pulse"
          style={{ animationDelay: "1.5s" }}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-blue-900/80 backdrop-blur-md border-b border-white/10 shadow-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src={nykfillogo}
              alt="NYK-FIL Logo"
              width={100}
              height={60}
              className="object-contain"
            />
            <div className="hidden sm:block border-l border-white/20 pl-4">
              <p className="text-xs text-blue-300 uppercase tracking-widest font-medium">
                Official Document
              </p>
              <p className="text-white font-semibold text-sm">
                Data Privacy Statement
              </p>
            </div>
          </div>
          <Link
            href="/login"
            className="flex items-center gap-2 text-sm text-blue-200 hover:text-white transition-all duration-200 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg border border-white/20 hover:border-white/40"
          >
            <span>←</span>
            <span>Back to Login</span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-16 sm:py-24 text-center px-4">
        <div
          className={`transform transition-all duration-1000 ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-blue-200 text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-6 shadow-lg">
            <span>⚓</span>
            <span>NYK-FIL Ship Management, Inc.</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
            Voyager: Connecting and Empowering NYK-Fil Seafarers App
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300 mt-2">
              Data Privacy Statement
            </span>
          </h1>
        </div>
      </section>

      {/* Sections */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 space-y-5">
        {sections.map((section, index) => (
          <div
            key={index}
            ref={(el) => {
              sectionRefs.current[index] = el;
            }}
            data-index={index}
            className={`transform transition-all duration-700 ${
              visibleSections.has(index)
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
            style={{ transitionDelay: `${Math.min(index * 60, 300)}ms` }}
          >
            <div className="bg-white/95 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-blue-500/20">
              {/* Section header bar */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center gap-4">
                <div className="flex-shrink-0 w-11 h-11 bg-white/20 rounded-full flex items-center justify-center text-xl shadow-inner">
                  {section.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-0.5">
                    Section {section.roman}
                  </p>
                  <h2 className="text-white font-bold text-base sm:text-lg leading-tight">
                    {section.title}
                  </h2>
                </div>
                <div className="flex-shrink-0 text-white/30 font-black text-3xl leading-none select-none hidden sm:block">
                  {section.roman}
                </div>
              </div>

              {/* Section body */}
              <div className="p-6 sm:p-8">
                {section.content && (
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                    {section.content}
                  </p>
                )}

                {section.intro && (
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base mb-4">
                    {section.intro}
                  </p>
                )}

                {section.items && (
                  <div className="space-y-3">
                    {section.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex gap-3 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500 hover:bg-blue-100/70 transition-colors duration-200"
                      >
                        <div className="flex-shrink-0 mt-1.5">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-blue-900 text-sm">
                            {item.label}:
                          </p>
                          <p className="text-gray-600 text-sm mt-0.5 leading-relaxed">
                            {item.detail}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {section.list && (
                  <ul className="space-y-2.5">
                    {section.list.map((item, i) => (
                      <li key={i} className="flex gap-3 text-sm text-gray-700">
                        <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        </span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {section.footer && (
                  <div className="mt-5 p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3">
                    <span className="flex-shrink-0 text-amber-500 mt-0.5">
                      ⚠
                    </span>
                    <p className="text-sm text-amber-800 leading-relaxed font-medium">
                      {section.footer}
                    </p>
                  </div>
                )}

                {section.contactInfo && (
                  <div className="mt-5 p-5 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                      {section.contactInfo.label}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-500 text-lg">🏢</span>
                        <div>
                          <p className="font-bold text-blue-900 text-sm">
                            {section.contactInfo.role}
                          </p>
                          <p className="text-gray-600 text-xs">
                            {section.contactInfo.company}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-blue-500 text-lg">📧</span>
                        <a
                          href={`mailto:${section.contactInfo.email}`}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm underline underline-offset-2 transition-colors duration-200"
                        >
                          {section.contactInfo.email}
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-blue-900/80 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-blue-300 space-y-1">
          <p>
            © {new Date().getFullYear()} NYK-FIL Ship Management, Inc. All
            rights reserved.
          </p>
          <p className="text-blue-400 text-xs">
            Data Privacy Act of 2012 (RA 10173) Compliant
          </p>
        </div>
      </footer>
    </div>
  );
}
