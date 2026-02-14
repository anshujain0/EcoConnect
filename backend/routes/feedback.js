const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');

router.post('/', async (req, res) => {
  try {
    const { analysisId, rating, comment, wasHelpful } = req.body;
    
    const feedback = new Feedback({
      analysisId,
      rating,
      comment,
      wasHelpful
    });
    
    await feedback.save();
    
    res.json({ success: true, message: 'Thank you for your feedback!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;