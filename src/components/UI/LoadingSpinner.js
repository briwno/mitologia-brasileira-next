// src/components/UI/LoadingSpinner.js
"use client";

export default function LoadingSpinner({ size = 'medium', text = '' }) {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`animate-spin rounded-full border-4 border-green-500 border-t-transparent ${sizeClasses[size]}`}>
      </div>
      {text && (
        <p className="mt-3 text-gray-300 text-sm">{text}</p>
      )}
    </div>
  );
}
