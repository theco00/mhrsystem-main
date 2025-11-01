import { ReactNode } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type BreadcrumbEntry = {
  label: string;
  href?: string;
};

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  badge?: ReactNode;
  metadata?: ReactNode;
  breadcrumbs?: BreadcrumbEntry[];
}

export function PageHeader({
  title,
  description,
  actions,
  className,
  badge,
  metadata,
  breadcrumbs,
}: PageHeaderProps) {
  const hasBreadcrumbs = breadcrumbs && breadcrumbs.length > 0;

  return (
    <header
      className={cn(
        "glass-card relative overflow-hidden rounded-3xl border p-6 shadow-soft sm:p-8",
        "animate-fade-in-up",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10"
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-4">
        {hasBreadcrumbs ? (
          <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs?.map((crumb, index) => {
                  const isLast = index === breadcrumbs.length - 1;
                  return (
                    <BreadcrumbItem key={`${crumb.label}-${index}`}>
                      {crumb.href && !isLast ? (
                        <>
                          <BreadcrumbLink href={crumb.href}>
                            {crumb.label}
                          </BreadcrumbLink>
                          <BreadcrumbSeparator />
                        </>
                      ) : (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
            {metadata ? (
              <div className="text-muted-foreground">{metadata}</div>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-2">
            {badge ? <div>{badge}</div> : null}
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h1>
            {description ? (
              <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                {description}
              </p>
            ) : null}
          </div>

          {actions ? (
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              {actions}
            </div>
          ) : null}
        </div>
      </div>

      {metadata && !hasBreadcrumbs ? (
        <div className="mt-4 text-sm text-muted-foreground">{metadata}</div>
      ) : null}

      <Separator className="mt-6 opacity-60" />
    </header>
  );
}

