const express = require('express');
const isLoggedIn = require('../middlewares/authMiddleware');
const { getUserProfile } = require('../controllers/userrController');
const router = express.Router();

 router.get('/profile',isLoggedIn,getUserProfile);


module.exports = router;