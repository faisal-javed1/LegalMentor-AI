"use client"

import { cn } from "@/lib/utils"

// 1. Dots Loading
export function DotsLoading({ className }: { className?: string }) {
  return (
    <div className={cn("flex space-x-1", className)}>
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
    </div>
  )
}

// 2. Pulse Loading
export function PulseLoading({ className }: { className?: string }) {
  return (
    <div className={cn("flex space-x-2", className)}>
      <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
      <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse [animation-delay:0.2s]"></div>
      <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse [animation-delay:0.4s]"></div>
    </div>
  )
}

// 3. Bar Loading
export function BarLoading({ className }: { className?: string }) {
  return (
    <div className={cn("flex space-x-1", className)}>
      <div className="w-1 h-6 bg-blue-600 animate-pulse [animation-delay:-0.4s]"></div>
      <div className="w-1 h-6 bg-blue-600 animate-pulse [animation-delay:-0.2s]"></div>
      <div className="w-1 h-6 bg-blue-600 animate-pulse"></div>
      <div className="w-1 h-6 bg-blue-600 animate-pulse [animation-delay:0.2s]"></div>
      <div className="w-1 h-6 bg-blue-600 animate-pulse [animation-delay:0.4s]"></div>
    </div>
  )
}

// 4. Skeleton Loading
export function SkeletonLoading({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
    </div>
  )
}

// 5. Spinner (Alternative to circle)
export function SpinnerLoading({ className }: { className?: string }) {
  return (
    <div className={cn("animate-spin", className)}>
      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
    </div>
  )
}

// 6. Wave Loading
export function WaveLoading({ className }: { className?: string }) {
  return (
    <div className={cn("flex space-x-1", className)}>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-1 h-8 bg-blue-600 animate-pulse"
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: "1s",
          }}
        ></div>
      ))}
    </div>
  )
}

// 7. Text Loading
export function TextLoading({ text = "Loading", className }: { text?: string; className?: string }) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <span className="text-gray-600">{text}</span>
      <div className="flex space-x-1">
        <div className="w-1 h-1 bg-gray-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-1 h-1 bg-gray-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-1 h-1 bg-gray-600 rounded-full animate-bounce"></div>
      </div>
    </div>
  )
}

// 8. Progress Bar Loading
export function ProgressLoading({ progress = 0, className }: { progress?: number; className?: string }) {
  return (
    <div className={cn("w-full bg-gray-200 rounded-full h-2", className)}>
      <div
        className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  )
}

// 9. Card Skeleton Loading
export function CardSkeletonLoading({ className }: { className?: string }) {
  return (
    <div className={cn("border rounded-lg p-4 space-y-3", className)}>
      <div className="flex space-x-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-3 bg-gray-200 rounded animate-pulse w-4/5"></div>
      </div>
    </div>
  )
}

// 10. Typing Indicator
export function TypingLoading({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center space-x-2 text-gray-500", className)}>
      <span className="text-sm">Typing</span>
      <div className="flex space-x-1">
        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
      </div>
    </div>
  )
}
