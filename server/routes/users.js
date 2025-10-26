const express = require('express');
const { listUsers, addUser, updateUser, deleteUser, showUser, showMyProfile } = require('../controllers/usersController');
const router = express.Router();


router.get('/', listUsers);
router.get('/:id', showUser);
router.get('/me', showMyProfile)
router.post('/', addUser);
router.patch('/:id', updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
