/* ==========================================================================
   eventos.js — Contenido dinámico de /eventos y /en/events.

   Mismo patrón de arquitectura que horarios.js: una función de acceso
   única a los datos, para que agregar un evento nuevo sea solo editar
   un archivo JSON, nunca tocar HTML.

   Para agregar fotos de un evento: sube las imágenes a assets/eventos/
   y agrega sus rutas al arreglo "fotos" de ese evento en eventos.json,
   por ejemplo: "fotos": ["assets/eventos/dia-familiar-1.jpg", "..."]
   ========================================================================== */

const isEnglish = document.documentElement.lang === 'en';

const messages = isEnglish
  ? {
      loadError: "We couldn't load the events. Please try again later.",
      noEvents: 'No events published yet. Check back soon!',
      photosComingSoon: 'Photos coming soon after the event.',
      viewPhoto: 'View photo',
    }
  : {
      loadError: 'No pudimos cargar los eventos. Intenta de nuevo más tarde.',
      noEvents: 'Aún no hay eventos publicados. ¡Vuelve pronto!',
      photosComingSoon: 'Fotos disponibles después del evento.',
      viewPhoto: 'Ver foto',
    };

async function getEvents() {
  const response = await fetch('data/eventos.json');
  if (!response.ok) {
    throw new Error('No se pudieron cargar los eventos');
  }
  return response.json();
}

async function getSchedule() {
  const response = await fetch('data/horarios.json');
  if (!response.ok) {
    throw new Error('No se pudo cargar el horario');
  }
  return response.json();
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

function renderPhotoGrid(fotos) {
  if (!fotos || fotos.length === 0) {
    return `<p class="event-card__photos-empty">${messages.photosComingSoon}</p>`;
  }

  const thumbs = fotos
    .map(
      (src, index) => `
        <a class="event-card__photo" href="${src}" target="_blank" rel="noopener">
          <img src="${src}" alt="${messages.viewPhoto} ${index + 1}" loading="lazy">
        </a>
      `
    )
    .join('');

  return `<div class="event-card__photo-grid">${thumbs}</div>`;
}

function renderEvents(data) {
  const wrapper = document.querySelector('[data-events-list]');
  if (!wrapper) return;

  if (!data.eventos || data.eventos.length === 0) {
    wrapper.innerHTML = `<p class="events-empty">${messages.noEvents}</p>`;
    return;
  }

  wrapper.innerHTML = data.eventos
    .map(
      (evento) => `
        <article class="event-card">
          <div class="event-card__header">
            <p class="event-card__date">${evento.fechaDisplay}</p>
            <h2 class="event-card__title">${evento.titulo}</h2>
            <p class="event-card__meta">${evento.hora} · ${evento.lugar}</p>
          </div>
          <p class="event-card__description">${evento.descripcion}</p>
          ${renderPhotoGrid(evento.fotos)}
        </article>
      `
    )
    .join('');
}

async function initEventos() {
  try {
    const data = await getEvents();
    renderEvents(data);
  } catch (error) {
    const wrapper = document.querySelector('[data-events-list]');
    if (wrapper) {
      wrapper.innerHTML = `<p class="events-empty">${messages.loadError}</p>`;
    }
    console.error(error);
  }

  try {
    const scheduleData = await getSchedule();
    renderFooterSchedule(scheduleData);
  } catch (error) {
    console.error(error);
  }
}

document.addEventListener('DOMContentLoaded', initEventos);
