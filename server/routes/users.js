var express = require('express');
const { listUsers, addUser, updateUser, deleteUser } = require('../controllers/usersController');
var router = express.Router();


/* GET users listing. */
router.get('/', listUsers);
router.post('/', addUser);
router.put('/:id', updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
