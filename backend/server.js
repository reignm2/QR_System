require('dotenv').config(); // load .env early
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middlewares
app.use(cors());
app.use(express.json());

// mount API routes under /api so frontend can call /api/...
app.use('/api/auth', require('./routes/auth'));
app.use('/api/employees', require('./routes/employee'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/qr', require('./routes/qr'));
const departmentsRouter = require('./routes/departments');
app.use('/api/departments', departmentsRouter);
app.use('/api/admins', require('./routes/admins'));

// WebSocket listeners
app.set('io', io);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
