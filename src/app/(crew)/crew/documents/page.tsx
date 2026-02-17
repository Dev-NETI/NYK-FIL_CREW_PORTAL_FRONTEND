"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";

export default function DocumentsPage() {
  const router = useRouter();

  const documentCategories = [
    {
      id: "employment",
      title: "Personal Documents",
      description: "TIN, SSS, PhilHealth, SRC",
      icon: "bi-folder-fill",
      path: "/crew/documents/employment-document",
      color: "bg-blue-500",
      lightColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      id: "certificates",
      title: "Certificates",
      description: "Training certificates",
      icon: "bi-award-fill",
      path: "/crew/documents/certificate",
      color: "bg-emerald-500",
      lightColor: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      id: "travel",
      title: "Travel Documents",
      description: "Passport, Visa, SID, SIRB",
      icon: "bi-airplane-fill",
      path: "/crew/documents/travel-document",
      color: "bg-violet-500",
      lightColor: "bg-violet-50",
      textColor: "text-violet-600",
    },
    {
      id: "debriefing",
      title: "Debriefing",
      description: "Fill out debriefing form",
      icon: "bi-clipboard-check-fill",
      path: "/crew/documents/debriefing",
      color: "bg-amber-500",
      lightColor: "bg-amber-50",
      textColor: "text-amber-600",
    },
  ];

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <div
      className="min-h-screen pt-15 flex flex-col bg-cover bg-center bg-no-repeat bg-fixed relative"
      style={{ backgroundImage: "url('/home1.png')" }}
    >
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Header */}
      <motion.div
        className="relative z-10 px-4 sm:px-6 py-8 sm:py-12"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <i className="bi bi-folder2-open text-2xl sm:text-3xl text-white"></i>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                Documents
              </h1>
              <p className="text-sm sm:text-base text-white/60 mt-0.5">
                Manage and access your files
              </p>
            </div>
          </div>
        </div>
      </motion.div>
      <div className="relative z-10 flex-1 px-4 sm:px-6 lg:px-8 pt-4 pb-20 md:pb-8 sm:py-10 lg:py-12 bg-blue-900/90 rounded-t-4xl">
        <div className="max-w-4xl mx-auto">
          {/* Mobile: Minimal List View */}
          <div className="sm:hidden space-y-3">
            {documentCategories.map((category, index) => (
              <motion.button
                key={category.id}
                onClick={() => handleNavigate(category.path)}
                className="w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <div className="bg-white rounded-2xl p-4 flex items-center gap-4 active:scale-[0.98] transition-transform shadow-sm border border-gray-100">
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl ${category.lightColor} flex items-center justify-center flex-shrink-0`}
                  >
                    <i
                      className={`bi ${category.icon} text-xl ${category.textColor}`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-left min-w-0">
                    <h3 className="font-semibold text-gray-900 text-base">
                      {category.title}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {category.description}
                    </p>
                  </div>

                  {/* Arrow */}
                  <i className="bi bi-chevron-right text-gray-300 text-lg" />
                </div>
              </motion.button>
            ))}
          </div>

          {/* Desktop: Card Grid */}
          <motion.div
            className="hidden sm:grid sm:grid-cols-2 gap-4 lg:gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {documentCategories.map((category, index) => (
              <motion.button
                key={category.id}
                onClick={() => handleNavigate(category.path)}
                className="group text-left"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="bg-white rounded-2xl p-6 lg:p-8 h-full shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300">
                  {/* Icon */}
                  <div
                    className={`w-14 h-14 rounded-2xl ${category.color} flex items-center justify-center mb-5`}
                  >
                    <i className={`bi ${category.icon} text-2xl text-white`} />
                  </div>

                  {/* Title */}
                  <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                    {category.title}
                  </h2>

                  {/* Description */}
                  <p className="text-sm lg:text-base text-gray-500 mb-5">
                    {category.description}
                  </p>

                  {/* Action */}
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-400 group-hover:text-gray-600 transition-colors">
                    <span>View</span>
                    <i className="bi bi-arrow-right group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
