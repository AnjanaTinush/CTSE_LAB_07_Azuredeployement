const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// connect DB
connectDB();

app.use(express.json());
app.use(cors());

// ✅ health
app.get("/health", (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.json({ status: "OK", service: "user-service", dbConnected });
});

// ✅ test route (VERY IMPORTANT)
app.get("/test", (req, res) => {
  res.json({ message: "User service working" });
});

// routes
app.use('/api/users', require('./routes/userRoutes'));

const PORT = process.env.PORT || 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`User service running on port ${PORT}`);
});