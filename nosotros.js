/* ==========================================================================
   nosotros.js — /nosotros no tiene contenido dinámico propio; solo
   reutiliza el resumen de horarios del footer, con la misma función
   de acceso getSchedule() usada en home.js y horarios.js.
   ========================================================================== */

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

async function initNosotros() {
  try {
    const data = await getSchedule();
    renderFooterSchedule(data);
  } catch (error) {
    console.error(error);
  }
}

document.addEventListener('DOMContentLoaded', initNosotros);
