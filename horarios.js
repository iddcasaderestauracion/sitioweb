/* ==========================================================================
   horarios.js — Contenido dinámico de /horarios y /en/schedule.

   Misma función de acceso getSchedule() que usa home.js (§3.2 del
   documento de especificaciones): una sola fuente de verdad para
   leer data/horarios.json. Si el día de mañana se reemplaza por
   una API o un CMS, solo cambia el interior de esta función.

   Mensajes bilingües: se detecta el idioma vía <html lang="..."> para
   que este mismo archivo sirva tanto a la versión en español como a
   la versión en inglés sin duplicar código.
   ========================================================================== */

const isEnglish = document.documentElement.lang === 'en';

const messages = isEnglish
  ? {
      noneScheduled: 'No services published yet.',
      loadError: "We couldn't load the schedule. Please try again later.",
      caption: 'Regular service schedule, subject to change on special dates.',
      day: 'Day',
      time: 'Time',
      service: 'Service',
      special: 'Special',
    }
  : {
      noneScheduled: 'Aún no hay horarios publicados.',
      loadError: 'No pudimos cargar los horarios. Intenta de nuevo más tarde.',
      caption: 'Horarios regulares de servicio, sujetos a cambios en fechas especiales.',
      day: 'Día',
      time: 'Hora',
      service: 'Servicio',
      special: 'Especial',
    };

async function getSchedule() {
  const response = await fetch('data/horarios.json');
  if (!response.ok) {
    throw new Error('No se pudo cargar el horario');
  }
  return response.json();
}

/**
 * Construye la tabla de horarios completa a partir de data.servicios.
 * Cada <td> incluye data-label para el patrón responsive de horarios.css.
 */
function renderScheduleTable(data) {
  const wrapper = document.querySelector('[data-schedule-status]');
  if (!wrapper) return;

  if (!data.servicios || data.servicios.length === 0) {
    wrapper.innerHTML = `<p class="schedule-table__error">${messages.noneScheduled}</p>`;
    return;
  }

  const rows = data.servicios
    .map((servicio) => {
      const badge = servicio.especial
        ? `<span class="schedule-table__badge">${messages.special}</span>`
        : '';
      return `
        <tr>
          <td class="schedule-table__day-cell" data-label="${messages.day}">${servicio.dia}${badge}</td>
          <td data-label="${messages.time}">${servicio.hora}</td>
          <td data-label="${messages.service}">${servicio.tipo}</td>
        </tr>
      `;
    })
    .join('');

  wrapper.innerHTML = `
    <table class="schedule-table">
      <caption>${messages.caption}</caption>
      <thead>
        <tr>
          <th scope="col">${messages.day}</th>
          <th scope="col">${messages.time}</th>
          <th scope="col">${messages.service}</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
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

async function initHorarios() {
  try {
    const data = await getSchedule();
    renderScheduleTable(data);
    renderFooterSchedule(data);
  } catch (error) {
    const wrapper = document.querySelector('[data-schedule-status]');
    if (wrapper) {
      wrapper.innerHTML = `<p class="schedule-table__error">${messages.loadError}</p>`;
    }
    console.error(error);
  }
}

document.addEventListener('DOMContentLoaded', initHorarios);
