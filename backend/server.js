import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import postRoutes from './routes/post.routes.js';
import connectDB from './db/connectMongoDB.js';
import cookieParser from 'cookie-parser';
import { v2 as cloudinary } from 'cloudinary';
dotenv.config();

cloudinary.config({
   cloud_name: process.env.CLOUDINARY_CLOUDNAME,
   api_key:process.env.CLOUDINARY_APIKEY,
   api_secret:process.env.CLOUDINARY_APISECRET,
})

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true})) //x-www-form (to parse from data(urlencoded))

app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

app.listen(PORT, () => {
   console.log('Server is running on port ' + PORT);
   connectDB();
});
