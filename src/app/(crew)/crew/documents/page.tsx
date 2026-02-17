"use client";

import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import { motion } from "motion/react";

export default function DocumentsPage() {
  const router = useRouter();

  const documentCategories = [
    {
      id: "employment",
      title: "Personal Documents",
      description: "TIN, SSS, PhilHealth, SRC, etc.",
      icon: "💼",
      path: "/crew/documents/employment-document",
      color: "from-blue-500 to-blue-700",
      hoverColor: "hover:from-blue-600 hover:to-blue-800",
    },
    {
      id: "certificates",
      title: "Certificates",
      description: "Training certificates.",
      icon: "📜",
      path: "/crew/documents/certificate",
      color: "from-green-500 to-green-700",
      hoverColor: "hover:from-green-600 hover:to-green-800",
    },
    {
      id: "travel",
      title: "Travel Documents",
      description: "Passport, US Visa, SID and SIRB",
      icon: "✈️",
      path: "/crew/documents/travel-document",
      color: "from-purple-500 to-purple-700",
      hoverColor: "hover:from-purple-600 hover:to-purple-800",
    },
    {
      id: "debriefing",
      title: "Debriefing",
      description: "Fill out and track your debriefing form.",
      icon: "📝",
      path: "/crew/documents/debriefing",
      color: "from-amber-500 to-orange-700",
      hoverColor: "hover:from-amber-600 hover:to-orange-800",
    },
  ];

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const cardVariants = {
    hidden: {
      y: 50,
      opacity: 0,
      scale: 0.8,
      rotateX: -15,
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      rotateX: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
        duration: 0.6,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation currentPath="/crew/documents" />

      <div className="px-3 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-6 sm:mb-12 lg:mb-16"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              type: "spring" as const,
              stiffness: 80,
              damping: 12,
              delay: 0.1,
            }}
          >
            <motion.h1
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4 px-2"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring" as const,
                stiffness: 120,
                damping: 10,
                delay: 0.2,
              }}
            >
              Document Management
            </motion.h1>
            <motion.p
              className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                type: "spring" as const,
                stiffness: 100,
                damping: 10,
                delay: 0.4,
              }}
            >
              Access and manage your employment, certificate, and travel
              documents
            </motion.p>
          </motion.div>

          {/* Document Category Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8 mb-8 sm:mb-16 lg:mb-24"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {documentCategories.map((category) => (
              <motion.div
                key={category.id}
                variants={cardVariants}
                whileHover={{
                  scale: 1.05,
                  y: -10,
                  rotateY: 5,
                  transition: { duration: 0.3 },
                }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.button
                  onClick={() => handleNavigate(category.path)}
                  className="w-full h-full group"
                >
                  <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-2xl active:shadow-lg transition-shadow duration-300 overflow-hidden h-full perspective-1000">
                    {/* Gradient Background */}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-br ${category.color} ${category.hoverColor}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ opacity: 1, scale: 1 }}
                      whileTap={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                    />

                    {/* Content */}
                    <div className="relative z-10 p-5 sm:p-8 lg:p-10 flex flex-col items-center text-center h-full">
                      {/* Icon */}
                      <motion.div
                        className="text-5xl sm:text-6xl lg:text-7xl mb-3 sm:mb-5 lg:mb-6"
                        whileHover={{
                          scale: 1.2,
                          rotate: [0, -10, 10, -10, 0],
                          transition: { duration: 0.5 },
                        }}
                        whileTap={{
                          scale: 0.9,
                          rotate: 360,
                          transition: { duration: 0.6 },
                        }}
                      >
                        {category.icon}
                      </motion.div>

                      {/* Title */}
                      <motion.h2
                        className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 group-hover:text-white group-active:text-white transition-colors duration-300 mb-2 sm:mb-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        {category.title}
                      </motion.h2>

                      {/* Description */}
                      <motion.p
                        className="text-xs sm:text-sm lg:text-base text-gray-600 group-hover:text-white/90 group-active:text-white/90 transition-colors duration-300 mb-4 sm:mb-6 flex-grow leading-relaxed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        {category.description}
                      </motion.p>

                      {/* Action Button */}
                      <motion.div
                        className="flex items-center space-x-1.5 sm:space-x-2 text-gray-900 group-hover:text-white group-active:text-white transition-colors duration-300 font-medium text-sm sm:text-base"
                        whileHover={{ x: 5 }}
                        transition={{
                          type: "spring" as const,
                          stiffness: 300,
                          damping: 10,
                        }}
                      >
                        <span>View Documents</span>
                        <motion.svg
                          className="w-4 h-4 sm:w-5 sm:h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          animate={{ x: [0, 3, 0] }}
                          transition={{
                            repeat: Infinity,
                            duration: 1.5,
                            ease: "easeInOut",
                          }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </motion.svg>
                      </motion.div>
                    </div>

                    {/* Border Highlight */}
                    <motion.div
                      className="absolute inset-0 border-2 border-white/30 rounded-xl sm:rounded-2xl pointer-events-none"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      whileTap={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
