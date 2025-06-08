// Importa i moduli necessari
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Carica le variabili d'ambiente dal file .env
dotenv.config();

// Crea un'istanza dell'applicazione Express
const app = express();
const port = process.env.PORT || 3000; // Porta su cui il server ascolterà

const csmPersona = `
Agisci come un Customer Success Manager esperto in Salesforce:
- Traduci le informazioni tecniche in impatti chiari per il cliente.
- Evidenzia opportunità di ottimizzazione, rischio o intervento proattivo.
- Consiglia azioni concrete e prioritarie per massimizzare il valore dell’iniziativa.
- Mantieni il focus su business impact, adozione utente, processi critici e compliance.
\n\n`;


// Configura il middleware CORS
// Questo permette al tuo frontend (che probabilmente gira su un'origine diversa) di fare richieste al backend
// Durante lo sviluppo, puoi permettere tutte le origini (*) ma in produzione dovresti specificare l'origine esatta del tuo frontend
app.use(cors({
    origin: '*', // Permette richieste da qualsiasi origine. Per produzione, cambia in 'http://tuo-dominio.com'
    methods: ['GET', 'POST'], // Permette solo i metodi GET e POST
    allowedHeaders: ['Content-Type'] // Permette solo l'header Content-Type
}));

// Middleware per parsare il corpo delle richieste in formato JSON
app.use(express.json());

// --- Endpoint per l'analisi con Gemini ---
app.post('/analyze-release-update', async (req, res) => {
    console.log('Richiesta ricevuta per /analyze-release-update');
    const updateData = req.body; // I dati dell'aggiornamento inviati dal frontend

    if (!updateData) {
        console.error('Dati di aggiornamento mancanti nella richiesta.');
        return res.status(400).json({ error: 'Dati di aggiornamento mancanti.' });
    }

    // Costruisci il prompt per Gemini
    const prompt = `Analizza il seguente aggiornamento di Salesforce e fornisci un riassunto conciso dei suoi punti chiave, l'impatto potenziale e le azioni consigliate. Formatta la risposta in Markdown per una migliore leggibilità (usa grassetti, elenchi, ecc.).\n\n` +
                    ${csmPersona}+
                   `Nome Aggiornamento: ${updateData['Release Update Name'] || 'N/A'}\n` +
                   `Stato: ${updateData['Status'] || 'N/A'}\n` +
                   `Data Scadenza: ${updateData['Due by Date'] || 'N/A'}\n` +
                   `Badge: ${updateData['Badge'] || 'N/A'}\n` +
                   `Test Run Disponibile: ${updateData['Test Run Avail'] || 'N/A'}\n` +
                   `Dettagli: ${updateData['Detail'] || 'N/A'}\n` +
                   `Applicazione: ${updateData['Enforcement'] || 'N/A'}\n\n` +
                   `Fornisci l'analisi in lingua inglese, effettua anche ricerche online se necessario e riporta ogni link o referenza che analizzi.`;

    console.log('Prompt generato per Gemini:', prompt);

    try {
        //  Inizializza il modello:
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Utilizza un modello che supporti gli strumenti se hai aggiunto la ricerca online al prompt
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-04-17"}); // Se non usi tool

        //  Chiama l'API di Gemini
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log('Risposta da Gemini:', text);
        // Invia la risposta di Gemini al frontend
        res.json({ analysis: text });

    } catch (error) {
        console.error('Errore nella chiamata a Gemini API:', error);
        // Modificato per includere il messaggio di errore specifico nella risposta al frontend
        res.status(500).json({ error: `Errore backend: ${error.message || error.toString() || "Errore sconosciuto durante l'analisi AI."}` });
    }

});

// --- Endpoint per l'analisi dei Proactive Monitoring Alert con Gemini ---
app.post('/analyze-prom-alerts', async (req, res) => {
    console.log('Richiesta ricevuta per /analyze-prom-alerts');
    const alertData = req.body; // I dati degli alert inviati dal frontend

    if (!alertData) {
        console.error('Dati dei Proactive Monitoring Alert mancanti nella richiesta.');
        return res.status(400).json({ error: 'Dati dei Proactive Monitoring Alert mancanti.' });
    }

    // Costruisci il prompt per Gemini
    const prompt = `Analizza i seguenti Proactive Monitoring Alert generati sulla organizzazione Salesforce del mio cliente, e produci un'analisi tecnica ed analitica sulla base di ciò che viene riportato.\n\n` +
    ${csmPersona}+
    `Fornisci l'analisi in lingua inglese, effettua anche ricerche online se necessario e riporta ogni link o referenza che analizzi. Formatta la risposta in Markdown per una migliore leggibilità (usa grassetti, elenchi, ecc.).\n\n${JSON.stringify(alertData, null, 2)}`;

    console.log('Prompt generato per Gemini:', prompt);

    try {
        //  Inizializza il modello:
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Utilizza un modello che supporti gli strumenti se hai aggiunto la ricerca online al prompt
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-04-17"}); // Se non usi tool

        //  Chiama l'API di Gemini
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log('Risposta da Gemini:', text);
        // Invia la risposta di Gemini al frontend
        res.json({ analysis: text });

    } catch (error) {
        console.error('Errore nella chiamata a Gemini API:', error);
        // Modificato per includere il messaggio di errore specifico nella risposta al frontend
        res.status(500).json({ error: `Errore backend: ${error.message || error.toString() || "Errore sconosciuto durante l'analisi AI."}` });
    }

});

// --- Avvia il server ---
app.listen(port, () => {
    console.log(`Server backend in ascolto su http://localhost:${port}`);
    console.log(`Endpoint per l'analisi AI: POST http://localhost:${port}/analyze-release-update`);
    console.log(`Endpoint per l'analisi Proactive Monitoring: POST http://localhost:${port}/analyze-prom-alerts`);
});
