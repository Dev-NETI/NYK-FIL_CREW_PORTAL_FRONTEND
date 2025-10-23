"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/services/auth";
import { AxiosError } from "axios";
import { ApiErrorResponse } from "@/types/api";
import toast from "react-hot-toast";
import OTPInput from "@/components/OTPInput";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [sessionToken, setSessionToken] = useState("");
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCooldown]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Show loading toast
    const loadingToast = toast.loading("Sending OTP to your email...", {
      icon: "📧",
    });

    try {
      const response = await AuthService.initiateLogin({ email });

      // Always dismiss loading toast first
      toast.dismiss(loadingToast);

      if (response.success && response.session_token) {
        toast.success("OTP sent to your email! Please check your inbox.", {
          icon: "✅",
          duration: 4000,
        });

        setSessionToken(response.session_token);
        setShowOtpInput(true);
        setCanResend(false);
        setResendCooldown(60); // 60 second cooldown
      } else {
        const errorMessage = response.retry_after
          ? `${response.message} Please wait ${response.retry_after} seconds.`
          : response.message || "Failed to send OTP";

        toast.error(errorMessage, {
          icon: "❌",
          duration: 5000,
        });
      }
    } catch (err) {
      // Always dismiss loading toast first
      toast.dismiss(loadingToast);

      if (err instanceof AxiosError) {
        const errorData = err.response?.data as ApiErrorResponse;
        if (errorData) {
          const errorMessage = errorData.retry_after
            ? `${errorData.message} Please wait ${errorData.retry_after} seconds.`
            : errorData.message || "Failed to send OTP";

          toast.error(errorMessage, {
            icon: "🚫",
            duration: 5000,
          });
        } else {
          toast.error(err.message || "Network error occurred", {
            icon: "🌐",
            duration: 5000,
          });
        }
      } else {
        toast.error("An unexpected error occurred. Please try again.", {
          icon: "⚠️",
          duration: 5000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Show loading toast
    const loadingToast = toast.loading("Verifying OTP...", {
      icon: "🔐",
    });

    try {
      const response = await AuthService.verifyOtp({
        session_token: sessionToken,
        otp: otp,
      });

      // Always dismiss loading toast first
      toast.dismiss(loadingToast);

      if (response.success && response.token && response.user) {
        // Handle successful login through AuthService (includes success toast)
        AuthService.handleLoginSuccess(
          response.token,
          response.user,
          response.redirect_to
        );
      } else {
        let errorMessage = response.message || "Invalid OTP";
        if (response.attempts_remaining !== undefined) {
          errorMessage = `${response.message} (${response.attempts_remaining} attempts remaining)`;
        }
        if (response.retry_after) {
          errorMessage = `${response.message} Please wait ${response.retry_after} seconds.`;
        }

        toast.error(errorMessage, {
          icon: "🔢",
          duration: 5000,
        });
      }
    } catch (err) {
      // console.error("OTP verification error:", err);
      // Always dismiss loading toast first
      toast.dismiss(loadingToast);

      if (err instanceof AxiosError) {
        const errorData = err.response?.data as ApiErrorResponse;
        const statusCode = err.response?.status;

        if (statusCode === 401) {
          // Handle 401 Unauthorized - Invalid OTP
          const errorMessage =
            errorData?.message || "Invalid OTP. Please try again.";
          toast.error(errorMessage, {
            icon: "🔢",
            duration: 5000,
          });
        } else if (errorData) {
          let errorMessage = errorData.message || "Invalid OTP";
          if (errorData.retry_after) {
            errorMessage = `${errorData.message} Please wait ${errorData.retry_after} seconds.`;
          }

          toast.error(errorMessage, {
            icon: "🚫",
            duration: 5000,
          });
        } else {
          toast.error(err.message || "Network error occurred", {
            icon: "🌐",
            duration: 5000,
          });
        }
      } else {
        toast.error("An unexpected error occurred. Please try again.", {
          icon: "⚠️",
          duration: 5000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    setIsLoading(true);

    // Show loading toast
    const loadingToast = toast.loading("Resending OTP...", {
      icon: "🔄",
    });

    try {
      const response = await AuthService.resendOtp({
        session_token: sessionToken,
      });

      // Always dismiss loading toast first
      toast.dismiss(loadingToast);

      if (response.success) {
        toast.success("New OTP sent to your email!", {
          icon: "📬",
          duration: 4000,
        });

        setCanResend(false);
        setResendCooldown(60);
      } else {
        const errorMessage = response.retry_after
          ? `${response.message} Please wait ${response.retry_after} seconds.`
          : response.message || "Failed to resend OTP";

        toast.error(errorMessage, {
          icon: "❌",
          duration: 5000,
        });
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      // Always dismiss loading toast first
      toast.dismiss(loadingToast);

      if (err instanceof AxiosError) {
        const errorData = err.response?.data as ApiErrorResponse;
        if (errorData) {
          const errorMessage = errorData.retry_after
            ? `${errorData.message} Please wait ${errorData.retry_after} seconds.`
            : errorData.message || "Failed to resend OTP";

          toast.error(errorMessage, {
            icon: "🚫",
            duration: 5000,
          });
        } else {
          toast.error(err.message || "Network error occurred", {
            icon: "🌐",
            duration: 5000,
          });
        }
      } else {
        toast.error("An unexpected error occurred. Please try again.", {
          icon: "⚠️",
          duration: 5000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetLogin = () => {
    setShowOtpInput(false);
    setSessionToken("");
    setOtp("");
    setCanResend(false);
    setResendCooldown(0);

    // Dismiss any existing toasts
    toast.dismiss();
  };

  const handleBackToHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-700 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full opacity-10 animate-ping delay-2000"></div>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
        {/* Back Button */}
        <div className="flex justify-start mb-4">
          <button
            onClick={handleBackToHome}
            className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors duration-200 group"
          >
            <span className="text-xl group-hover:transform group-hover:-translate-x-1 transition-transform duration-200">
              ←
            </span>
            <span className="text-sm sm:text-base">Back to Home</span>
          </button>
        </div>

        <div
          className={`text-center transform transition-all duration-1000 ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="mx-auto flex items-center justify-center mb-6 sm:mb-8">
            <div className="text-center  rounded-2xl p-4 ">
              <Image
                src="/nykfil.png"
                alt="Logo"
                width={120}
                height={80}
                className="w-full h-full object-contain sm:w-[150px] sm:h-[100px] md:w-[180px] md:h-[120px] lg:w-[150px] lg:h-[100px]"
              />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-3xl font-bold text-white mb-3 sm:mb-4 drop-shadow-lg">
            {showOtpInput ? "🔐 Verify Your Identity" : "NYK-FIL CREW PORTAL"}
          </h1>
          <p className="text-blue-100 text-base sm:text-lg md:text-xl lg:text-lg mb-2 sm:mb-4 drop-shadow">
            {showOtpInput
              ? "Enter the OTP sent to your email"
              : "Welcome aboard! Sign in to your account"}
          </p>
          <p className="text-blue-200 text-sm sm:text-base md:text-lg lg:text-base drop-shadow">
            {showOtpInput
              ? "Check your email for a 6-digit verification code"
              : "Enter your email address to receive a secure OTP"}
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-8 sm:mt-12 lg:mt-8 sm:mx-auto sm:w-full sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
        <div
          className={`bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 lg:p-8 border border-white/20 shadow-2xl transform transition-all duration-1000 delay-300 ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          {!showOtpInput ? (
            // Email Input Form
            <form
              className="space-y-5 sm:space-y-6 md:space-y-7 lg:space-y-6"
              onSubmit={handleEmailSubmit}
            >
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm sm:text-base lg:text-base font-medium text-black mb-2 sm:mb-3"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 sm:px-4 md:px-5 lg:px-4 py-3 sm:py-4 md:py-5 lg:py-3 border-2 border-blue-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300 text-gray-900 placeholder-gray-400 hover:border-blue-300 text-sm sm:text-base md:text-lg lg:text-base bg-white shadow-sm"
                  placeholder="Enter your email address"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 sm:py-4 md:py-5 lg:py-3 px-4 sm:px-6 md:px-8 lg:px-4 border border-transparent rounded-lg sm:rounded-xl shadow-lg text-base sm:text-lg md:text-xl lg:text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    🚀 Sending OTP...
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Send OTP</span>
                    <span className="text-sm">→</span>
                  </div>
                )}
              </button>
            </form>
          ) : (
            // OTP Verification Form
            <div className="space-y-6 sm:space-y-8">
              {/* OTP Header Section */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full mb-4 animate-pulse">
                  <span className="text-2xl">🔐</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-blue-900">
                  Verification Code
                </h3>
                <p className="text-sm text-black">
                  We&apos;ve sent a 6-digit code to your email
                </p>
                <p className="text-xs text-blue-600">
                  <span className="font-medium text-blue-800">📩 {email}</span>
                </p>
              </div>

              {/* OTP Input Form */}
              <form className="space-y-6" onSubmit={handleOtpSubmit}>
                <div className="space-y-4">
                  <OTPInput
                    length={6}
                    value={otp}
                    onChange={setOtp}
                    disabled={isLoading}
                    autoFocus={true}
                  />

                  {/* Progress indicator */}
                  <div className="flex justify-center">
                    <div className="flex space-x-1">
                      {Array.from({ length: 6 }, (_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-1 rounded-full transition-all duration-300 ${
                            index < otp.length ? "bg-blue-600" : "bg-blue-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    className="w-full flex justify-center py-3 sm:py-4 md:py-5 lg:py-3 px-4 sm:px-6 md:px-8 lg:px-4 border border-transparent rounded-lg sm:rounded-xl shadow-lg text-base sm:text-lg md:text-xl lg:text-base font-semibold text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                        Verifying...
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>Verify & Sign In</span>
                        <span className="text-sm">→</span>
                      </div>
                    )}
                  </button>

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0 pt-2">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={!canResend || isLoading}
                      className="flex items-center justify-center text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <span className="mr-1">🔄</span>
                      {resendCooldown > 0
                        ? `Resend code in ${resendCooldown}s`
                        : "Resend code"}
                    </button>

                    <button
                      type="button"
                      onClick={resetLogin}
                      className="flex items-center justify-center text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
                    >
                      <span className="mr-1">📧</span>
                      Use different email
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
