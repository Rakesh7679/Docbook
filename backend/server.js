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


//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


/**
 * * @param {express.Request}  req
 * * @param {express.Response} res
 */
function getOrigin(origin, callback) {

    try {
        const _allowedOrigins = process.env.MODE === 'development' ? [
            "http://localhost:3000",
            "http://localhost:5174"
        ] : [
            'https://docbook-admin.vercel.app',
            "https://docbook-frontend.vercel.app",
            "https://docbook-six.vercel.app",
        ];
        console.log("Current MODE:", process.env.MODE);
        console.log("Allowed Origins:", _allowedOrigins);
        console.log("Request Origin:", origin);

        // Allow requests with no origin (mobile apps, curl, Postman, etc.)
        if (!origin) {
            return callback(null, true);
        }

        // Allow origin if it's in the list
        if (_allowedOrigins.includes(origin)) {
            return callback(null, origin);
        }

        // Optionally block unknown origins instead of defaulting to one
        throw new Error('Not allowed by CORS');

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



//api endpoint
app.use('/api/admin', adminRouter)
app.use('/api/doctor', doctorRouter)
app.use('/api/user', userRouter)

// if(process.env.NODE_ENV === 'production'){
//     app.use(express.static(path.join(__dirname, '../frontend/dist')))
//     app.get('*', (req, res) => {
//         res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'))
//     })
// }


//localhost:4000/api/admin/add-doctor

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
