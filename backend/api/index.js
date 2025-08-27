// Node Module Imports
import cors from "cors"; // Cross Origin Resource Sharing
import express from "express"; // Express framework
import session from "express-session"; // Session management
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import pg from "pg";
import connectPgSimple from "connect-pg-simple";

// Import routes for the API
import apiRouter from "#apiroutes/api-v1.js";

//Create Constants and setup app
const app = express();
app.use(express.json());
const port = 3000;
const isProd = process.env.ISPROD === "true"; // Check if we are in prod

// Enable CORS if in DEV mode
if (!isProd) {
  app.use(
    cors({
      credentials: true,
      origin: isProd ? process.env.FRONTEND_URL : "http://localhost:5173",
    })
  );
}

// PostgreSQL session store setup
const PgSession = connectPgSimple(session);

const pgPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL, // Prisma/PostgreSQL URL
  ssl: false,
});

// Trust AWS proxy for secure cookies
app.set("trust proxy", 1); // trust first proxy nginx

// Express session middleware
app.use(
  session({
    store: new PgSession({
      pool: pgPool,
      tableName: "user_sessions", // optional, default "session"
      createTableIfMissing: true,
    }),
    name: "sessionId",
    secret: process.env.SESSION_SECRET,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 10, // 5 hours
      secure: isProd ? true : false,
      httpOnly: true,
      sameSite: "lax",
    },
    resave: false,
    saveUninitialized: false,
  })
);

// Serve static files from the React build directory if in prod mode
if (isProd) {
  // Setup for static serving
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  app.use(express.static(path.join(__dirname, "../dist")));

  // Catch-all route to serve index.html for React routing
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../dist", "index.html")); // Adjust 'client/build'
  });
} else {
  // Default path for just server side
  app.get("/", (req, res) => {
    res.send("It works!");
  });
}

// Routes
app.use("/api/v1", apiRouter);

// Tell that the server is starting
app.listen(port, () => {
  // Helpful to have console log here to know that the server is running and give a link
  console.log(`Server Started at http://localhost:${port}`);
});

export default app;
