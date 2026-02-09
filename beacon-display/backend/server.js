const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const noticeRoutes = require('./routes/noticeRoutes');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (for local uploads fallback)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notices', noticeRoutes(io));

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'KU Notice Board API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      notices: '/api/notices',
      health: '/api/health'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
});

// Also handle errors from express app
app.on('error', (err) => {
  console.error('App error:', err);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

const PORT = process.env.PORT || 5000;

// Start server after database connection
setTimeout(() => {
  const serverInstance = server.listen(PORT, 'localhost', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Socket.io enabled for real-time updates');
  });
  
  serverInstance.on('error', (err) => {
    console.error('Server listen error:', err);
  });
}, 1000);

// Graceful shutdown
// Temporarily disabled to debug shutdown issues
// process.on('SIGINT', () => {
//   console.log('\nShutting down gracefully...');
//   server.close(() => {
//     console.log('Server closed');
//     process.exit(0);
//   });
// });
