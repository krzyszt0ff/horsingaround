import express from 'express';
import morgan from 'morgan';
import path from 'path';
import cors from 'cors';
import './db.js'
import usersRouter from './routes/users.js'
import authRouter from './routes/auth.js'
import { authMiddleware } from './middleware/authMiddleware.js';

const PORT = 3000;



var app = express();

app.use(cors({
  origin: "http://localhost:5173"
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({extended: false}));


//dostępne bez zalogowania
app.use("/api/auth", authRouter);
app.get(["/","/home"], (req, res) => {
  res.send("<h2>Strona główna</h2>");
})

app.use(authMiddleware); 

app.use('/api/users', usersRouter);



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


app.listen(PORT, () =>{
  console.log(`Server running at http://localhost:${PORT} `);
});


export default app;
