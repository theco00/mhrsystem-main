import * as React from "react";

import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(
      "rounded-2xl bg-white/95 backdrop-blur-sm text-card-foreground",
      "border border-blue-100/50 shadow-lg shadow-blue-500/5",
      "transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1",
      "dark:bg-gray-900/95 dark:border-blue-800/30 dark:shadow-blue-400/5",
      "overflow-hidden relative",
      className
    )} 
    {...props} 
  />
));
Card.displayName = "Card";

// Card com efeito glass
const GlassCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(
      "rounded-2xl bg-white/60 backdrop-blur-xl text-card-foreground",
      "border border-white/20 shadow-2xl shadow-blue-500/10",
      "transition-all duration-300 hover:bg-white/70 hover:shadow-blue-500/20",
      "dark:bg-blue-950/40 dark:border-blue-400/20 dark:hover:bg-blue-950/50",
      "overflow-hidden",
      className
    )} 
    {...props} 
  />
));
GlassCard.displayName = "GlassCard";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn(
        "flex flex-col space-y-2",
        "p-5 sm:p-7",
        "border-b border-blue-50 bg-gradient-to-r from-blue-50/50 to-sky-50/50",
        "dark:border-blue-900/50 dark:from-blue-900/20 dark:to-sky-900/20",
        className
      )} 
      {...props} 
    />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 
      ref={ref} 
      className={cn(
        "font-bold leading-tight tracking-tight",
        "text-xl sm:text-2xl",
        "text-gray-900 dark:text-white",
        "bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent",
        "dark:from-blue-400 dark:to-sky-400",
        className
      )} 
      {...props} 
    />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p 
      ref={ref} 
      className={cn(
        "text-gray-600 dark:text-gray-400",
        "text-sm sm:text-base",
        "leading-relaxed",
        className
      )} 
      {...props} 
    />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn(
        "pt-0",
        "p-5 sm:p-7",
        "text-gray-700 dark:text-gray-300",
        className
      )} 
      {...props} 
    />
  ),
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn(
        "flex items-center pt-0",
        "p-5 sm:p-7",
        "border-t border-blue-50 bg-gradient-to-r from-gray-50/50 to-blue-50/30",
        "dark:border-blue-900/50 dark:from-gray-900/50 dark:to-blue-900/20",
        "flex-col gap-3 sm:flex-row sm:gap-4",
        className
      )} 
      {...props} 
    />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, GlassCard, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
