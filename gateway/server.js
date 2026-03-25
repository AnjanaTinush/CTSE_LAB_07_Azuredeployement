const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const userServiceTarget = process.env.USER_SERVICE_URL || "http://user-service:3001";

// health
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "gateway", userServiceTarget });
});

// proxy users
app.use(createProxyMiddleware("/users", {
  target: userServiceTarget,
  secure: false,
  changeOrigin: true,
  pathRewrite: (path) => {
    if (path === "/users") {
      return "/api/users/";
    }
    return path.replace(/^\/users/, "/api/users");
  },

  timeout: 10000,
  proxyTimeout: 5000,

  onError: (err, req, res) => {
    console.error("Proxy Error:", err.message);
    res.status(502).json({
      message: "Proxy failed",
      error: err.message
    });
  },

  onProxyReq: (proxyReq, req, res) => {
    console.log("Proxying:", req.method, req.originalUrl);
  }
}));

// root
app.get("/", (req, res) => {
  res.send("Gateway running 🚀");
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Gateway running on port 3000");
});