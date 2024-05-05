import express from "express";
import bodyParser from "body-parser";
import mongoDb, { Db, MongoClient } from "mongodb"
import mongoose, { mongo } from "mongoose";
import cors from "cors";  
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import { register } from "./controllers/auth.js";
import { createPost } from "./controllers/posts.js";
import { verifyToken } from "./middleware/auth.js";
import User from "./models/User.js";
import Post from "./models/Post.js";
import { users, posts } from "./data/index.js";
import { error } from "console";
import { env } from "process";
import {google} from 'googleapis'
import stream from "stream"
/* CONFIGURATIONS */


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://students-hub.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, "public/assets")));


// this is new file upload on drive system

const upload  =multer();

// Allow requests from a specific origin
const corsOptions = {
  origin: 'https://students-hub.vercel.app', // Replace with your frontend origin
  optionsSuccessStatus: 200 // Some legacy browsers (e.g., IE11) may require a status code to be explicitly set
};

// Use CORS middleware with options
app.use(cors(corsOptions));

/* ROUTES WITH FILES */
app.post("/auth/register", upload.single("picture"), register);

app.post("/posts", verifyToken, upload.single("picture"), createPost);
app.get("/posts/search/:key",async(req,res)=>{
  try {
    const searchResults = await Post.find({
      $or: [
        { description: { $regex: req.params.key, $options: 'i' } }, 
        { code: { $regex: req.params.key, $options: 'i' } }, 
        { 'answers.AnsDescription': { $regex: req.params.key, $options: 'i' } }, // Assuming 'answers' is an array of objects
      ]
      
    });
    res.status(200).json(searchResults);
  } catch (error) {
    console.error('Error searching posts:', error);
    res.status(500).json({ message: 'Failed to search posts' });
  }
})
/* ROUTES */
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 6001;
mongoose.connect(process.env.MONGO_URL, {
    
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));

  })
  .catch((error) => console.log(`${error} did not connect`));

  
  
  
