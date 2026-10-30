const ERROR_MESSAGES: Record<string, string> = {
  invalid_json:
    "Something went wrong sending your request. Please try again.",
  invalid_parameter:
    "Some of your details look invalid. Please check the form.",
  validation_error:
    "Some of your details look invalid. Please check the form.",
  upstream_error:
    "The proxy service is having trouble right now. Please try again shortly.",
  internal_error:
    "Something went wrong on our side. Please try again.",
};

export const FALLBACK =
  "Something went wrong. Please try again.";

export function friendlyError(
  code?: string,
  status?: number,
): string {
  if (code && ERROR_MESSAGES[code])
    return ERROR_MESSAGES[code];
  if (status === 429)
    return "Too many requests. Please wait a moment and try again.";
  if (status && status >= 500)
    return "The server had a problem. Please try again.";
  return FALLBACK;
}
