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
    const prompt = `Analizza il seguente aggiornamento di Salesforce (effettua anche ricerche online se necessario) e fornisci un riassunto conciso dei suoi punti chiave, l'impatto potenziale e le azioni consigliate. Formatta la risposta in Markdown per una migliore leggibilità (usa grassetti, elenchi, ecc.).\n\n` +
                   `Nome Aggiornamento: ${updateData['Release Update Name'] || 'N/A'}\n` +
                   `Stato: ${updateData['Status'] || 'N/A'}\n` +
                   `Data Scadenza: ${updateData['Due by Date'] || 'N/A'}\n` +
                   `Badge: ${updateData['Badge'] || 'N/A'}\n` +
                   `Test Run Disponibile: ${updateData['Test Run Avail'] || 'N/A'}\n` +
                   `Dettagli: ${updateData['Detail'] || 'N/A'}\n` +
                   `Applicazione: ${updateData['Enforcement'] || 'N/A'}\n\n` +
                   `Fornisci l'analisi in italiano.`;

    console.log('Prompt generato per Gemini:', prompt);


    //  Inizializza il modello:
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro"}); // O il modello che preferisci
    //  Chiama l'API con un blocco try/catch:
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            console.log('Risposta da Gemini:', text);
            // Invia la risposta di Gemini al frontend
            res.json({ analysis: text });
        } catch (error) {
            console.error('Errore nella chiamata a Gemini API:', error);
            res.status(500).json({ error: 'Errore durante l\'analisi AI.' });
        }

    // --- SEZIONE DI SIMULAZIONE (RIMUOVI QUANDO INTEGRI GEMINI) ---
    // const simulatedResponse = `**Analisi AI per "${updateData['Release Update Name'] || 'Aggiornamento Sconosciuto'}"**\n\n` +
    //                           `* **Punti Chiave:** Questo aggiornamento modifica la gestione di ${updateData['Badge'] || 'alcuni aspetti'}. I dettagli indicano che "${updateData['Detail'].substring(0, 150)}...".\n` +
    //                           `* **Stato e Scadenza:** Attualmente è in stato "${updateData['Status']}" con scadenza il ${updateData['Due by Date'] || 'data non specificata'}.\n` +
    //                           `* **Impatto Potenziale:** L'applicazione automatica è prevista per "${updateData['Enforcement'] || 'data non specificata'}". Potrebbe influenzare ${updateData['Badge'] || 'aree generiche'}.\n` +
    //                           `* **Azioni Consigliate:** Si raccomanda di esaminare i dettagli completi. Test Run Disponibile: ${updateData['Test Run Avail']}. Utilizzare il test run per valutare l'impatto specifico sul proprio ambiente.`;

    //console.log('Risposta simulata:', simulatedResponse);
    // Simula un ritardo di rete
    // setTimeout(() => {
    //     res.json({ analysis: simulatedResponse });
    // }, 1500); // Simula un ritardo di 1.5 secondi
    // --- FINE SEZIONE DI SIMULAZIONE ---

});

// --- Avvia il server ---
app.listen(port, () => {
    console.log(`Server backend in ascolto su http://localhost:${port}`);
    console.log('Endpoint per l\'analisi AI: POST http://localhost:3000/analyze-release-update');
});
