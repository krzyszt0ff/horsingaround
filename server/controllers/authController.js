import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import * as z from'zod';
import { UserCredentials } from '../models/UserCredentials.js';
import { credentialsSchema } from '../schemas/credentialsSchema.js';

const JWT_SECRET = "bardzosekretnysekret";

//Funkcja do rejestracji użytkownika
export async function register(req, res) {

    const result = credentialsSchema.safeParse(req.body);

    if (!result.success){
        return res.status(400).json({success: false, error: z.flattenError(result.error)});
    }

    const {email, password} = result.data;

    const user = await UserCredentials.findOne({ email: email });
    
      if (user !== null) {
        return res.status(409).json({ success: false, error: "User with such email already exists" });
      }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUserCredential = {
        email: email,
        password_hash: passwordHash,
        role: "User"
    }

    try {
        const result = await UserCredentials.create(newUserCredential);
      }
      catch (err) {
        console.error(`An error occured while trying to insert new UserData object: ${err}`);
        return res.status(500).json({ success: false, error: "A database error has occured" });
      }
    
    const newUser = await UserCredentials.findOne({email: email});

    const token = jwt.sign(
        {userId: newUser._id, email: email, role: "User"},
        JWT_SECRET,
        {expiresIn: "1h"}
    )

    res.cookie("token", token, {
    httpOnly: true,
    sameSite: "none",
    secure: true, 
    });

    return res.status(200).json({success: true, userId: newUser._id});
}

// rollback credentials (gdy userData się nie zapisze)
export async function deleteCredentials(req, res) {
  const { userId } = req.params;

  try {
    const credential = await UserCredentials.findById(userId);

    if (!credential) {
      return res.status(404).json({
        success: false,
        error: "Credentials not found"
      });
    }

    await UserCredentials.findByIdAndDelete(userId);

    return res.status(204).send();
  } catch (err) {
    console.error("Delete credentials error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to delete credentials"
    });
  }
}

// funkcja do logowania użytkownika
export async function login(req, res) {

    const result = credentialsSchema.safeParse(req.body);

    if (!result.success){
        return res.status(400).json({success: false, error: z.flattenError(result.error)});
    }

    const {email, password} = result.data;

    const user = await UserCredentials.findOne({ email: email });
    
    if (!user) {
        return res.status(401).json({ success: false, error: "Invalid email or password"});
    }
     if (user.isDeleted) {
    return res.status(403).json({ success: false, error: "Account has been removed" });
  }

    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid){
        return res.status(401).json({success: false, error: "Invalid email or password"})
    }

    const token = jwt.sign(
        {userId: user._id, email: user.email, role: user.role},
        JWT_SECRET,
        {expiresIn: "1h"}
    )

    res.cookie("token", token, {
        httpOnly: true,
        secure: true, 
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24
    });

    return res.status(200).json({success: true});
    
}

export async function logout(req, res) {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "none",
      secure: true,   // w dev false, w produkcji true
      path: "/"        // musi być IDENTYCZNY jak przy ustawianiu
    });

    return res.status(200).json({ success: true, message: "Logged out" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ success: false, error: "Logout failed" });
  }
}