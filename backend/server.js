const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

// Load environment variables
const backendEnvPath = path.join(__dirname, '.env');
const rootEnvPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: fs.existsSync(backendEnvPath) ? backendEnvPath : rootEnvPath });

const app = express();
const frontendDir = path.join(__dirname, '..', 'frontend');

// Middleware
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression({ threshold: 1024 }));

// Serve static frontend files from the separated frontend folder
app.use(express.static(frontendDir, {
  maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0,
  etag: true
}));

// MongoDB Connection
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error('❌ MongoDB configuration error: MONGO_URI environment variable is missing');
} else {
  mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err.message));
}

app.get('/api/health', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const databaseStatus = states[mongoose.connection.readyState] || 'unknown';

  res.status(databaseStatus === 'connected' ? 200 : 503).json({
    status: databaseStatus === 'connected' ? 'healthy' : 'degraded',
    database: databaseStatus,
    mongoConfigured: Boolean(mongoUri),
    jwtSecretConfigured: Boolean(process.env.JWT_SECRET)
  });
});

app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();
  if (!mongoUri) {
    return res.status(503).json({
      message: 'Database is not configured',
      code: 'MONGO_URI_NOT_CONFIGURED'
    });
  }
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database is unavailable',
      code: 'DATABASE_UNAVAILABLE'
    });
  }
  next();
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(frontendDir, 'signup.html'));
});

app.get('/admin-dashboard', (req, res) => {
  res.sendFile(path.join(frontendDir, 'admin-dashboard.html'));
});

app.get('/student-dashboard', (req, res) => {
  res.sendFile(path.join(frontendDir, 'student-dashboard.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(frontendDir, 'dashboard.html'));
});

app.get('/routes', (req, res) => {
  res.sendFile(path.join(frontendDir, 'routes.html'));
});

// API Routes (to be implemented)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/users', require('./routes/users'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/fines', require('./routes/fines'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/colleges', require('./routes/colleges'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/audit-logs', require('./routes/auditLogs'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/academic-years', require('./routes/academicYears'));

// --- External QR Scanner Integration (SSE) ---
const scanClients = new Set();

app.get('/api/scan-stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); 

  scanClients.add(res);

  req.on('close', () => {
    scanClients.delete(res);
  });
});

app.post('/api/external-scan', (req, res) => {
  const { qrData } = req.body;
  if (!qrData) return res.status(400).json({ error: 'No qrData provided' });
  
  scanClients.forEach(client => {
    client.write(`data: ${JSON.stringify({ qrData })}\n\n`);
  });
  
  res.json({ success: true, message: 'Scan forwarded to connected dashboards' });
});
// ---------------------------------------------

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ message: 'Server Error', error: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API Routes Available:`);
  console.log(`   - POST   /api/auth/register`);
  console.log(`   - POST   /api/auth/login`);
  console.log(`   - GET    /api/books`);
  console.log(`   - POST   /api/books (admin)`);
  console.log(`   - GET    /api/users (admin)`);
  console.log(`   - GET    /api/transactions`);
  console.log(`   - GET    /api/fines`);
  console.log(`   - GET    /api/dashboard/stats (admin)`);
  console.log(`   - GET    /api/reviews`);
  console.log(`   - GET    /api/wishlist`);
  console.log(`   - GET    /api/notifications`);
  console.log(`   - GET    /api/requests`);
  console.log(`\n✅ All routes connected and ready!`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close();
  });
});
