//Plik na potrzeby testów

import jwt from "jsonwebtoken";
const JWT_SECRET = "bardzosekretnysekret";

const token = jwt.sign(
  { userId: "123", email: "test@example.com", isAdmin: false },
  JWT_SECRET,
  { expiresIn: "1s" }
);

console.log(token);
