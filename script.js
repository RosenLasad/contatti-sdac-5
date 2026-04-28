const form = document.getElementById('preventivo-form');
const statusBox = document.getElementById('form-status');
const submitButton = document.getElementById('submit-button');
const corsiError = document.getElementById('corsi-error');

if (form) {
  form.addEventListener('submit', handleSubmit);
}

function getSelectedCourses() {
  return Array.from(form.querySelectorAll('input[name="corsi"]:checked')).map(
    (checkbox) => checkbox.value
  );
}

function clearFieldErrors() {
  form.querySelectorAll('.input-error').forEach((element) => {
    element.classList.remove('input-error');
  });

  corsiError.hidden = true;
}

function setStatus(message, type) {
  statusBox.textContent = message;
  statusBox.className = 'form-status';

  if (type) {
    statusBox.classList.add(type === 'success' ? 'is-success' : 'is-error');
  }
}

function downloadPdfFromBase64(base64String, filename) {
  if (!base64String) {
    return;
  }

  const binary = atob(base64String);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  const blob = new Blob([bytes], { type: 'application/pdf' });
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename || 'sdac-riepilogo.pdf';
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 1000);
}

function validateForm() {
  clearFieldErrors();
  let isValid = true;

  const requiredInputs = [
    form.querySelector('#nome'),
    form.querySelector('#email'),
    form.querySelector('#privacy')
  ];

  requiredInputs.forEach((input) => {
    if (!input.checkValidity()) {
      isValid = false;
      input.classList.add('input-error');
    }
  });

  if (getSelectedCourses().length === 0) {
    corsiError.hidden = false;
    isValid = false;
  }

  if (!isValid) {
    setStatus('Controlla i campi obbligatori e riprova.', 'error');
  }

  return isValid;
}

async function handleSubmit(event) {
  event.preventDefault();
  setStatus('', null);

  if (!validateForm()) {
    return;
  }

  const payload = {
    nome: form.nome.value.trim(),
    email: form.email.value.trim(),
    telefono: form.telefono.value.trim(),
    preferenza: form.preferenza.value,
    messaggio: form.messaggio.value.trim(),
    corsi: getSelectedCourses(),
    privacy: form.privacy.checked,
    website: form.website.value.trim()
  };

  submitButton.disabled = true;
  submitButton.textContent = 'Invio in corso...';
  setStatus('Stiamo inviando la tua richiesta...', null);

  try {
    const response = await fetch('/.netlify/functions/send-preventivo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data?.message || 'Si è verificato un errore durante l\'invio.');
    }

    if (data?.pdfBase64) {
      downloadPdfFromBase64(data.pdfBase64, data.pdfFilename);
    }

    setStatus(
      data?.message || 'Richiesta completata correttamente.',
      'success'
    );
    form.reset();
    clearFieldErrors();
  } catch (error) {
    setStatus(
      error.message || 'Invio non riuscito. Riprova tra poco oppure contattaci direttamente.',
      'error'
    );
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Invia richiesta';
  }
}
