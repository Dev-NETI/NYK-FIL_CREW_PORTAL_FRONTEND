"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
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
      console.error("OTP verification error:", err);
      // Always dismiss loading toast first
      toast.dismiss(loadingToast);

      if (err instanceof AxiosError) {
        const errorData = err.response?.data as ApiErrorResponse;
        if (errorData) {
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

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
        <div
          className={`text-center transform transition-all duration-1000 ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="mx-auto flex items-center justify-center mb-6 sm:mb-8">
            <div className="text-center">
              <Image
                src="/nykfil.png"
                alt="Logo"
                width={120}
                height={80}
                className="w-full h-full object-contain sm:w-[150px] sm:h-[100px] md:w-[180px] md:h-[120px] lg:w-[150px] lg:h-[100px]"
              />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
            {showOtpInput ? "Verify Your Identity" : "NYK-FIL CREW PORTAL"}
          </h1>
          <p className="text-gray-600 text-base sm:text-lg md:text-xl lg:text-lg mb-2 sm:mb-4">
            {showOtpInput
              ? "Enter the OTP sent to your email"
              : "Sign in to your account"}
          </p>
          <p className="text-gray-500 text-sm sm:text-base md:text-lg lg:text-base">
            {showOtpInput
              ? "Check your email for a 6-digit verification code"
              : "Enter your email address to receive an OTP"}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mt-12 lg:mt-8 sm:mx-auto sm:w-full sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
        <div
          className={`bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 lg:p-8 border border-gray-100 shadow-lg transform transition-all duration-1000 delay-300 ${
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
                  className="block text-sm sm:text-base lg:text-base font-medium text-gray-700 mb-2 sm:mb-3"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 sm:px-4 md:px-5 lg:px-4 py-3 sm:py-4 md:py-5 lg:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none transition-all duration-300 text-gray-900 placeholder-gray-500 hover:border-gray-300 text-sm sm:text-base md:text-lg lg:text-base"
                  placeholder="Enter your email address"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 sm:py-4 md:py-5 lg:py-3 px-4 sm:px-6 md:px-8 lg:px-4 border border-transparent rounded-lg sm:rounded-xl shadow-lg text-base sm:text-lg md:text-xl lg:text-base font-semibold text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    Sending OTP...
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
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4">
                  <span className="text-2xl">🔐</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Verification Code
                </h3>
                <p className="text-sm text-gray-600">
                  We've sent a 6-digit code to your email
                </p>
                <p className="text-xs text-gray-500">
                  <span className="font-medium text-gray-700">{email}</span>
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
                            index < otp.length ? "bg-gray-900" : "bg-gray-200"
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

        <div
          className={`mt-6 transform transition-all duration-1000 delay-500 ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 lg:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <button className="w-full inline-flex justify-center py-2 sm:py-3 md:py-4 lg:py-3 px-3 sm:px-4 md:px-6 lg:px-4 border border-gray-200 rounded-lg sm:rounded-xl shadow-sm bg-white text-xs sm:text-sm md:text-base lg:text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all duration-300 transform hover:scale-105">
              <span className="mr-1 sm:mr-2 text-base sm:text-lg md:text-xl lg:text-base">
                📱
              </span>
              Phone
            </button>
            <button className="w-full inline-flex justify-center py-2 sm:py-3 md:py-4 lg:py-3 px-3 sm:px-4 md:px-6 lg:px-4 border border-gray-200 rounded-lg sm:rounded-xl shadow-sm bg-white text-xs sm:text-sm md:text-base lg:text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all duration-300 transform hover:scale-105">
              <span className="mr-1 sm:mr-2 text-base sm:text-lg md:text-xl lg:text-base">
                🔐
              </span>
              Biometric
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
