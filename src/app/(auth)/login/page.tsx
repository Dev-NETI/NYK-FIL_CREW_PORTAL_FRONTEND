"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
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
            Welcome Back
          </h1>
          <p className="text-gray-600 text-base sm:text-lg md:text-xl lg:text-lg mb-2 sm:mb-4">
            Sign in to your account
          </p>
          <p className="text-gray-500 text-sm sm:text-base md:text-lg lg:text-base">
            Enter your credentials to access your workspace
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mt-12 lg:mt-8 sm:mx-auto sm:w-full sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
        <div
          className={`bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 lg:p-8 border border-gray-100 shadow-lg transform transition-all duration-1000 delay-300 ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <form
            className="space-y-5 sm:space-y-6 md:space-y-7 lg:space-y-6"
            onSubmit={handleSubmit}
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
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm sm:text-base lg:text-base font-medium text-gray-700 mb-2 sm:mb-3"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 sm:px-4 md:px-5 lg:px-4 py-3 sm:py-4 md:py-5 lg:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none transition-all duration-300 text-gray-900 placeholder-gray-500 hover:border-gray-300 text-sm sm:text-base md:text-lg lg:text-base"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 sm:h-5 sm:w-5 lg:h-4 lg:w-4 text-gray-600 focus:ring-gray-400 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm sm:text-base lg:text-sm text-gray-600"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm sm:text-base lg:text-sm">
                <a
                  href="#"
                  className="font-medium text-gray-600 hover:text-gray-800 transition-colors duration-300"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 sm:py-4 md:py-5 lg:py-3 px-4 sm:px-6 md:px-8 lg:px-4 border border-transparent rounded-lg sm:rounded-xl shadow-lg text-base sm:text-lg md:text-xl lg:text-base font-semibold text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>Sign in</span>
                  <span className="text-sm">→</span>
                </div>
              )}
            </button>
          </form>
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

        <p
          className={`mt-8 sm:mt-10 lg:mt-8 text-center text-sm sm:text-base md:text-lg lg:text-sm text-gray-500 transform transition-all duration-1000 delay-700 ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          Don&apos;t have an account?{" "}
          <a
            href="#"
            className="font-medium text-gray-700 hover:text-gray-900 transition-colors duration-300"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
