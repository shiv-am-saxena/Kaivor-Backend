import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/errorHandler.js";
import requestLogger from "./libs/requestLogger.js";
import healthRoute from "./routes/health.route.js";

const app = express();

app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(requestLogger); // Log incoming requests
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
app.use(cookieParser()); // Parse cookie headers
app.use(errorHandler); // Global error handling middleware
app.use("/api", healthRoute); // Mount health check route

export default app;