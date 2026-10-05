import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';

import adminRouter from './routes/adminRoute.js';
import doctorRouter from './routes/doctorRoute.js';
import userRouter from './routes/userRoute.js';
import consultationRouter from './routes/consultationRoutes.js';
import prescriptionRouter from './routes/prescriptionRoutes.js';
import aiRouter from './routes/aiRoutes.js';
import appointmentRouter from './routes/appointmentRoutes.js';

import { setupConsultationSocket } from './socket/consultationSocket.js';

dotenv.config();
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 8000;

// DB + Cloudinary
connectDB();
connectCloudinary();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
    'http://127.0.0.1:3003',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://192.168.1.9:3000',
    'http://192.168.1.9:5173',
    'http://192.168.1.9:5174',
    'https://docbook-frontend.vercel.app',
    'https://docbook-admin.vercel.app',
    'https://docbook-six.vercel.app'
];

console.log('Current MODE:', process.env.MODE);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        
        // Allow any vercel deployment (*.vercel.app)
        if (origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }

        // In development mode, allow any local/network origin
        if (process.env.MODE === 'development' || !process.env.MODE) {
            if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1') || origin.startsWith('http://192.168.')) {
                return callback(null, true);
            }
        }
        return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'atoken', 'dtoken', 'token', 'aToken', 'dToken'],
}));

// Initialize Socket.IO with CORS
const io = new SocketIOServer(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
setupConsultationSocket(io);

// api endpoints
app.use('/api/admin', adminRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/user', userRouter);
app.use('/api/consultation', consultationRouter);
app.use('/api/prescription', prescriptionRouter);
app.use('/api/ai', aiRouter);
app.use('/api/appointment', appointmentRouter);

app.get('/', (req, res) => {
  res.json({ message: 'DocBook API with WebRTC & AI Assistant is running...' });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

