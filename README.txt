SETUP RAPIDO - VERSIONE GMAIL SMTP / NODEMAILER

Questa versione NON usa piu Resend.
La Netlify Function genera il PDF e invia una sola email alla scuola SDAC, con il PDF allegato.
L'utente non riceve piu l'email automatica, ma scarica comunque il PDF dal sito.

1) Carica il progetto aggiornato su Netlify.
2) In Netlify vai in:
   Site configuration > Environment variables
3) Aggiungi queste variabili:
   - SMTP_USER=comunicazione.sdac@gmail.com
   - SMTP_PASS=password-per-app-google-a-16-caratteri
   - SDAC_TO_EMAIL=comunicazione.sdac@gmail.com
4) Rimuovi le vecchie variabili Resend, se presenti:
   - RESEND_API_KEY
   - FROM_EMAIL
5) Su Google/Gmail devi creare una password per app per comunicazione.sdac@gmail.com.
   Serve la verifica in due passaggi attiva sull'account Google.
6) Dopo aver salvato le variabili su Netlify, fai un nuovo deploy.
7) Prova il form online e verifica che arrivi una mail a comunicazione.sdac@gmail.com con il PDF allegato.

NOTE IMPORTANTI
- I prezzi e i testi del preventivo sono dentro: netlify/functions/send-preventivo.js
- Il link privacy va sostituito in index.html, se non e ancora definitivo.
- L'email inviata alla scuola ha reply-to impostato sull'email dell'utente: rispondendo alla mail, SDAC dovrebbe scrivere direttamente al richiedente.
- Non serve piu configurare DNS o dominio mittente su Resend.

TEST LOCALE
- npm install
- npx netlify dev
