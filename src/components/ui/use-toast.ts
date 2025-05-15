
// This file just re-exports the hooks/use-toast functions
import { useToast as useToastOriginal, toast as toastOriginal } from "@/hooks/use-toast";

// Re-export the enhanced toast function with its methods
export const useToast = useToastOriginal;
export const toast = toastOriginal;

// Add type declarations for the toast function and its methods
declare module "@/hooks/use-toast" {
  interface ToastOptions {
    description?: React.ReactNode;
    [key: string]: any;
  }

  interface ToastFunction {
    (props: import("@/hooks/use-toast").Toast): {
      id: string;
      dismiss: () => void;
      update: (props: import("@/components/ui/toast").ToastProps & {
        id: string;
        title?: React.ReactNode;
        description?: React.ReactNode;
        action?: import("@/components/ui/toast").ToastActionElement;
      }) => void;
    };
    success(title: string, options?: ToastOptions): ReturnType<typeof toastOriginal>;
    error(title: string, options?: ToastOptions): ReturnType<typeof toastOriginal>;
    warning(title: string, options?: ToastOptions): ReturnType<typeof toastOriginal>;
    info(title: string, options?: ToastOptions): ReturnType<typeof toastOriginal>;
  }
}
