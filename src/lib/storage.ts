// Client-side storage utilities

export function clearAllClientSideData(): void {
  if (typeof window === 'undefined') return;

  try {
    // Clear storages
    try { localStorage.clear(); } catch {}
    try { sessionStorage.clear(); } catch {}

    // Clear all cookies
    try {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        // Expire cookie for current path and root path; common domains
        const expires = 'expires=Thu, 01 Jan 1970 00:00:00 GMT';
        const paths = ['/', window.location.pathname || '/'];
        const domains = [window.location.hostname, `.${window.location.hostname}`];
        for (const p of paths) {
          document.cookie = `${name}=; ${expires}; path=${p}`;
          for (const d of domains) {
            document.cookie = `${name}=; ${expires}; path=${p}; domain=${d}`;
          }
        }
      }
    } catch {}
  } catch {
    // no-op
  }
}
