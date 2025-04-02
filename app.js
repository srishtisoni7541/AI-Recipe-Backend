const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/authRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const errorHandler = require('./middlewares/errorHandler');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middleware

const corsOptions = {
    origin:  'https://ai-recipe-client-s7zx-nzsbndlcd-srishti-soni-s-projects.vercel.app/'||'http://localhost:5173',
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
    credentials: true
  };
  
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions)); 
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser())
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// // Routes
app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipeRoutes);
app.use('/api/users',userRoutes);
// Error Handler
app.use(errorHandler);
module.exports = app;
