import { getAllChangelogs } from "@/types/changelog";

const STORAGE_KEYS = {
  READ_CHANGELOGS: "vet-changelog-read",
  BANNER_DISMISSED: "vet-changelog-banner-dismissed",
} as const;

/**
 * Check if we're in a browser environment
 */
function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

/**
 * Get array of read changelog IDs from localStorage
 */
export function getReadChangelogs(): string[] {
  if (!isBrowser()) return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.READ_CHANGELOGS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error reading changelog state from localStorage:", error);
    return [];
  }
}

/**
 * Mark a changelog entry as read
 */
export function markChangelogAsRead(changelogId: string): void {
  if (!isBrowser()) return;

  try {
    const readLogs = getReadChangelogs();
    if (!readLogs.includes(changelogId)) {
      readLogs.push(changelogId);
      localStorage.setItem(
        STORAGE_KEYS.READ_CHANGELOGS,
        JSON.stringify(readLogs)
      );
    }
  } catch (error) {
    console.error("Error marking changelog as read:", error);
  }
}

/**
 * Mark multiple changelog entries as read
 */
export function markMultipleAsRead(changelogIds: string[]): void {
  if (!isBrowser()) return;

  try {
    const readLogs = getReadChangelogs();
    const newReadLogs = [...new Set([...readLogs, ...changelogIds])];
    localStorage.setItem(
      STORAGE_KEYS.READ_CHANGELOGS,
      JSON.stringify(newReadLogs)
    );
  } catch (error) {
    console.error("Error marking multiple changelogs as read:", error);
  }
}

/**
 * Check if a specific changelog has been read
 */
export function isChangelogRead(changelogId: string): boolean {
  const readLogs = getReadChangelogs();
  return readLogs.includes(changelogId);
}

/**
 * Get count of unread changelogs
 */
export function getUnreadChangelogsCount(): number {
  if (!isBrowser()) return 0;

  const allChangelogs = getAllChangelogs();
  const readLogs = getReadChangelogs();

  return allChangelogs.filter((log) => !readLogs.includes(log.id)).length;
}

/**
 * Check if there are any unread changelogs
 */
export function hasUnreadChangelogs(): boolean {
  return getUnreadChangelogsCount() > 0;
}

/**
 * Get the ID of the last dismissed banner
 */
export function getLastDismissedBanner(): string | null {
  if (!isBrowser()) return null;

  try {
    return localStorage.getItem(STORAGE_KEYS.BANNER_DISMISSED);
  } catch (error) {
    console.error("Error reading banner dismissal state:", error);
    return null;
  }
}

/**
 * Mark the current banner as dismissed
 */
export function dismissBanner(changelogId: string): void {
  if (!isBrowser()) return;

  try {
    localStorage.setItem(STORAGE_KEYS.BANNER_DISMISSED, changelogId);
    // Also mark the changelog as read
    markChangelogAsRead(changelogId);
  } catch (error) {
    console.error("Error dismissing banner:", error);
  }
}

/**
 * Check if a specific banner has been dismissed
 */
export function isBannerDismissed(changelogId: string): boolean {
  return getLastDismissedBanner() === changelogId;
}

/**
 * Clear all changelog state (useful for testing)
 */
export function clearChangelogState(): void {
  if (!isBrowser()) return;

  try {
    localStorage.removeItem(STORAGE_KEYS.READ_CHANGELOGS);
    localStorage.removeItem(STORAGE_KEYS.BANNER_DISMISSED);
  } catch (error) {
    console.error("Error clearing changelog state:", error);
  }
}

/**
 * Get unread changelogs
 */
export function getUnreadChangelogs() {
  const allChangelogs = getAllChangelogs();
  const readLogs = getReadChangelogs();

  return allChangelogs.filter((log) => !readLogs.includes(log.id));
}

/**
 * Get the latest unread changelog (for banner display)
 */
export function getLatestUnreadChangelog() {
  const unreadLogs = getUnreadChangelogs();
  return unreadLogs.length > 0 ? unreadLogs[0] : null;
}
