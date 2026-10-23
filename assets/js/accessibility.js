(() => {
  const root = document.documentElement;
  const toggle = document.getElementById('accessibility-toggle');
  const panel = document.getElementById('accessibility-panel');
  const close = document.getElementById('accessibility-close');
  const modeToggle = document.getElementById('mode-toggle');
  const scrollToTop = document.querySelector('aside[aria-label="Scroll to Top"]');
  const textSize = document.getElementById('accessibility-text-size');
  const textSizeValue = document.getElementById('accessibility-text-size-value');
  const highContrast = document.getElementById('accessibility-high-contrast');
  const reduceMotion = document.getElementById('accessibility-reduce-motion');
  const backToTop = document.getElementById('back-to-top');
  const backToTopContainer = backToTop?.closest('aside[aria-label="Scroll to Top"]');
  const storageKey = 'oytun-accessibility-settings';
  const defaults = { textSize: 100, highContrast: false, reduceMotion: false };

  const updateBackToTopVisibility = () => {
    if (backToTopContainer && backToTop) {
      const isVisible = window.scrollY > 200;

      if (!isVisible && document.activeElement === backToTop) {
        backToTop.blur();
      }

      backToTopContainer.classList.toggle('is-visible', isVisible);
      backToTopContainer.setAttribute('aria-hidden', String(!isVisible));
      backToTop.tabIndex = isVisible ? 0 : -1;
    }
  };

  updateBackToTopVisibility();
  window.addEventListener('scroll', updateBackToTopVisibility, { passive: true });

  const purgeChirpyCaches = () => {
    if (!('caches' in window)) {
      return Promise.resolve();
    }

    return window.caches.keys().then((cacheNames) => Promise.all(
      cacheNames
        .filter((cacheName) => cacheName.startsWith('chirpy-'))
        .map((cacheName) => window.caches.delete(cacheName))
    )).catch(() => {});
  };

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      const chirpyRegistrations = registrations.filter((registration) => [
        registration.active,
        registration.waiting,
        registration.installing
      ].some((worker) => worker && new URL(worker.scriptURL).pathname.endsWith('/sw.min.js')));

      return Promise.all(chirpyRegistrations.map((registration) => registration.unregister()));
    }).then(purgeChirpyCaches).catch(purgeChirpyCaches);
  } else {
    purgeChirpyCaches();
  }

  if (!toggle || !panel || !close || !textSize || !textSizeValue || !highContrast || !reduceMotion) {
    return;
  }

  const utilityControls = document.getElementById('site-utility-controls');
  if (modeToggle && utilityControls) {
    modeToggle.setAttribute('aria-label', 'Switch light and dark mode');
    const themeControl = modeToggle.closest('.btn-group') || modeToggle;
    utilityControls.insertBefore(themeControl, toggle);
  }

  if (scrollToTop && utilityControls) {
    utilityControls.appendChild(scrollToTop);
  }

  backToTop?.setAttribute('aria-label', 'Scroll to top');

  const readSettings = () => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(storageKey) || '{}');
      const size = Number(saved.textSize);

      return {
        textSize: Number.isFinite(size) ? Math.min(150, Math.max(100, Math.round(size / 10) * 10)) : defaults.textSize,
        highContrast: saved.highContrast === true,
        reduceMotion: saved.reduceMotion === true
      };
    } catch {
      return { ...defaults };
    }
  };

  let settings = readSettings();

  const saveSettings = () => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(settings));
    } catch {
      // Preferences still work for the current page if storage is unavailable.
    }
  };

  const applySettings = () => {
    if (settings.textSize === defaults.textSize) {
      root.style.removeProperty('--accessibility-text-scale');
    } else {
      root.style.setProperty('--accessibility-text-scale', String(settings.textSize / 100));
    }

    root.style.removeProperty('font-size');
    if (settings.highContrast) {
      root.setAttribute('data-high-contrast', 'true');
    } else {
      root.removeAttribute('data-high-contrast');
    }
    if (settings.reduceMotion) {
      root.setAttribute('data-reduce-motion', 'true');
    } else {
      root.removeAttribute('data-reduce-motion');
    }
    textSize.value = String(settings.textSize);
    textSizeValue.value = `${settings.textSize}%`;
    highContrast.checked = settings.highContrast;
    reduceMotion.checked = settings.reduceMotion;
  };

  const setPanelOpen = (isOpen, restoreFocus = true) => {
    panel.hidden = !isOpen;
    toggle.setAttribute('aria-expanded', String(isOpen));

    if (isOpen) {
      textSize.focus();
    } else if (restoreFocus) {
      toggle.focus();
    }
  };

  applySettings();

  toggle.addEventListener('click', () => setPanelOpen(panel.hidden));
  close.addEventListener('click', () => setPanelOpen(false));

  textSize.addEventListener('input', () => {
    settings.textSize = Number(textSize.value);
    applySettings();
    saveSettings();
  });

  document.getElementById('accessibility-text-decrease').addEventListener('click', () => {
    settings.textSize = Math.max(100, settings.textSize - 10);
    applySettings();
    saveSettings();
  });

  document.getElementById('accessibility-text-increase').addEventListener('click', () => {
    settings.textSize = Math.min(150, settings.textSize + 10);
    applySettings();
    saveSettings();
  });

  highContrast.addEventListener('change', () => {
    settings.highContrast = highContrast.checked;
    applySettings();
    saveSettings();
  });

  reduceMotion.addEventListener('change', () => {
    settings.reduceMotion = reduceMotion.checked;
    applySettings();
    saveSettings();
  });

  document.getElementById('accessibility-reset').addEventListener('click', () => {
    settings = { ...defaults };
    applySettings();
    saveSettings();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) {
      setPanelOpen(false);
    }
  });

  document.addEventListener('click', (event) => {
    if (!panel.hidden && !event.target.closest('.accessibility-widget')) {
      setPanelOpen(false, false);
    }
  });
})();
