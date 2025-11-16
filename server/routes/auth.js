import express from 'express';
import {register, login} from '../controllers/authController.js'

const router = express.Router();

//rejestracja nowego użytkownika
//INPUT: pola w body: email, password
//OUTPUT: success: true, user_id LUB success: false, error
router.post('/register', register);

//rejestracja nowego użytkownika
//INPUT: pola w body: email, password
//OUTPUT: success: true, token LUB success: false, error
router.post('/login', login);

export default router;