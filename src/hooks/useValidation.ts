import { useMemo } from "react";

export interface ValidationHookProps {
  validationErrors: Record<string, string[]>;
}

export function useValidation({ validationErrors }: ValidationHookProps) {
  // Utility function to get validation error for a field
  const getValidationError = (fieldPath: string): string[] => {
    return validationErrors[fieldPath] || [];
  };

  // Utility function to check if a field has validation errors
  const hasValidationError = (fieldPath: string): boolean => {
    return getValidationError(fieldPath).length > 0;
  };

  // Memoize the functions to prevent unnecessary re-renders
  return useMemo(() => ({
    getValidationError,
    hasValidationError,
  }), [validationErrors]);
}