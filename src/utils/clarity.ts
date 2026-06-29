import { isAdminMode } from "./metrics";

declare global {
  interface Window {
    clarity?: ((...args: unknown[]) => void) & { q?: unknown[] };
  }
}

const CLARITY_SCRIPT_ID = "microsoft-clarity-script";
const CLARITY_PROJECT_ID = import.meta.env.VITE_CLARITY_PROJECT_ID;

export function initClarity(): void {
  if (!CLARITY_PROJECT_ID) return;
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (isAdminMode()) return;
  if (window.location.hash === "#backoffice") return;
  if (document.getElementById(CLARITY_SCRIPT_ID)) return;

  window.clarity =
    window.clarity ||
    function clarityQueue(...args: unknown[]) {
      (window.clarity!.q = window.clarity!.q || []).push(args);
    };

  const script = document.createElement("script");
  script.id = CLARITY_SCRIPT_ID;
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}`;

  const firstScript = document.getElementsByTagName("script")[0];
  firstScript.parentNode?.insertBefore(script, firstScript);
}
