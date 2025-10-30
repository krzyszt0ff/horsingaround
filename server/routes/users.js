import express from 'express';
import { listUsers, addUser, updateUser, deleteUser, showUser, showMyProfile } from '../controllers/usersController.js'

const router = express.Router();


router.get('/', listUsers);
router.get('/:id', showUser);
router.get('/me', showMyProfile)
router.post('/', addUser);
router.patch('/:id', updateUser);
router.delete("/:id", deleteUser);

export default router;
