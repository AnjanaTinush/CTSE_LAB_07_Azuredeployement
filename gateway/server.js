require("dotenv").config();
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3000;

const defaultCorsOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://ctse-assignment-frontend.vercel.app",
];

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean)
  : defaultCorsOrigins;

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || corsOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
  }),
);

app.use(helmet());
app.use(morgan("dev"));
app.use(globalLimiter);

app.use((req, _res, next) => {
  if (req.headers["x-service-token"]) {
    delete req.headers["x-service-token"];
  }
  next();
});

app.use((req, res, next) => {
  if (req.path.startsWith("/users/internal")) {
    return res.status(404).json({ message: "Not Found" });
  }
  return next();
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "gateway",
    userServiceTarget: process.env.USER_SERVICE_URL || "https://user-service.internal.bravecliff-0709e753.southeastasia.azurecontainerapps.io",
  });
});

const routes = {
  "/users": process.env.USER_SERVICE_URL || "http://localhost:3001",
};

Object.entries(routes).forEach(([path, target]) => {
  app.use(
    path,
    createProxyMiddleware({
      target,
      secure: false,
      changeOrigin: true,
      timeout: 10000,
      proxyTimeout: 10000,
      pathRewrite: {
        "^/users$": "/api/users/",
        "^/users": "/api/users",
      },
      onProxyReq: (_proxyReq, req) => {
        console.log("Proxying:", req.method, req.originalUrl, "->", target);
      },
      onError: (err, req, res) => {
        console.error(`Proxy Error processing ${req.url}:`, err.message);
        res.status(502).json({ message: "Bad Gateway", details: "Service unavailable" });
      },
    }),
  );
});

app.get("/", (_req, res) => {
  res.send("Gateway running 🚀");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

if (require.main === module) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Gateway running on port ${PORT}`);
  });
}

module.exports = app;