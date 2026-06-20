const express = require('express');
const router = express.Router();
const { handleBotMessage } = require('../controllers/chatbotController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, handleBotMessage);

module.exports = router;
