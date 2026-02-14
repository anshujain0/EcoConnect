const express = require('express');
const router = express.Router();
const { 
  upload, 
  uploadImage, 
  getAnalysis, 
  submitAnswers,
  getNearbyLocations 
} = require('../controllers/analysisController');

router.post('/upload', upload.single('image'), uploadImage);

router.get('/:analysisId', getAnalysis);

router.post('/:analysisId/answers', submitAnswers);

router.post('/:analysisId/locations', getNearbyLocations);

module.exports = router;