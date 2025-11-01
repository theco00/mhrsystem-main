import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const toastVariants = cva(
  "relative flex items-start gap-3 p-4 rounded-2xl shadow-2xl backdrop-blur-xl border transition-all duration-500 transform-gpu animate-slide-in-right",
  {
    variants: {
      variant: {
        default: "bg-white/95 border-blue-100 text-gray-900 dark:bg-blue-950/95 dark:border-blue-800 dark:text-white",
        success: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-900 dark:from-green-950/90 dark:to-emerald-950/90 dark:border-green-800 dark:text-green-100",
        error: "bg-gradient-to-r from-red-50 to-pink-50 border-red-200 text-red-900 dark:from-red-950/90 dark:to-pink-950/90 dark:border-red-800 dark:text-red-100",
        warning: "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 text-yellow-900 dark:from-yellow-950/90 dark:to-orange-950/90 dark:border-yellow-800 dark:text-yellow-100",
        info: "bg-gradient-to-r from-blue-50 to-sky-50 border-blue-200 text-blue-900 dark:from-blue-950/90 dark:to-sky-950/90 dark:border-blue-800 dark:text-blue-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  default: Info,
};

const iconColorMap = {
  success: "text-green-600 dark:text-green-400",
  error: "text-red-600 dark:text-red-400",
  warning: "text-yellow-600 dark:text-yellow-400",
  info: "text-blue-600 dark:text-blue-400",
  default: "text-blue-600 dark:text-blue-400",
};

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof toastVariants> {
  title: string;
  description?: string;
  onClose?: () => void;
  duration?: number;
  icon?: React.ReactNode;
}

export const ModernToast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = "default", title, description, onClose, duration = 5000, icon, ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true);
    const [progress, setProgress] = React.useState(100);
    
    const Icon = iconMap[variant || "default"];
    const iconColor = iconColorMap[variant || "default"];
    
    React.useEffect(() => {
      if (duration && duration > 0) {
        const interval = setInterval(() => {
          setProgress((prev) => {
            if (prev <= 0) {
              clearInterval(interval);
              setIsVisible(false);
              setTimeout(() => onClose?.(), 300);
              return 0;
            }
            return prev - (100 / (duration / 100));
          });
        }, 100);
        
        return () => clearInterval(interval);
      }
    }, [duration, onClose]);
    
    if (!isVisible) return null;
    
    return (
      <div
        ref={ref}
        className={cn(
          toastVariants({ variant }),
          !isVisible && "animate-slide-out-right opacity-0",
          className
        )}
        {...props}
      >
        {/* Icon */}
        <div className={cn("shrink-0", iconColor)}>
          {icon || <Icon className="h-5 w-5" />}
        </div>
        
        {/* Content */}
        <div className="flex-1 space-y-1">
          <p className="font-semibold text-sm leading-tight">{title}</p>
          {description && (
            <p className="text-xs leading-relaxed opacity-90">{description}</p>
          )}
        </div>
        
        {/* Close button */}
        {onClose && (
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onClose?.(), 300);
            }}
            className="shrink-0 rounded-lg p-1 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Fechar notificação"
          >
            <X className="h-4 w-4 opacity-60 hover:opacity-100 transition-opacity" />
          </button>
        )}
        
        {/* Progress bar */}
        {duration && duration > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-100 ease-linear",
                variant === "success" && "bg-green-500",
                variant === "error" && "bg-red-500",
                variant === "warning" && "bg-yellow-500",
                variant === "info" && "bg-blue-500",
                variant === "default" && "bg-blue-500"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    );
  }
);

ModernToast.displayName = "ModernToast";

// Toast Container para múltiplas notificações
export const ToastContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      <div className="pointer-events-auto">
        {children}
      </div>
    </div>
  );
};

// Hook para usar o sistema de toast
export const useToast = () => {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);
  
  const showToast = React.useCallback((toast: ToastProps) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { ...toast, id }]);
    
    if (toast.duration !== 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => (t as any).id !== id));
      }, toast.duration || 5000);
    }
  }, []);
  
  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => (t as any).id !== id));
  }, []);
  
  return { toasts, showToast, removeToast };
};
