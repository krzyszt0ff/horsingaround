import jwt from "jsonwebtoken";
const JWT_SECRET = "bardzosekretnysekret";

export function authMiddleware(req, res, next) {

  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ error: "No authorization header" });

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token missing" });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; //Pola: userId, email, isAdmin
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid or expired token" });
  }
}
