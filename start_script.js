const { exec } = require('child_process');
const path = require('path');

// Funzione per avviare la modalità di sviluppo
function startDevelopmentMode() {
    console.log("Avvio della modalità di sviluppo per il backend...");
    exec('npm run dev', { cwd: path.join(__dirname, 'backend') });

    console.log("Avvio della modalità di sviluppo per la selfie app...");
    exec('npm run dev', { cwd: path.join(__dirname, 'selfie') });
}

// Funzione per avviare la modalità di produzione
function startProductionMode() {
    console.log("Generazione della build di produzione per la selfie app...");
    exec('npm run build', { cwd: path.join(__dirname, 'selfie') }, (error, stdout, stderr) => {
        if (error) {
            console.error(`Errore durante la generazione della build di produzione: ${error}`);
            return;
        }
        console.log(stdout);
        console.error(stderr);
        console.log("Build di produzione generata con successo per la selfie app.");
    });
}

// Verifica il valore di NODE_ENV e avvia la modalità appropriata
const NODE_ENV = process.env.NODE_ENV;
if (NODE_ENV === 'production') {
    startProductionMode();
} else {
    startDevelopmentMode();
}
