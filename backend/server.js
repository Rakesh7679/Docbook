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
const port = process.env.PORT || 4000;

// DB + Cloudinary
connectDB();
connectCloudinary();

<<<<<<< HEAD

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


/**
 * * @param {express.Request}  req
 * * @param {express.Response} res
 */
function getOrigin(origin, callback) {

    try {
        const _allowedOrigins = process.env.MODE ? [
            "http://localhost:3000",
            "http://localhost:5174"
        ] : [
            'https://docbook-admin.vercel.app',
            'https://docbook-frontend.vercel.app'
            
            // Add more allowed origins as needed

        ];
        console.log("Wildcard Origin:", _allowedOrigins);

        // Allow origin if it's in the list
        if (_allowedOrigins.includes(origin)) {
            return callback(null, origin);
        }

        // Optionally block unknown origins instead of defaulting to one
        return callback(new Error('Not allowed by CORS'), false);

    } catch (error) {
        console.error("Error determining origin:", error);
        return callback(null, "http://localhost:3000"); // Safe fallback
    }
}


app.use(
    cors({
        origin: getOrigin,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    })
);

=======
// ✅ CORS (must come BEFORE routes!)
app.use(cors({
  origin: [
    'https://docbook-frontend.vercel.app',
    'https://docbook-admin.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors()); // Handle preflight
>>>>>>> 042a2b6bf51243e35d2be2890f12fcd5a6c875ae

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ API routes
app.use('/api/admin', adminRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/user', userRouter);

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
