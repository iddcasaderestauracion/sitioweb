/* ==========================================================================
   home.js — Contenido dinámico del Home.

   Regla de arquitectura (§3.2 del documento de especificaciones):
   todo contenido dinámico vive en /data y se consume mediante UNA
   función de acceso única. Cuando llegue un CMS o API, solo se
   reemplaza getSchedule(); ningún componente cambia.
   ========================================================================== */

/**
 * Fuente única de acceso a los datos de horarios.
 * Hoy lee un archivo estático; mañana puede apuntar a una API
 * sin que ServiceHighlight ni el Footer se enteren del cambio.
 */
/* Mensajes bilingües: se detecta el idioma vía <html lang="..."> para que
   este mismo archivo sirva tanto al Home en español como al de inglés. */
const isEnglish = document.documentElement.lang === 'en';
const messages = isEnglish
  ? { none: 'No services published yet.', error: "We couldn't load the schedule. Please try again later." }
  : { none: 'Aún no hay horarios publicados.', error: 'No pudimos cargar el horario. Intenta de nuevo más tarde.' };

async function getSchedule() {
  const response = await fetch('data/horarios.json');
  if (!response.ok) {
    throw new Error('No se pudo cargar el horario');
  }
  return response.json();
}

function renderServiceHighlight(data) {
  const card = document.querySelector('[data-service-highlight]');
  const template = document.getElementById('service-highlight-template');
  if (!card || !template) return;

  const destacado = data.servicios.find(
    (servicio) => servicio.id === data.proximoDestacado
  ) || data.servicios[0];

  if (!destacado) {
    card.innerHTML = `<p class="service-highlight__error">${messages.none}</p>`;
    return;
  }

  const fragment = template.content.cloneNode(true);
  fragment.querySelector('.service-highlight__day').textContent = destacado.dia;
  fragment.querySelector('.service-highlight__meta').textContent =
    `${destacado.hora} · ${destacado.tipo}`;

  card.innerHTML = '';
  card.appendChild(fragment);
}

function renderFooterSchedule(data) {
  const list = document.querySelector('[data-footer-schedule]');
  if (!list) return;

  list.innerHTML = '';
  data.servicios.forEach((servicio) => {
    const item = document.createElement('li');
    item.textContent = `${servicio.dia} — ${servicio.hora}`;
    list.appendChild(item);
  });
}

async function initHome() {
  try {
    const data = await getSchedule();
    renderServiceHighlight(data);
    renderFooterSchedule(data);
  } catch (error) {
    const card = document.querySelector('[data-service-highlight]');
    if (card) {
      card.innerHTML = `<p class="service-highlight__error">${messages.error}</p>`;
    }
    console.error(error);
  }
}

document.addEventListener('DOMContentLoaded', initHome);
