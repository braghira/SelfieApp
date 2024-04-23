const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const readline = require("readline");

// Percorso della root directory del progetto
const rootDirectory = process.cwd();

// Percorsi dei file package.json
const backendPackageJsonPath = path.join(
    rootDirectory,
    "backend",
    "package.json"
);
const selfiePackageJsonPath = path.join(
    rootDirectory,
    "selfie",
    "package.json"
);

// Verifica se esistono i file package.json
if (
    !fs.existsSync(backendPackageJsonPath) ||
    !fs.existsSync(selfiePackageJsonPath)
) {
    console.error("File package.json wasn't found in the specified directory");
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
            console.log(message + ": Updated dependencies");

            // Richiama la callback solo se è definita
            if (callback) {
                callback();
            }
        }
    );
}

function isDisiMachine() {
    let ret_string;
    const hostname = os.hostname()
    console.log('Hostname:', hostname)
    // Il regex corrisponde a nomi di host che sono stringhe esadecimali di 12 caratteri
    const disiRegex = /^[0-9a-f]{12}$/
    
    if (disiRegex.test(hostname)) {
        ret_string = "production"
    }
    else {
        ret_string = "development"
    }

    return ret_string
}

function DevOrProd() {
    const NODE_ENV = isDisiMachine();
    if (NODE_ENV === "production") {
        startProductionMode();
    } else {
        startDevelopmentMode();
    }
}

// Funzione per avviare la modalità di sviluppo
function startDevelopmentMode() {
    console.log(`Development Mode Ready.\n`);
    console.log(`You'll have to start both frontend and backend servers manually. `);
    console.log(`Start backend server by running 'cd backend && npm run dev'`);
    console.log(`Then, open a new terminal and run 'npm run dev' in directory /selfie\n`);
    // exec("npm run dev", { cwd: path.join(__dirname, "backend")});
    // exec("npm run dev", { cwd: path.join(__dirname, "selfie")});
}

// Funzione per avviare la modalità di produzione
function startProductionMode() {
    console.log("Generating Production Build");
    exec(
        "npm run build",
        { cwd: path.join(__dirname, "selfie") },
        (error, stdout, stderr) => {
            if (error) {
                console.error(
                    `Error while creating production build: ${error}`
                );
                return;
            }
            console.log(stdout);
            console.error(stderr);
            console.log("Production Build generation complete.");
        }
    );
}

// Funzione per controllare la versione di Node.js
function startMenu() {
    const nodeVersion = process.version;
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question(
        `Current Node Version: ${nodeVersion}
Suggested Node Version: v20.0.0\n
Are you using the correct Node version? (y/n) `,
        (answer) => {
            if (answer.toLowerCase() === "y") {
                rl.close();
                // Avvia il controllo delle dipendenze e la modalità appropriata
                installDependencies(backendPackageJsonPath, "backend", () => {
                    installDependencies(selfiePackageJsonPath, "selfie app", DevOrProd);
                });
            } else if (answer.toLowerCase() === "n") {
                console.log("\nYou can change Node version with 'nvm use <version>'");
                console.log("\nTerminating script.");
                rl.close();
                process.exit(0);
            } else {
                console.log(
                    "Invalid answer. Please input 'y' for yes or 'n' for no."
                );
                rl.close();
                startMenu();
            }
        }
    );
}

// Avvia il controllo della versione di Node.js
startMenu();
