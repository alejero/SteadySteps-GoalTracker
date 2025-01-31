require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

const app = express();

// Middleware
app.use(bodyParser.json());

// CORS setup
app.use(cors({
    origin: ["http://localhost:5500", "https://alejero.github.io"], // Allow only these domains to make requests
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
    credentials: true, // Allow sending cookies & authorization headers
  }));

// Explicitly allow OPTIONS for preflight requests
app.options("*", cors()); 

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected!'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));