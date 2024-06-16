// elenco degli url che hanno il permesso di accedere alle nostre api
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8000",
  "https://site232434.tw.cs.unibo.it",
];

// http://expressjs.com/en/resources/middleware/cors.html
const corsOptions = {
  // può essere chiamata con origin === null in modo da permettere a software di terze parti di accedervi
  // come postman
  origin: (origin, callback) => {
    // cerca l'origine nella lista delle origini autorizzate
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  // sets access control to allow credentials header
  credentials: true,
  // default success status
  optionsSuccesStatus: 200,
};

module.exports = corsOptions;
