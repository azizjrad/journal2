export function validateInput(input: string): boolean {
  if (!input) return true;

  const scriptInjectionPattern = /<script[^>]*>.*?<\/script>/gi;
  const jsEventPattern = /\bon\w+\s*=/i;
  const jsSchemePattern = /^\s*javascript:/i;
  const vbsSchemePattern = /^\s*vbscript:/i;
  const dataUriPattern = /^\s*data:\s*text\/html/i;

  return (
    !scriptInjectionPattern.test(input) &&
    !jsEventPattern.test(input) &&
    !jsSchemePattern.test(input) &&
    !vbsSchemePattern.test(input) &&
    !dataUriPattern.test(input)
  );
}

export function sanitizeInput(input: string): string {
  if (!input) return "";

  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}
