const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Percorso della root directory del progetto
const rootDirectory = process.cwd();

// Percorsi dei file package.json
const backendPackageJsonPath = path.join(rootDirectory, 'backend', 'package.json');
const selfiePackageJsonPath = path.join(rootDirectory, 'selfie', 'package.json');

// Verifica se esistono i file package.json
if (!fs.existsSync(backendPackageJsonPath) || !fs.existsSync(selfiePackageJsonPath)) {
    console.error("I file package.json non sono stati trovati nelle directory specificate.");
    process.exit(1);
}

// Funzione per installare le dipendenze
function installDependencies(packageJsonPath, message) {
    console.log(message);

    // Installa le dipendenze
    exec('npm install', { cwd: path.dirname(packageJsonPath) }, (error, stdout, stderr) => {
        if (error) {
            console.error(`Errore durante l'installazione delle dipendenze: ${error}`);
            return;
        }
        console.log(stdout);
        console.error(stderr);
        console.log("Installazione completata.");
    });
}

// Installa le dipendenze per il backend
installDependencies(backendPackageJsonPath, "Installazione delle dipendenze per il backend...");

// Installa le dipendenze per la selfie app
installDependencies(selfiePackageJsonPath, "Installazione delle dipendenze per la selfie app...");
