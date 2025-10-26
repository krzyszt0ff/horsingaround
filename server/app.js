const express = require('express');
const morgan = require('morgan');
const path = require("path");
const cors = require('cors');
const usersRouter = require("./routes/users");
const authRouter = require("./routes/auth")
const {authMiddleware} = require("./middleware/authMiddleware");
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

app.use("/users", authMiddleware, (req, res) => {
  res.send(`Witaj użytkowniku o ID: ${req.user.id}`);
});

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


module.exports = app;
