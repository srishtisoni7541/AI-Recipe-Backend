const express = require('express');
const { register, login, logout } = require('../controllers/authController');
const { validateRegister } = require('../middlewares/authValidator');
const isLoggedIn = require('../middlewares/authMiddleware');


const router = express.Router();

router.post("/register",validateRegister, register);
router.post("/login", login);
router.post('/logout',isLoggedIn,logout);

module.exports = router;
