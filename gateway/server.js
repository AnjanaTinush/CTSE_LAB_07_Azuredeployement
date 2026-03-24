const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

app.use("/users", createProxyMiddleware({
  target: "http://user-service:3001",
  changeOrigin: true,
}));

app.get("/", (req, res) => {
  res.send("Gateway running");
});

app.listen(3000, () => {
  console.log("Gateway running on port 3000");
});
