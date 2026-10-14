"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastOptions {
  id?: string;
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration: number;
}

type ToastListener = (toast: ToastItem) => void;
const listeners = new Set<ToastListener>();

// Standalone callable toast helper
export const toast = {
  show: (options: ToastOptions | string, type: ToastType = "info"): string => {
    const opts: ToastOptions = typeof options === "string" ? { message: options, type } : options;
    const finalType = opts.type || type || "info";

    let defaultTitle = "Información";
    if (finalType === "success") defaultTitle = "Éxito";
    if (finalType === "error") defaultTitle = "Error";
    if (finalType === "warning") defaultTitle = "Advertencia";

    const item: ToastItem = {
      id: opts.id || `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type: finalType,
      title: opts.title || defaultTitle,
      message: opts.message,
      duration: opts.duration ?? 4000,
    };

    listeners.forEach((listener) => listener(item));
    return item.id;
  },
  success: (message: string, title?: string, duration?: number) =>
    toast.show({ message, title: title || "Éxito", type: "success", duration }),
  error: (message: string, title?: string, duration?: number) =>
    toast.show({ message, title: title || "Error", type: "error", duration }),
  warning: (message: string, title?: string, duration?: number) =>
    toast.show({ message, title: title || "Advertencia", type: "warning", duration }),
  info: (message: string, title?: string, duration?: number) =>
    toast.show({ message, title: title || "Información", type: "info", duration }),
};

interface ToastContextValue {
  showToast: (options: ToastOptions | string, type?: ToastType) => string;
  success: (message: string, title?: string) => string;
  error: (message: string, title?: string) => string;
  warning: (message: string, title?: string) => string;
  info: (message: string, title?: string) => string;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // If used outside provider, fallback to global toast object
    return {
      showToast: toast.show,
      success: toast.success,
      error: toast.error,
      warning: toast.warning,
      info: toast.info,
      removeToast: () => {},
    };
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((item: ToastItem) => {
    setToasts((prev) => [item, ...prev.slice(0, 4)]); // max 5 simultaneous toasts
  }, []);

  useEffect(() => {
    listeners.add(addToast);
    return () => {
      listeners.delete(addToast);
    };
  }, [addToast]);

  const value: ToastContextValue = {
    showToast: toast.show,
    success: toast.success,
    error: toast.error,
    warning: toast.warning,
    info: toast.info,
    removeToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Container de Notificaciones Flotantes */}
      <aside
        aria-label="Notificaciones del sistema"
        className="fixed top-5 right-5 z-[99999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((item) => (
          <ToastCard key={item.id} item={item} onDismiss={() => removeToast(item.id)} />
        ))}
      </aside>
    </ToastContext.Provider>
  );
}

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  useEffect(() => {
    if (item.duration <= 0) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, item.duration);
    return () => clearTimeout(timer);
  }, [item, onDismiss]);

  const config = {
    success: {
      borderColor: "border-emerald-200",
      bgColor: "bg-white",
      badgeColor: "bg-emerald-100 text-emerald-700",
      barColor: "bg-emerald-600",
      titleColor: "text-emerald-950",
      icon: CheckCircle2,
    },
    error: {
      borderColor: "border-rose-200",
      bgColor: "bg-white",
      badgeColor: "bg-rose-100 text-rose-700",
      barColor: "bg-rose-600",
      titleColor: "text-rose-950",
      icon: AlertCircle,
    },
    warning: {
      borderColor: "border-amber-200",
      bgColor: "bg-white",
      badgeColor: "bg-amber-100 text-amber-700",
      barColor: "bg-amber-500",
      titleColor: "text-amber-950",
      icon: AlertTriangle,
    },
    info: {
      borderColor: "border-blue-200",
      bgColor: "bg-white",
      badgeColor: "bg-blue-100 text-blue-700",
      barColor: "bg-blue-600",
      titleColor: "text-blue-950",
      icon: Info,
    },
  }[item.type];

  const IconComponent = config.icon;

  return (
    <div
      role="alert"
      className={`pointer-events-auto relative overflow-hidden rounded-2xl border ${config.borderColor} ${config.bgColor} p-3.5 shadow-xl shadow-slate-900/10 transition-all duration-300 animate-in slide-in-from-top-3 fade-in`}
    >
      <div className="flex items-start gap-3">
        {/* Clean Icon (No emojis) */}
        <div className={`w-8 h-8 rounded-xl ${config.badgeColor} flex items-center justify-center shrink-0 mt-0.5`}>
          <IconComponent className="w-4 h-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-1.5">
            <h4 className={`text-xs font-bold ${config.titleColor} tracking-tight`}>
              {item.title}
            </h4>
          </div>
          <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">
            {item.message}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={onDismiss}
          type="button"
          aria-label="Cerrar notificación"
          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress Bar Animation */}
      {item.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 overflow-hidden">
          <div
            className={`h-full ${config.barColor}`}
            style={{
              animation: `toastProgress ${item.duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
}
