import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import nodemailer from 'nodemailer';

const COURSES = {
  regia: {
    name: 'Regia',
    price: 1500,
    summary: `Il corso di Regia accompagna lo studente nella comprensione del linguaggio cinematografico e del ruolo del regista, dalla nascita dell’idea fino alla realizzazione del film. Le lezioni alternano teoria e pratica, affrontando la costruzione della scena, la direzione degli attori, la scelta delle inquadrature, il lavoro con la troupe, la preparazione del piano di regia e la gestione del set. Durante il percorso lo studente potrà sviluppare e girare un proprio cortometraggio personale, usufruendo dei servizi di location e casting e del noleggio dell’attrezzatura professionale compreso nella quota. Un corso base ma professionale, pensato per trasformare un’idea in un progetto audiovisivo concreto.`
  },
  operatore: {
    name: 'Operatore + Direzione della fotografia',
    price: 1200,
    summary: `Il corso di Operatore e Direzione della Fotografia introduce lo studente all’uso professionale della macchina da presa e alla costruzione dell’immagine cinematografica. Il percorso unisce lezioni teoriche e prove pratiche su inquadratura, esposizione, ottiche, movimenti di camera, composizione, luce, colore e continuità visiva. Gli studenti lavoreranno con strumenti professionali e potranno partecipare come troupe alla realizzazione dei cortometraggi degli studenti di regia, mettendo in pratica sul set le competenze acquisite. Il corso è pensato per chi vuole imparare a raccontare una storia attraverso l’immagine, comprendendo sia il lato tecnico sia quello creativo della fotografia cinematografica.`
  },
  montaggio: {
    name: 'Montaggio',
    price: 1000,
    summary: `Il corso di Montaggio guida lo studente nella costruzione narrativa e ritmica di un prodotto audiovisivo. Attraverso lezioni di teoria e pratica, il percorso affronta il linguaggio del montaggio, la selezione delle riprese, la continuità, il ritmo, il montaggio narrativo, emotivo e sonoro, fino all’organizzazione del materiale e alla finalizzazione del progetto. Gli studenti lavoreranno su software e strumenti professionali, imparando a dare forma al racconto attraverso le immagini. Durante il percorso potranno collaborare alla post-produzione dei cortometraggi realizzati dagli studenti di regia, sperimentando un flusso di lavoro vicino a quello di una vera produzione cinematografica.`
  },
  sceneggiatura: {
    name: 'Sceneggiatura',
    price: 1000,
    summary: `Il corso di Sceneggiatura accompagna lo studente nello sviluppo di un’idea narrativa fino alla costruzione di un soggetto, di una scaletta e di una sceneggiatura cinematografica. Le lezioni alternano teoria, analisi e scrittura pratica, affrontando struttura, personaggi, conflitto, dialoghi, ritmo, genere e costruzione delle scene. Il percorso è pensato per fornire basi solide ma professionali a chi vuole imparare a scrivere per il cinema e l’audiovisivo. Gli studenti potranno confrontarsi con il lavoro di regia e produzione dei cortometraggi, comprendendo come una sceneggiatura diventi un progetto concreto e come la scrittura dialoghi con le esigenze del set, degli attori e della troupe.`
  },
  fonico: {
    name: 'Fonico',
    price: 1000,
    summary: `Il corso di Fonico introduce lo studente al ruolo fondamentale del suono nella produzione audiovisiva. Attraverso lezioni teoriche e attività pratiche, il percorso affronta la presa diretta, l’uso dei microfoni, la gestione dei livelli, il lavoro sul set, la registrazione dei dialoghi, degli ambienti e degli effetti sonori. Gli studenti utilizzeranno strumenti professionali e potranno partecipare come reparto audio alla realizzazione dei cortometraggi degli studenti di regia, imparando a lavorare in coordinamento con regista, operatori e attori. Il corso offre una preparazione base ma concreta, pensata per comprendere quanto il suono contribuisca alla qualità tecnica ed emotiva di un film.`
  },
  colonna_sonora: {
    name: 'Colonna sonora',
    price: 1000,
    summary: `Il corso di Colonne Sonore è dedicato al rapporto tra musica, immagine e racconto cinematografico. Le lezioni alternano teoria, ascolto, analisi e pratica, affrontando il ruolo della musica nel film, il rapporto con le emozioni, il ritmo narrativo, i temi musicali, il commento sonoro e il dialogo con regia e montaggio. Gli studenti potranno lavorare su esempi concreti e confrontarsi con le esigenze dei cortometraggi realizzati durante il percorso, contribuendo alla costruzione dell’identità sonora dei progetti. Il corso è pensato per chi vuole comprendere come una colonna sonora possa rafforzare una scena, guidare lo spettatore e diventare parte essenziale del linguaggio cinematografico.`
  }
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FIXED_PACKAGE_PRICES = {
  4: 3000,
  5: 3500,
  6: 4000
};

const COURSE_PATH_INFO = [
  {
    title: 'Informazioni sul percorso formativo',
    paragraphs: [
      'I corsi SDAC si tengono una volta alla settimana, per un totale di 10 settimane.',
      'Al termine delle 10 lezioni di ciascun corso, inizierà il corso di Produzione, che riunisce gli studenti dei diversi percorsi in lezioni pratiche sul set. Le lezioni di pratica partiranno indicativamente da gennaio/febbraio e avranno una durata di 3 ore, dalle 16:00 alle 19:00.',
      'Dopo le 10 lezioni di Produzione, prenderà avvio la realizzazione dei cortometraggi di fine anno. A partire da maggio, gli studenti di Regia potranno girare i propri cortometraggi, con 3 giorni di ripresa e 2 giorni di montaggio per ciascun progetto.',
      'Gli studenti di Sceneggiatura, Operatore, Montaggio e degli altri corsi potranno partecipare ai set e contribuire alla produzione dei cortometraggi, mettendo in pratica le competenze acquisite durante l\'anno.',
      'Al termine della produzione, i cortometraggi verranno proiettati al cinema in una serata pubblica di fine anno e resteranno di proprietà del regista.',
      'Un esame scritto finale permette il rilascio di un diploma di specializzazione, per ogni corso scelto, con valutazione.',
      'Durante l\'anno accademico la Scuola proporrà diverse proposte lavorative, grazie alla sua affiliazione con il PACC, la GLFC - Genova Liguria Film Commission e il VideoPorto.'
    ]
  }
];

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatEuro(value) {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(value);
}

function normalizePayload(payload) {
  return {
    nome: String(payload?.nome || '').trim(),
    email: String(payload?.email || '').trim().toLowerCase(),
    telefono: String(payload?.telefono || '').trim(),
    preferenza: String(payload?.preferenza || '').trim(),
    messaggio: String(payload?.messaggio || '').trim(),
    website: String(payload?.website || '').trim(),
    privacy: Boolean(payload?.privacy),
    corsi: Array.isArray(payload?.corsi) ? payload.corsi.map(String) : []
  };
}

function buildSelectedCourses(courseKeys) {
  const uniqueCourseKeys = [...new Set(courseKeys)];

  return uniqueCourseKeys.filter((key) => COURSES[key]).map((key) => ({
    key,
    ...COURSES[key]
  }));
}

function calculateQuote(selectedCourses) {
  const courseCount = selectedCourses.length;
  const fullPrice = selectedCourses.reduce((sum, course) => sum + course.price, 0);
  const cheapestCourse = [...selectedCourses].sort((a, b) => a.price - b.price || a.name.localeCompare(b.name))[0];

  if (courseCount === 1) {
    return {
      courseCount,
      fullPrice,
      discountAmount: 0,
      totalPrice: fullPrice,
      discountLabel: 'Nessuno sconto applicato per un singolo corso.'
    };
  }

  if (courseCount === 2) {
    const discountAmount = cheapestCourse.price * 0.5;

    return {
      courseCount,
      fullPrice,
      discountAmount,
      totalPrice: fullPrice - discountAmount,
      discountLabel: `Sconto del 50% sul corso meno caro: ${cheapestCourse.name}.`
    };
  }

  if (courseCount === 3) {
    const discountAmount = cheapestCourse.price;

    return {
      courseCount,
      fullPrice,
      discountAmount,
      totalPrice: fullPrice - discountAmount,
      discountLabel: `Corso meno caro gratuito: ${cheapestCourse.name}.`
    };
  }

  if (FIXED_PACKAGE_PRICES[courseCount]) {
    const totalPrice = FIXED_PACKAGE_PRICES[courseCount];

    return {
      courseCount,
      fullPrice,
      discountAmount: Math.max(fullPrice - totalPrice, 0),
      totalPrice,
      discountLabel: `Pacchetto ${courseCount} corsi a prezzo fisso.`
    };
  }

  return {
    courseCount,
    fullPrice,
    discountAmount: 0,
    totalPrice: fullPrice,
    discountLabel: 'Totale calcolato a prezzo pieno.'
  };
}

function wrapText(text, maxLength = 88) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let currentLine = '';

  words.forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;

    if (nextLine.length > maxLength) {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    } else {
      currentLine = nextLine;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

async function createPdf({ nome, email, telefono, preferenza, messaggio, selectedCourses, quote }) {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595.28, 841.89]);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const marginX = 50;
  const marginBottom = 56;
  const pageTop = 790;
  let y = pageTop;

const footerText = "SDAC - Scuola D'Arte Cinematografica";

function drawFooter(targetPage = page) {
  const footerSize = 8;
  const textWidth = fontRegular.widthOfTextAtSize(footerText, footerSize);
  const pageWidth = targetPage.getWidth();

  targetPage.drawText(footerText, {
    x: (pageWidth - textWidth) / 2,
    y: 26,
    size: footerSize,
    font: fontRegular,
    color: rgb(0.45, 0.45, 0.45)
  });
}

function addPageIfNeeded(requiredSpace = 36) {
  if (y - requiredSpace < marginBottom) {
    drawFooter(page);
    page = pdfDoc.addPage([595.28, 841.89]);
    y = pageTop;
  }
}

  function drawTextLine(text, options = {}) {
    const {
      x = marginX,
      size = 10.5,
      font = fontRegular,
      color = rgb(0.1, 0.1, 0.1),
      lineHeight = 14
    } = options;

    addPageIfNeeded(lineHeight);
    page.drawText(String(text), { x, y, size, font, color });
    y -= lineHeight;
  }

  function drawWrappedText(text, options = {}) {
    const {
      x = marginX,
      size = 10.5,
      font = fontRegular,
      color = rgb(0.25, 0.25, 0.25),
      maxLength = 88,
      lineHeight = 14,
      after = 8
    } = options;

    wrapText(text, maxLength).forEach((line) => {
      drawTextLine(line, { x, size, font, color, lineHeight });
    });

    y -= after;
  }

  function drawSectionTitle(title) {
    y -= 10;
    addPageIfNeeded(34);
    drawTextLine(title, {
      size: 13,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
      lineHeight: 18
    });
  }

  function drawDivider() {
    addPageIfNeeded(22);
    page.drawLine({
      start: { x: marginX, y },
      end: { x: 545, y },
      thickness: 1,
      color: rgb(0.82, 0.82, 0.82)
    });
    y -= 24;
  }

  page.drawText('SDAC - Richiesta informazioni e preventivo', {
    x: marginX,
    y,
    size: 20,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1)
  });

  y -= 24;
  drawTextLine(`Data richiesta: ${new Date().toLocaleString('it-IT')}`, {
    size: 10,
    color: rgb(0.35, 0.35, 0.35),
    lineHeight: 20
  });

  drawSectionTitle('Dati del richiedente');

  [
    `Nome e cognome: ${nome}`,
    `Email: ${email}`,
    `Telefono: ${telefono || 'Non indicato'}`,
    `Preferenza di contatto: ${preferenza || 'Non indicata'}`
  ].forEach((line) => {
    drawTextLine(line, { size: 11, lineHeight: 16 });
  });

  drawSectionTitle('Corsi selezionati');

  selectedCourses.forEach((course) => {
    drawWrappedText(`- ${course.name} - ${formatEuro(course.price)}`, {
      size: 11,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
      maxLength: 76,
      lineHeight: 15,
      after: 1
    });

    drawWrappedText(course.summary, {
      x: marginX + 12,
      size: 10.5,
      maxLength: 84,
      lineHeight: 14,
      after: 7
    });
  });

  drawDivider();

  drawTextLine(`Totale corsi a prezzo pieno: ${formatEuro(quote.fullPrice)}`, {
    size: 12,
    font: fontBold,
    lineHeight: 17
  });

  if (quote.discountAmount > 0) {
    drawWrappedText(`Sconto applicato: ${quote.discountLabel} (-${formatEuro(quote.discountAmount)})`, {
      size: 11,
      color: rgb(0.18, 0.18, 0.18),
      maxLength: 86,
      lineHeight: 15,
      after: 2
    });
  } else {
    drawWrappedText(`Sconto applicato: ${quote.discountLabel}`, {
      size: 11,
      color: rgb(0.18, 0.18, 0.18),
      maxLength: 86,
      lineHeight: 15,
      after: 2
    });
  }

  drawTextLine(`Totale preventivo: ${formatEuro(quote.totalPrice)}`, {
    size: 14,
    font: fontBold,
    lineHeight: 18
  });

  drawSectionTitle('Messaggio del richiedente');
  drawWrappedText(messaggio || 'Nessun messaggio aggiuntivo.', {
    size: 10.5,
    color: rgb(0.12, 0.12, 0.12),
    maxLength: 88,
    lineHeight: 14,
    after: 12
  });

  COURSE_PATH_INFO.forEach((section) => {
    drawSectionTitle(section.title);
    section.paragraphs.forEach((paragraph) => {
      drawWrappedText(paragraph, {
        size: 10.2,
        color: rgb(0.22, 0.22, 0.22),
        maxLength: 91,
        lineHeight: 13.8,
        after: 7
      });
    });
  });

  drawSectionTitle('Nota sul preventivo');
  drawWrappedText(
    'Questo riepilogo ha valore informativo. Eventuali promozioni, agevolazioni o aggiornamenti economici possono essere comunicati successivamente dalla segreteria SDAC.',
    {
      size: 9.7,
      color: rgb(0.35, 0.35, 0.35),
      maxLength: 92,
      lineHeight: 12.5,
      after: 0
    }
  );

  drawFooter(page);

return pdfDoc.save();
}

function buildCourseItemsHtml(selectedCourses) {
  return selectedCourses
    .map(
      (course) => `<li><strong>${escapeHtml(course.name)}</strong> - ${escapeHtml(formatEuro(course.price))}</li>`
    )
    .join('');
}

function buildQuoteHtml(quote) {
  const discountLine = quote.discountAmount > 0
    ? `${escapeHtml(quote.discountLabel)} (-${escapeHtml(formatEuro(quote.discountAmount))})`
    : escapeHtml(quote.discountLabel);

  return `
    <p><strong>Totale a prezzo pieno:</strong> ${escapeHtml(formatEuro(quote.fullPrice))}</p>
    <p><strong>Sconto applicato:</strong> ${discountLine}</p>
    <p><strong>Totale preventivo:</strong> ${escapeHtml(formatEuro(quote.totalPrice))}</p>
  `;
}

function buildSchoolEmailHtml({ nome, email, telefono, preferenza, messaggio, selectedCourses, quote }) {
  return `
    <div style="font-family: Arial, sans-serif; color: #1f1f1f; line-height: 1.6;">
      <h2 style="margin-bottom: 12px;">Nuova richiesta dal form SDAC</h2>
      <p><strong>Nome:</strong> ${escapeHtml(nome)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Telefono:</strong> ${escapeHtml(telefono || 'Non indicato')}</p>
      <p><strong>Preferenza di contatto:</strong> ${escapeHtml(preferenza || 'Non indicata')}</p>
      <p><strong>Corsi selezionati:</strong></p>
      <ul>${buildCourseItemsHtml(selectedCourses)}</ul>
      ${buildQuoteHtml(quote)}
      <p><strong>Messaggio:</strong><br />${escapeHtml(messaggio || 'Nessun messaggio aggiuntivo.').replace(/\n/g, '<br />')}</p>
    </div>
  `;
}

function buildSuccessMessage(emailSentCount) {
  if (emailSentCount === 1) {
    return 'Richiesta inviata correttamente. Il PDF viene scaricato sul dispositivo e la scuola ha ricevuto una copia via email.';
  }

  return "Richiesta preparata, ma l'invio email alla scuola non è andato a buon fine. Riprova tra poco o contatta direttamente la segreteria.";
}

export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        Allow: 'POST, OPTIONS'
      }
    });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ message: 'Metodo non consentito.' }, 405);
  }

  let payload;

  try {
    payload = normalizePayload(await req.json());
  } catch {
    return jsonResponse({ message: 'Dati non validi.' }, 400);
  }

  if (payload.website) {
    return jsonResponse({ message: 'Richiesta ricevuta.' }, 200);
  }

  if (!payload.nome || !payload.email || !payload.privacy) {
    return jsonResponse({ message: 'Compila i campi obbligatori.' }, 400);
  }

  if (!EMAIL_REGEX.test(payload.email)) {
    return jsonResponse({ message: 'Inserisci un indirizzo email valido.' }, 400);
  }

  const selectedCourses = buildSelectedCourses(payload.corsi);

  if (selectedCourses.length === 0) {
    return jsonResponse({ message: 'Seleziona almeno un corso.' }, 400);
  }

  const quote = calculateQuote(selectedCourses);

  try {
    const pdfBytes = await createPdf({
      nome: payload.nome,
      email: payload.email,
      telefono: payload.telefono,
      preferenza: payload.preferenza,
      messaggio: payload.messaggio,
      selectedCourses,
      quote
    });

    const safeName = payload.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'utente';
    const pdfFilename = `sdac-richiesta-${safeName}.pdf`;
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64');

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const schoolEmail = process.env.SDAC_TO_EMAIL || smtpUser;

    if (!smtpUser || !smtpPass || !schoolEmail) {
      return jsonResponse(
        {
          message: "Configurazione email incompleta su Netlify. Controlla SMTP_USER, SMTP_PASS e SDAC_TO_EMAIL.",
          pdfBase64,
          pdfFilename,
          emailSentCount: 0,
          warnings: ['Configurazione SMTP incompleta su Netlify.']
        },
        500
      );
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    let emailSentCount = 0;
    const warnings = [];

    try {
      await transporter.sendMail({
        from: `"SDAC Preventivi" <${smtpUser}>`,
        to: schoolEmail,
        replyTo: payload.email,
        subject: `Nuova richiesta SDAC da ${payload.nome}`,
        html: buildSchoolEmailHtml({
          nome: payload.nome,
          email: payload.email,
          telefono: payload.telefono,
          preferenza: payload.preferenza,
          messaggio: payload.messaggio,
          selectedCourses,
          quote
        }),
        attachments: [
          {
            filename: pdfFilename,
            content: Buffer.from(pdfBytes),
            contentType: 'application/pdf'
          }
        ]
      });

      emailSentCount = 1;
    } catch (emailError) {
      warnings.push(
        emailError instanceof Error
          ? emailError.message
          : "Errore durante l'invio dell'email alla scuola."
      );

      return jsonResponse(
        {
          message: buildSuccessMessage(0),
          pdfBase64,
          pdfFilename,
          emailSentCount,
          warnings
        },
        500
      );
    }

    return jsonResponse({
      message: buildSuccessMessage(emailSentCount),
      pdfBase64,
      pdfFilename,
      emailSentCount,
      warnings
    });
  } catch (error) {
    return jsonResponse(
      {
        message:
          error instanceof Error
            ? error.message
            : 'Invio non riuscito. Riprova tra poco o contatta la scuola direttamente.'
      },
      500
    );
  }
};
