import { useEffect } from 'react';

/**
 * Dynamically updates the browser tab favicon link when specified in site settings
 */
export function useDynamicFavicon(iconUrl?: string | null) {
  useEffect(() => {
    if (!iconUrl) return;

    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }

    if (link.getAttribute('href') !== iconUrl) {
      link.href = iconUrl;
      if (iconUrl.endsWith('.png')) {
        link.type = 'image/png';
      } else if (iconUrl.endsWith('.svg')) {
        link.type = 'image/svg+xml';
      } else if (iconUrl.endsWith('.ico')) {
        link.type = 'image/x-icon';
      }
    }

    const appleLink = document.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");
    if (appleLink && appleLink.getAttribute('href') !== iconUrl) {
      appleLink.href = iconUrl;
    }
  }, [iconUrl]);
}
