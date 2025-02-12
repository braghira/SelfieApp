const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");

/**
 * Questo script fa uso del nome della macchina host su cui viene eseguito per capire se attivare la modalità
 * SVILUPPO o PRODUZIONE. Se il vostro PC ha uno di questi nomi, rimuovete la stringa dall'array e rilanciate lo
 * script. Se state testando il progetto su una macchina del DISI, accertatevi che sia una di queste o aggiungetela a mano.
 */
const DISImachines = ["amneris", "giuseppe", "gualtiero", "hansel", "morales", "zuniga"];

// Percorso della root directory del progetto
const rootDirectory = process.cwd();

// Versione di node da usare durante lo sviluppo (coincide con quella delle macchine DISI)
const disiVersion = "v20.0.0";

// Percorsi dei file package.json
const serverPackageJsonPath = path.join(
  rootDirectory,
  "server",
  "package.json"
);
const clientPackageJsonPath = path.join(
  rootDirectory,
  "client",
  "package.json"
);

const dotenvFrontendPath = path.join(rootDirectory, "client", ".env");
const dotenvBackendPath = path.join(rootDirectory, "server", ".env");

// Verifica se esistono i file package.json e .env
if (
  !fs.existsSync(serverPackageJsonPath) ||
  !fs.existsSync(clientPackageJsonPath) ||
  !fs.existsSync(dotenvFrontendPath) ||
  !fs.existsSync(dotenvBackendPath)
) {
  console.error(
    "File package.json or .env wasn't found in the specified directory"
  );
  process.exit(1);
}

// Funzione per installare le dipendenze
function installDependencies(packageJsonPath, message, callback) {
  // Installa le dipendenze
  exec(
    "npm install",
    { cwd: path.dirname(packageJsonPath) },
    (error, stdout, stderr) => {
      if (error) {
        console.error(
          `Error during dependency install of ${message}: ${error}`
        );
        return;
      }
      console.log(stdout);
      console.error(stderr);
      console.log(message + ": Installed dependencies\n");

      // Richiama la callback solo se è definita
      if (callback) {
        callback();
      }
    }
  );
}

// Funzione per aggiornare le dipendenze
function updateDependencies(packageJsonPath, message, callback) {
  // Aggiorna le dipendenze
  exec(
    "npm update",
    { cwd: path.dirname(packageJsonPath) },
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error during dependency update of ${message}: ${error}`);
        return;
      }
      console.log(stdout);
      console.error(stderr);
      console.log(message + ": Updated dependencies\n");

      // Richiama la callback solo se è definita
      if (callback) {
        callback();
      }
    }
  );
}

function DevOrProd() {
  if (DISImachines.includes(os.hostname()) || /^fv-az\d{4}-\d{3}$/.test(os.hostname())) {
    startProductionMode();
  } else {
    startDevelopmentMode();
  }
}

// Funzione per avviare la modalità di sviluppo
function startDevelopmentMode() {
  console.log(`Development Mode Ready.\n`);
  console.log(
    `You'll have to start both frontend and server servers manually. `
  );
  console.log(`Start server server by running 'cd server && npm run dev'`);
  console.log(
    `Then, open a new terminal, navigate to the /client directory and run 'npm run dev'\n`
  );
}

// Funzione per avviare la modalità di produzione
function startProductionMode() {
  console.log("Generating Production Build");
  exec(
    "npm run build",
    { cwd: path.join(__dirname, "client") },
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error while creating production build: ${error}`);
        return;
      }
      console.log(stdout);
      console.error(stderr);
      console.log("Production Build generation complete.");
    }
  );
}

// Controlla la versione di Node.js
function startMenu() {
  const nodeVersion = process.version;

  console.log(
    `Make sure your machine hostname isn't in the disi machines list: ${DISImachines}.\nHostname:`,
    os.hostname()
  );
  console.log(`\nCurrent Node Version: ${nodeVersion}`);
  console.log(`Suggested Node Version: ${disiVersion}\n`);

  if (nodeVersion === disiVersion) {
    // Avvia il controllo delle dipendenze e la modalità client appropriata
    console.log("Installing dependencies...");
    installDependencies(serverPackageJsonPath, "server", () => {
      installDependencies(clientPackageJsonPath, "client", DevOrProd)
    });
  } else {
    console.log(`You are using a different Node version.`);
    console.log(`You can change Node version with 'nvm use <version>'\n`);
    console.log(`Terminating script.`);
    process.exit(0);
  }
}

// Avvia lo script
startMenu();
