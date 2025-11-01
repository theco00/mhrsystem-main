import { Children, isValidElement, ReactElement, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface AnimatedListProps {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
  stagger?: number;
}

/**
 * AnimatedList applies a subtle staggered entrance animation to
 * its direct children, giving lists and card grids a cohesive feel.
 */
export function AnimatedList({
  children,
  className,
  itemClassName,
  stagger = 0.065,
}: AnimatedListProps) {
  const nodes = Children.toArray(children);

  return (
    <div className={cn("flex flex-col gap-3 sm:gap-4", className)}>
      {nodes.map((child, index) => {
        const delay = `${index * stagger}s`;

        if (isValidElement(child)) {
          return (
            <div
              key={(child as ReactElement).key ?? index}
              className={cn(
                "animate-fade-in-up will-change-transform",
                itemClassName,
              )}
              style={{ animationDelay: delay }}
            >
              {child}
            </div>
          );
        }

        return (
          <div
            key={index}
            className={cn(
              "animate-fade-in-up will-change-transform",
              itemClassName,
            )}
            style={{ animationDelay: delay }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}

