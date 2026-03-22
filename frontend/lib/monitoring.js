const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const reportFrontendError = async (error, extra = {}) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    await fetch(`${apiBaseUrl}/monitoring/frontend-error`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        message: error?.message || "Unknown frontend error",
        stack: error?.stack,
        digest: extra.digest,
        source: extra.source || "next-error-boundary",
        path: `${window.location.pathname}${window.location.search}`,
        componentStack: extra.componentStack,
        userAgent: window.navigator.userAgent,
        language: window.navigator.language
      })
    });
  } catch (_reportError) {
    // We avoid throwing again to keep the error boundary stable.
  }
};
