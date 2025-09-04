"use client";

import { useRef, useEffect, KeyboardEvent, ChangeEvent } from 'react';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

export default function OTPInput({ 
  length = 6, 
  value, 
  onChange, 
  disabled = false,
  autoFocus = false 
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index: number, inputValue: string) => {
    const newValue = inputValue.replace(/\D/g, ''); // Only allow digits
    if (newValue.length > 1) return; // Only allow single digit

    const otpArray = value.split('');
    otpArray[index] = newValue;
    const newOtpValue = otpArray.join('');

    onChange(newOtpValue);

    // Auto-focus next input
    if (newValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        // If current input is empty and backspace is pressed, focus previous input
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const otpArray = value.split('');
        otpArray[index] = '';
        onChange(otpArray.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === 'Delete') {
      const otpArray = value.split('');
      otpArray[index] = '';
      onChange(otpArray.join(''));
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text');
    const pasteArray = paste.replace(/\D/g, '').split('').slice(0, length);
    
    if (pasteArray.length > 0) {
      const newValue = pasteArray.join('').padEnd(length, '');
      onChange(newValue.slice(0, length));
      
      // Focus the last filled input or next empty input
      const focusIndex = Math.min(pasteArray.length, length - 1);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  return (
    <div className="flex gap-2 sm:gap-3 justify-center">
      {Array.from({ length }, (_, index) => (
        <div
          key={index}
          className={`
            transform transition-all duration-300 ease-out
            ${value[index] ? 'animate-pulse' : ''}
          `}
          style={{
            animationDelay: `${index * 50}ms`,
            animationDuration: '200ms',
            animationIterationCount: '1',
          }}
        >
          <input
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={value[index] || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(index, e.target.value)}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled}
            className={`
              w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-12 lg:h-12
              text-center text-base sm:text-lg md:text-xl lg:text-lg font-bold
              border-2 rounded-xl
              transition-all duration-300 ease-in-out
              focus:outline-none focus:ring-2 focus:ring-offset-2
              ${
                value[index]
                  ? 'border-gray-900 bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 focus:border-gray-900 focus:ring-gray-400 shadow-lg ring-1 ring-gray-100'
                  : 'border-gray-200 bg-white text-gray-700 focus:border-gray-400 focus:ring-gray-300 hover:border-gray-300 hover:shadow-sm'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}
              transform hover:scale-105 focus:scale-105
              placeholder-gray-400
              backdrop-blur-sm
            `}
            placeholder="•"
            autoComplete="one-time-code"
            aria-label={`Digit ${index + 1} of verification code`}
          />
        </div>
      ))}
    </div>
  );
}