/* ==========================================================================
   contacto.js — Validación del formulario + resumen de horarios.

   El formulario está conectado a Formspree (https://formspree.io/f/xeeyqdaq),
   que envía cada mensaje directo a igldedioscasaderestauracion@gmail.com.
   Puedes ver el historial de mensajes en tu dashboard de Formspree, en la
   pestaña "Submissions".
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

function renderContactSchedule(data) {
  const list = document.querySelector('[data-contact-schedule]');
  if (!list) return;
  list.innerHTML = '';
  data.servicios.forEach((servicio) => {
    const item = document.createElement('li');
    item.textContent = `${servicio.dia} · ${servicio.hora}`;
    list.appendChild(item);
  });
}

/* --------------------------------------------------------------------------
   VALIDACIÓN DEL FORMULARIO
   -------------------------------------------------------------------------- */

/* Mensajes bilingües: se detecta el idioma de la página vía <html lang="...">
   para que este mismo archivo sirva tanto a /contacto.html como a
   /en/contact.html sin duplicar código. */
const isEnglish = document.documentElement.lang === 'en';

const messages = isEnglish
  ? {
      nameRequired: 'Please enter your name.',
      emailRequired: 'Please enter your email.',
      emailInvalid: 'Enter a valid email address.',
      messageRequired: 'Please write your message.',
      messageShort: 'Tell us a bit more (minimum 10 characters).',
      fixFields: 'Please review the highlighted fields before continuing.',
      success: "Thank you! Your message was sent. We'll get back to you soon.",
      error: "We couldn't send your message. Try again or email us directly.",
      scheduleError: "We couldn't load the schedule.",
      sending: 'Sending…',
      submit: 'Send message',
    }
  : {
      nameRequired: 'Por favor ingresa tu nombre.',
      emailRequired: 'Por favor ingresa tu correo.',
      emailInvalid: 'Ingresa un correo electrónico válido.',
      messageRequired: 'Escribe tu mensaje.',
      messageShort: 'Cuéntanos un poco más (mínimo 10 caracteres).',
      fixFields: 'Revisa los campos marcados antes de continuar.',
      success: '¡Gracias! Tu mensaje fue enviado. Te responderemos pronto.',
      error: 'No pudimos enviar tu mensaje. Intenta de nuevo o escríbenos por correo directamente.',
      scheduleError: 'No pudimos cargar los horarios.',
      sending: 'Enviando…',
      submit: 'Enviar mensaje',
    };

const validators = {
  name(value) {
    if (!value.trim()) return messages.nameRequired;
    return '';
  },
  email(value) {
    if (!value.trim()) return messages.emailRequired;
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!pattern.test(value)) return messages.emailInvalid;
    return '';
  },
  message(value) {
    if (!value.trim()) return messages.messageRequired;
    if (value.trim().length < 10) return messages.messageShort;
    return '';
  },
};

function validateField(field) {
  const validator = validators[field.name];
  if (!validator) return true;

  const errorEl = document.getElementById(`contact-${field.name}-error`);
  const message = validator(field.value);

  if (message) {
    field.classList.add('is-invalid');
    field.setAttribute('aria-invalid', 'true');
    if (errorEl) errorEl.textContent = message;
    return false;
  }

  field.classList.remove('is-invalid');
  field.removeAttribute('aria-invalid');
  if (errorEl) errorEl.textContent = '';
  return true;
}

function setStatus(statusEl, type, message) {
  statusEl.textContent = message;
  statusEl.classList.remove('contact-form__status--success', 'contact-form__status--error');
  if (type) statusEl.classList.add(`contact-form__status--${type}`);
}

/**
 * Envía el formulario a Formspree (https://formspree.io/f/xeeyqdaq).
 * El header "Accept: application/json" es importante: le dice a
 * Formspree que responda con JSON en vez de redirigir a otra página,
 * para que podamos mostrar el mensaje de éxito/error sin recargar.
 */
async function submitForm(formData) {
  const response = await fetch('https://formspree.io/f/xeeyqdaq', {
    method: 'POST',
    body: formData,
    headers: {
      Accept: 'application/json',
    },
  });

  if (response.ok) {
    return { ok: true };
  }
  return { ok: false };
}

function initContactForm() {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;

  const statusEl = form.querySelector('[data-contact-form-status]');
  const fields = form.querySelectorAll('.form-field__input');

  fields.forEach((field) => {
    field.addEventListener('blur', () => validateField(field));
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setStatus(statusEl, null, '');

    let isValid = true;
    fields.forEach((field) => {
      if (!validateField(field)) isValid = false;
    });

    if (!isValid) {
      setStatus(statusEl, 'error', messages.fixFields);
      return;
    }

    const submitButton = form.querySelector('.contact-form__submit');
    submitButton.disabled = true;
    submitButton.textContent = messages.sending;

    try {
      const formData = new FormData(form);
      const result = await submitForm(formData);

      if (result.ok) {
        setStatus(statusEl, 'success', messages.success);
        form.reset();
        fields.forEach((field) => field.classList.remove('is-invalid'));
      } else {
        throw new Error('No se pudo enviar');
      }
    } catch (error) {
      setStatus(statusEl, 'error', messages.error);
      console.error(error);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = messages.submit;
    }
  });
}

async function initContacto() {
  try {
    const data = await getSchedule();
    renderFooterSchedule(data);
    renderContactSchedule(data);
  } catch (error) {
    const list = document.querySelector('[data-contact-schedule]');
    if (list) {
      list.innerHTML = `<li>${messages.scheduleError}</li>`;
    }
    console.error(error);
  }

  initContactForm();
}

document.addEventListener('DOMContentLoaded', initContacto);
