import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  withBackground?: boolean;
}

/**
 * PageContainer wraps the main content area of a page with
 * subtle animated ambience and spacing that matches the rest
 * of the shadcn design system already in use.
 */
export function PageContainer({
  children,
  className,
  withBackground = true,
}: PageContainerProps) {
  return (
    <section
      className={cn(
        "relative w-full min-h-full",
        withBackground && "ambient-background animate-gradient",
      )}
    >
      {withBackground && (
        <div
          className="pointer-events-none absolute inset-0 ambient-grid hidden opacity-40 lg:block"
          aria-hidden="true"
        />
      )}
      <div
        className={cn(
          "relative mx-auto flex w-full max-w-7xl flex-col",
          "container-mobile spacing-mobile",
          "pb-8 pt-4 sm:pb-12 sm:pt-6 lg:pb-16 lg:pt-8",
          "animate-fade-in-up",
          className,
        )}
      >
        {children}
      </div>
    </section>
  );
}

