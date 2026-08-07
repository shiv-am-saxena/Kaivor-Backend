import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import requestLogger from "./libs/requestLogger.js";
import healthRoute from "./routes/health.route.js";
import authRoute from "./routes/auth.route.js";
import { env } from "./config/index.js";
import passport from "./feature/auth/services/passport.js";

const app = express();

app.use(helmet()); // Security headers
app.use(cors({
    origin: env.CORS_ORIGIN, // Allow all origins (you can restrict this in production)
    credentials: true, // Allow cookies to be sent
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed HTTP methods
})); // Enable CORS
app.use(requestLogger); // Log incoming requests
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
app.use(cookieParser()); // Parse cookie headers
app.use(passport.initialize());// Initialize Passport for authentication
app.use("/api", healthRoute); // Mount health check route
app.use("/api/auth", authRoute);
export default app;