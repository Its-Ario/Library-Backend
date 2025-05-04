const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const dotenv = require('dotenv');
const WebSocketServer = require('./websocketServer');

dotenv.config();

const app = express();
app.use(express.json());

const mainRoutes = require('./Routes/mainRoutes');
const adminRoutes = require('./Routes/adminRoutes');
const authRoutes = require('./Routes/authRoutes');
const bookRoutes = require('./Routes/bookRoutes');
const transactionRoutes = require('./Routes/transactionRoutes');

app.use('/', mainRoutes);
app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/book', bookRoutes);
app.use('/transaction', transactionRoutes);

const server = http.createServer(app);
const wsServer = new WebSocketServer(server);

app.get('/ws-status', (req, res) => {
    res.status(200).json(wsServer.getStatus());
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`🔌 WebSocket server is active on ws://localhost:${PORT}`);
});

process.on('SIGINT', function() {
    console.log('Shutting down server...');
    wsServer.close();
    server.close(() => {
        console.log('HTTP server closed');
        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});