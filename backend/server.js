import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoute.js';
import doctorRouter from './routes/doctorRoute.js';
import userRouter from './routes/userRoute.js';

dotenv.config();
const app = express();
const port = process.env.PORT || 8000;

// DB + Cloudinary
connectDB();
connectCloudinary();


//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const allowedOrigins = process.env.MODE === 'development' ? [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:5173',
    'http://localhost:5174'
] : [
    'https://docbook-frontend.vercel.app',
    'https://docbook-admin.vercel.app',
    'https://docbook-six.vercel.app'
];

console.log('Current MODE:', process.env.MODE);
console.log('Allowed Origins:', allowedOrigins);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, Postman, etc.)
        if (!origin) {
            return callback(null, true);
        }
        
        // Check if origin is allowed
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        // For production, be more strict
        if (process.env.MODE !== 'development') {
            return callback(new Error('Not allowed by CORS'));
        }
        
        // For development, allow all origins
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'atoken', 'dtoken'],
}));


//api endpoint
app.use('/api/admin', adminRouter)
app.use('/api/doctor', doctorRouter)
app.use('/api/user', userRouter)



app.get('/', (req, res) => {
  res.json({ message: 'API is running...' });
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
