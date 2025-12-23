"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  FileCheck,
  Plane,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Award,
} from "lucide-react";
import { useState, useEffect } from "react";
import { EmploymentDocumentApprovalService } from "@/services/employment-document-approval";
import { TravelDocumentApprovalService } from "@/services/travel-document-approval";
import { CrewCertificateApprovalService } from "@/services/crew-certificate-approval";

export default function DocumentsPage() {
  const router = useRouter();
  const [pendingEmploymentCount, setPendingEmploymentCount] = useState(0);
  const [pendingTravelCount, setPendingTravelCount] = useState(0);
  const [pendingCertificateCount, setPendingCertificateCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingCounts();
  }, []);

  const loadPendingCounts = async () => {
    try {
      setLoading(true);
      const employmentUpdates =
        await EmploymentDocumentApprovalService.getPendingUpdates();
      setPendingEmploymentCount(employmentUpdates.length);

      const travelUpdates =
        await TravelDocumentApprovalService.getPendingUpdates();
      setPendingTravelCount(travelUpdates.length);

      const certificateUpdates =
        await CrewCertificateApprovalService.getPendingUpdates();
      setPendingCertificateCount(certificateUpdates.length);
    } catch (error) {
      console.error("Error loading pending counts:", error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  const cardHoverVariants = {
    rest: { scale: 1 },
    hover: {
      scale: 1.02,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 17,
      },
    },
  };

  const iconVariants = {
    rest: { rotate: 0 },
    hover: {
      rotate: [0, -10, 10, -10, 0],
      transition: {
        duration: 0.5,
      },
    },
  };

  const arrowVariants = {
    rest: { x: 0, opacity: 0.7 },
    hover: {
      x: 5,
      opacity: 1,
      transition: {
        duration: 0.3,
        repeat: Infinity,
        repeatType: "reverse" as const,
      },
    },
  };

  const documentCards = [
    {
      title: "Personal Document Approvals",
      description: "Review and approve crew personal document update requests",
      icon: FileCheck,
      color: "blue",
      gradient: "from-blue-500 to-indigo-600",
      bgGradient: "from-blue-50 to-indigo-50",
      hoverGradient: "from-blue-100 to-indigo-100",
      route: "/admin/documents/employment-document-approvals",
      pendingCount: pendingEmploymentCount,
    },
    {
      title: "Travel Document Approvals",
      description: "Review and approve crew travel document update requests",
      icon: Plane,
      color: "purple",
      gradient: "from-purple-500 to-pink-600",
      bgGradient: "from-purple-50 to-pink-50",
      hoverGradient: "from-purple-100 to-pink-100",
      route: "/admin/documents/travel-document-approvals",
      pendingCount: pendingTravelCount,
    },
    {
      title: "Certificate Approvals",
      description: "Review and approve crew certificate update requests",
      icon: Award,
      color: "green",
      gradient: "from-green-500 to-emerald-600",
      bgGradient: "from-green-50 to-emerald-50",
      hoverGradient: "from-green-100 to-emerald-100",
      route: "/admin/documents/certificate-approvals",
      pendingCount: pendingCertificateCount,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Document Management
                </h1>
                <p className="text-lg text-gray-600">
                  Review and approve crew document update requests
                </p>
              </div>

              {!loading &&
                (pendingEmploymentCount > 0 ||
                  pendingTravelCount > 0 ||
                  pendingCertificateCount > 0) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl px-6 py-4 shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-yellow-100 p-3 rounded-xl">
                        <AlertCircle className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {pendingEmploymentCount +
                            pendingTravelCount +
                            pendingCertificateCount}
                        </div>
                        <div className="text-sm text-gray-600">
                          Pending Requests
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
            </div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {documentCards.map((card, index) => {
              const Icon = card.icon;

              return (
                <motion.div
                  key={card.title}
                  variants={itemVariants}
                  whileHover="hover"
                  initial="rest"
                  className="relative"
                >
                  <motion.div
                    variants={cardHoverVariants}
                    onClick={() => !card.comingSoon && router.push(card.route)}
                    className={`relative bg-gradient-to-br ${
                      card.bgGradient
                    } border-2 border-gray-200 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 ${
                      card.comingSoon
                        ? "cursor-not-allowed opacity-75"
                        : "cursor-pointer"
                    } overflow-hidden group`}
                  >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/30 to-transparent rounded-full -mr-32 -mt-32 blur-2xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-white/40 to-transparent rounded-full -ml-24 -mb-24 blur-xl" />

                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-6">
                        <motion.div
                          variants={iconVariants}
                          className={`bg-gradient-to-br ${card.gradient} p-4 rounded-2xl shadow-lg`}
                        >
                          <Icon className="w-8 h-8 text-white" />
                        </motion.div>

                        {!loading && card.pendingCount > 0 && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 15,
                              delay: 0.5 + index * 0.1,
                            }}
                            className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2"
                          >
                            <Clock className="w-4 h-4" />
                            {card.pendingCount}
                          </motion.div>
                        )}

                        {card.comingSoon && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 15,
                              delay: 0.5,
                            }}
                            className="bg-gradient-to-r from-gray-400 to-gray-500 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg"
                          >
                            Coming Soon
                          </motion.div>
                        )}
                      </div>

                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        {card.title}
                      </h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {card.description}
                      </p>

                      {!card.comingSoon && (
                        <motion.div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium text-gray-700">
                              Ready to review
                            </span>
                          </div>
                          <motion.div
                            variants={arrowVariants}
                            className={`flex items-center gap-2 text-${card.color}-600 font-semibold`}
                          >
                            <span>View</span>
                            <ArrowRight className="w-5 h-5" />
                          </motion.div>
                        </motion.div>
                      )}
                    </div>

                    {!card.comingSoon && (
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${card.hoverGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl -z-10`}
                      />
                    )}
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>

          {!loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-12 bg-white rounded-2xl shadow-lg p-8 border border-gray-200"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Quick Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-500 p-3 rounded-lg">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-gray-900">
                        {pendingEmploymentCount}
                      </div>
                      <div className="text-sm text-gray-600">
                        Personal Pending
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-purple-500 p-3 rounded-lg">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-gray-900">
                        {pendingTravelCount}
                      </div>
                      <div className="text-sm text-gray-600">
                        Travel Pending
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-green-500 p-3 rounded-lg">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-gray-900">
                        {pendingCertificateCount}
                      </div>
                      <div className="text-sm text-gray-600">
                        Certificate Pending
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-amber-500 p-3 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-gray-900">
                        {pendingEmploymentCount +
                          pendingTravelCount +
                          pendingCertificateCount}
                      </div>
                      <div className="text-sm text-gray-600">Total Pending</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-12 bg-white rounded-2xl shadow-lg p-12 text-center"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading document statistics...</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
