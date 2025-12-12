"use client";

import { motion, type Variants } from "framer-motion";

function TravelDocumentListSkeleton() {
  const shimmerVariants: Variants = {
    initial: { x: "-100%" },
    animate: {
      x: "100%",
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: "linear" as const,
      },
    },
  };

  const pulseVariants: Variants = {
    initial: { opacity: 0.6 },
    animate: {
      opacity: [0.6, 1, 0.6],
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: "easeInOut" as const,
      },
    },
  };

  const spinVariants: Variants = {
    animate: {
      rotate: 360,
      transition: {
        repeat: Infinity,
        duration: 1,
        ease: "linear" as const,
      },
    },
  };

  const bounceVariants = (delay: number): Variants => ({
    initial: { y: 0 },
    animate: {
      y: [0, -8, 0],
      transition: {
        repeat: Infinity,
        duration: 0.6,
        ease: "easeInOut" as const,
        delay,
      },
    },
  });

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.1,
        duration: 0.4,
      },
    }),
  };

  return (
    <div className="space-y-4 mb-28">
      {[1, 2, 3, 4].map((index) => (
        <motion.div
          key={index}
          custom={index}
          variants={cardVariants}
          initial="initial"
          animate="animate"
          className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm overflow-hidden relative"
        >
          {/* Shimmer overlay with Framer Motion */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
              className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
            />
          </div>

          <div className="flex items-center gap-4 relative">
            {/* Icon Skeleton with spinning loader */}
            <div className="flex-shrink-0">
              <motion.div
                variants={pulseVariants}
                initial="initial"
                animate="animate"
                className="w-14 h-14 bg-gradient-to-br from-blue-200 to-blue-300 rounded-xl shadow-md flex items-center justify-center"
              >
                <motion.svg
                  variants={spinVariants}
                  animate="animate"
                  className="w-7 h-7 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </motion.svg>
              </motion.div>
            </div>

            {/* Content Skeleton */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <motion.div
                  variants={pulseVariants}
                  initial="initial"
                  animate="animate"
                  className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-36"
                />
                <motion.div
                  variants={pulseVariants}
                  initial="initial"
                  animate="animate"
                  className="h-6 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-full w-28"
                />
              </div>
              <motion.div
                variants={pulseVariants}
                initial="initial"
                animate="animate"
                className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-48 mt-2"
              />
            </div>

            {/* Status Badge Skeleton */}
            <div className="flex-shrink-0">
              <motion.div
                variants={pulseVariants}
                initial="initial"
                animate="animate"
                className="h-8 bg-gradient-to-r from-green-200 to-green-300 rounded-lg w-20"
              />
            </div>
          </div>
        </motion.div>
      ))}

      {/* Loading text with animated elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center py-8"
      >
        <div className="inline-flex items-center gap-2 text-gray-500">
          <motion.svg
            variants={spinVariants}
            animate="animate"
            className="w-5 h-5 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </motion.svg>
          <span className="text-sm font-medium">Loading travel documents</span>
          <span className="flex gap-1">
            {[0, 0.15, 0.3].map((delay, idx) => (
              <motion.span
                key={idx}
                variants={bounceVariants(delay)}
                initial="initial"
                animate="animate"
                className="w-1 h-1 bg-blue-600 rounded-full"
              />
            ))}
          </span>
        </div>
      </motion.div>
    </div>
  );
}

export default TravelDocumentListSkeleton;
