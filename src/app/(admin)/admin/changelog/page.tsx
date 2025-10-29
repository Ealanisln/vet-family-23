"use client";

import { useEffect } from "react";
import { Sparkles, Bug, TrendingUp, Calendar } from "lucide-react";
import {
  getChangelogsByMonth,
  getTypeColor,
  getTypeLabel,
  formatChangelogDate,
  type ChangelogEntry,
  type ChangelogType,
} from "@/types/changelog";
import {
  markMultipleAsRead,
  isChangelogRead,
} from "@/lib/changelog-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function getTypeIcon(type: ChangelogType) {
  switch (type) {
    case "feature":
      return Sparkles;
    case "bugfix":
      return Bug;
    case "improvement":
      return TrendingUp;
    default:
      return Sparkles;
  }
}

function ChangelogCard({ entry }: { entry: ChangelogEntry }) {
  const colors = getTypeColor(entry.type);
  const Icon = getTypeIcon(entry.type);
  const isRead = isChangelogRead(entry.id);

  return (
    <Card
      className={`
        transition-all duration-200
        ${isRead ? "opacity-75" : "border-blue-200 shadow-sm"}
      `}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div
              className={`
                p-2 rounded-lg ${colors.bg}
                flex-shrink-0
              `}
            >
              <Icon className={`h-5 w-5 ${colors.text}`} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`
                    text-xs font-medium px-2 py-1 rounded-full border
                    ${colors.bg} ${colors.text} ${colors.border}
                  `}
                >
                  {getTypeLabel(entry.type)}
                </span>

                {!isRead && (
                  <span className="inline-flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                )}
              </div>

              <CardTitle className="text-lg mb-1">{entry.title}</CardTitle>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>{formatChangelogDate(entry.date)}</span>
                <span className="text-gray-300">•</span>
                <span className="font-medium">v{entry.version}</span>
              </div>
            </div>
          </div>

          {entry.priority === "high" && (
            <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-200 flex-shrink-0">
              Alta Prioridad
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-gray-700 leading-relaxed">{entry.description}</p>
      </CardContent>
    </Card>
  );
}

export default function ChangelogPage() {
  const changelogsByMonth = getChangelogsByMonth();

  useEffect(() => {
    // Mark all changelogs as read when the page is viewed
    const allIds = Object.values(changelogsByMonth)
      .flat()
      .map((log) => log.id);

    if (allIds.length > 0) {
      // Delay marking as read to give user time to see the page
      const timer = setTimeout(() => {
        markMultipleAsRead(allIds);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [changelogsByMonth]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Registro de Cambios
            </h1>
            <p className="text-gray-600">
              Últimas actualizaciones y mejoras del sistema
            </p>
          </div>
        </div>
      </div>

      {/* Changelog entries grouped by month */}
      {Object.keys(changelogsByMonth).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay actualizaciones disponibles</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(changelogsByMonth).map(([month, entries]) => (
            <div key={month}>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 sticky top-0 bg-white py-2 border-b border-gray-200">
                {month.charAt(0).toUpperCase() + month.slice(1)}
              </h2>

              <div className="space-y-4">
                {entries.map((entry) => (
                  <ChangelogCard key={entry.id} entry={entry} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer note */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <p className="text-sm text-gray-500 text-center">
          ¿Tienes sugerencias o encontraste un problema?{" "}
          <a
            href="mailto:support@vetfamily.com"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Contáctanos
          </a>
        </p>
      </div>
    </div>
  );
}
