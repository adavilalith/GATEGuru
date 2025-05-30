import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { database } from "./database";

const app = express();
console.log("1. App initialized."); // Debug log

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
console.log("2. JSON and URL-encoded parsers added."); // Debug log

app.use((req, res, next) => {
  console.log(`3. Custom logging middleware hit for path: ${req.path}`); // Debug log
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine); // This is your existing logger
    }
  });

  next(); // Continue to next middleware/route
});

(async () => {
  console.log("4. Async IIFE started."); // Debug log
  // Connect to MongoDB before starting the server
  try {
    await database.connect();
    log("MongoDB connection established");
  } catch (error: any) {
    log("Failed to connect to MongoDB:", error);
    process.exit(1);
  }

  console.log("5. About to register routes."); // Debug log
  const server = await registerRoutes(app); // THIS IS WHERE YOUR ROUTES ARE ADDED
  console.log("6. Routes registered."); // Debug log

  // Global error handler - should be after all routes
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("7. Global Error Handler Caught:", err); // Debug log (this should catch errors if Multer passes one)
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    if (res.headersSent) {
      return _next(err);
    }
    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    console.log("8. Setting up Vite for development."); // Debug log
    await setupVite(app, server);
  } else {
    console.log("8. Serving static files."); // Debug log
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`9. Serving on port ${port}`); // Your existing log
    },
  );
})();