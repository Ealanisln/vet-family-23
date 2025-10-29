import changelogsDataRaw from "@/config/changelogs.json";

/**
 * Changelog entry type
 */
export type ChangelogType = "feature" | "bugfix" | "improvement";

/**
 * Priority level for changelog entries
 */
export type ChangelogPriority = "high" | "medium" | "low";

/**
 * Individual changelog entry
 */
export interface ChangelogEntry {
  id: string;
  version: string;
  date: string;
  title: string;
  description: string;
  type: ChangelogType;
  priority: ChangelogPriority;
}

// Type-cast the imported JSON data
const changelogsData = changelogsDataRaw as ChangelogEntry[];

/**
 * Get all changelog entries sorted by date (newest first)
 */
export function getAllChangelogs(): ChangelogEntry[] {
  return [...changelogsData].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/**
 * Get the latest changelog entry
 */
export function getLatestChangelog(): ChangelogEntry | null {
  const changelogs = getAllChangelogs();
  return changelogs.length > 0 ? changelogs[0] : null;
}

/**
 * Get changelog entry by ID
 */
export function getChangelogById(id: string): ChangelogEntry | null {
  return changelogsData.find((log) => log.id === id) || null;
}

/**
 * Get changelogs grouped by month
 */
export function getChangelogsByMonth(): Record<string, ChangelogEntry[]> {
  const changelogs = getAllChangelogs();
  const grouped: Record<string, ChangelogEntry[]> = {};

  changelogs.forEach((log) => {
    const date = new Date(log.date);
    const monthKey = date.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
    });

    if (!grouped[monthKey]) {
      grouped[monthKey] = [];
    }
    grouped[monthKey].push(log);
  });

  return grouped;
}

/**
 * Get type badge colors
 */
export function getTypeColor(type: ChangelogType): {
  bg: string;
  text: string;
  border: string;
} {
  switch (type) {
    case "feature":
      return {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
      };
    case "bugfix":
      return {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
      };
    case "improvement":
      return {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
      };
    default:
      return {
        bg: "bg-gray-50",
        text: "text-gray-700",
        border: "border-gray-200",
      };
  }
}

/**
 * Get type label in Spanish
 */
export function getTypeLabel(type: ChangelogType): string {
  switch (type) {
    case "feature":
      return "Nueva Función";
    case "bugfix":
      return "Corrección";
    case "improvement":
      return "Mejora";
    default:
      return "Actualización";
  }
}

/**
 * Format date for display
 */
export function formatChangelogDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
