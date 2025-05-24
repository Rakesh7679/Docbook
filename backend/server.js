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


const allowedOrigins = process.env.MODE === 'development' ? [
    'http://localhost:3000',
    'http://localhost:3001', 
] : [
    'https://docbook-frontend.vercel.app',
    'https://docbook-admin.vercel.app',
    'https://docbook-six.vercel.app'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token', 'atoken', 'dtoken', "Cookie"]
}))

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
