import cookieParser from "cookie-parser";
import express from 'express';
import morgan from 'morgan';
import path from 'path';
import cors from 'cors';
import 'dotenv/config';

import { createServer } from 'node:http';
import { Server } from "socket.io";

import './db.js';
import usersRouter from './routes/users.js';
import authRouter from './routes/auth.js';
import adminRouter from './routes/admin.js';
import matchesRouter from './routes/matches.js';
import { authMiddleware } from './middleware/authMiddleware.js';

import setupSocket from "./socket/socket.js";
import { parse } from "node:path";

const PORT = parseInt(process.env.PORT);

var app = express();
const server = createServer(app);

const CLIENT_BASE_URL = process.env.CLIENT_BASE_URL

const io = new Server(server, {
  cors: {
  origin: CLIENT_BASE_URL,
    credentials: true
  }
});

setupSocket(io);
app.set('io', io);
app.use(cors({
  origin: CLIENT_BASE_URL,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], //bo delete jest non-simple
  credentials: true
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: false}));
app.use('/uploads', express.static('uploads'));

//dostępne bez zalogowania
app.use("/api/auth", authRouter);
app.get(["/","/home"], (req, res) => {
  res.send("<h2>Strona główna</h2>");
})

app.use(authMiddleware); 
app.use('/api/users', usersRouter);
app.use('/api/admin', adminRouter);
app.use('/api/matches', matchesRouter);



app.use((req, res) => {
    res.status(404).send("<h2>404 - nie znaleziono strony</h2>");
});


app.use((err, req, res, next) => {
 console.error('Unhandled error:', err);
 const status = err.status || 500;
 res.status(status).json({
 error: err.message || 'Internal Server Error'
 });
});

server.listen(PORT, () =>{
  console.log(`Server running at http://localhost:${PORT} `);
});



export default app;
