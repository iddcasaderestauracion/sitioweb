/* ==========================================================================
   layout.js — Comportamiento del layout compartido:
   1. Toggle del menú móvil con estado ARIA sincronizado.
   2. Año dinámico en el footer.
   ========================================================================== */

(function () {
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      const isOpen = nav.getAttribute('data-open') === 'true';
      nav.setAttribute('data-open', String(!isOpen));
      toggle.setAttribute('aria-expanded', String(!isOpen));
    });

    // Cierra el menú al navegar (mejora la experiencia en móvil)
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.setAttribute('data-open', 'false');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const yearEl = document.querySelector('[data-current-year]');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
})();
