// Utility functions for author information display

export function getAuthorDisplayText(
  authorRole: string,
  authorName?: string
): string {
  if (authorRole === "admin") {
    return "By Author";
  } else if (authorRole === "writer" && authorName) {
    return `By ${authorName}`;
  }
  return "By Author";
}

export function formatAuthorName(
  firstName?: string,
  lastName?: string,
  username?: string
): string {
  const fullName = `${firstName || ""} ${lastName || ""}`.trim();
  return fullName || username || "Writer";
}
