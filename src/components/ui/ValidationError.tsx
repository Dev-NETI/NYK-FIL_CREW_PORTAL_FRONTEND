"use client";

import React from "react";

interface ValidationErrorProps {
  errors: string[] | string;
  className?: string;
}

export default function ValidationError({ errors, className = "" }: ValidationErrorProps) {
  // Handle both string array and single string
  const errorArray = Array.isArray(errors) ? errors : [errors];
  
  // Don't render if no errors
  if (!errorArray || errorArray.length === 0 || (errorArray.length === 1 && !errorArray[0])) {
    return null;
  }

  return (
    <div className={`mt-1 ${className}`}>
      {errorArray.map((error, index) => (
        <p key={index} className="text-sm text-red-600 flex items-center">
          <i className="bi bi-exclamation-circle mr-1 flex-shrink-0"></i>
          <span>{error}</span>
        </p>
      ))}
    </div>
  );
}