"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { X, Sparkles } from "lucide-react";
import {
  getLatestUnreadChangelog,
  dismissBanner,
  isBannerDismissed,
} from "@/lib/changelog-utils";
import { getTypeLabel, formatChangelogDate } from "@/types/changelog";
import type { ChangelogEntry } from "@/types/changelog";

const AUTO_DISMISS_DELAY = 7000; // 7 segundos

export function ChangelogBanner() {
  const [changelog, setChangelog] = useState<ChangelogEntry | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleDismiss = useCallback(() => {
    if (!changelog) return;

    setIsAnimatingOut(true);

    // Esperar a que termine la animación antes de ocultar
    setTimeout(() => {
      dismissBanner(changelog.id);
      setIsVisible(false);
      setIsAnimatingOut(false);
    }, 300);
  }, [changelog]);

  useEffect(() => {
    // Obtener el último changelog no leído
    const latestUnread = getLatestUnreadChangelog();

    // Solo mostrar si hay un changelog no leído y no ha sido descartado
    if (latestUnread && !isBannerDismissed(latestUnread.id)) {
      setChangelog(latestUnread);
      setIsVisible(true);

      // Auto-descartar después del tiempo establecido
      timerRef.current = setTimeout(() => {
        setIsAnimatingOut(true);
        setTimeout(() => {
          dismissBanner(latestUnread.id);
          setIsVisible(false);
          setIsAnimatingOut(false);
        }, 300);
      }, AUTO_DISMISS_DELAY);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  if (!isVisible || !changelog) {
    return null;
  }

  return (
    <div
      className={`
        bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200
        transition-all duration-300 ease-in-out
        ${isAnimatingOut ? "opacity-0 -translate-y-2" : "opacity-100 translate-y-0"}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Icono y Contenido */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 mt-0.5">
              <Sparkles className="h-5 w-5 text-teal-600" aria-hidden="true" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-gray-700 bg-gray-200 px-2 py-0.5 rounded-full">
                  {getTypeLabel(changelog.type)}
                </span>
                <span className="text-xs text-gray-500">
                  v{changelog.version} • {formatChangelogDate(changelog.date)}
                </span>
              </div>

              <p className="text-sm font-semibold text-gray-900 mb-1">
                {changelog.title}
              </p>

              <p className="text-sm text-gray-600 line-clamp-2">
                {changelog.description}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/admin/changelog"
              className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors whitespace-nowrap"
              onClick={() => dismissBanner(changelog.id)}
            >
              Ver todas
            </Link>

            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-md hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-700"
              aria-label="Cerrar notificación"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Progress bar for auto-dismiss */}
      <div className="h-1 bg-gray-200">
        <div
          className="h-full bg-teal-500 transition-all ease-linear"
          style={{
            width: "100%",
            animation: `shrink ${AUTO_DISMISS_DELAY}ms linear`,
          }}
        />
      </div>

      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
