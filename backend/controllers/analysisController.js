const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const geminiService = require('../services/geminiService');
const Analysis = require('../models/Analysis');
const recommendationService = require('../services/recommendationService');
const locationService = require('../services/locationService');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, webp)'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});

const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload an image file'
      });
    }

    const imagePath = req.file.path;
    
    console.log('Image uploaded:', imagePath);
    
    // Analyze with Gemini
    const aiResult = await geminiService.analyzeImage(imagePath);
    
    console.log('AI Analysis complete:', aiResult);
    
    if (aiResult.is_valid_item === false) {
      // Delete the uploaded file
      await fs.unlink(imagePath).catch(console.error);
      
      return res.status(400).json({
        success: false,
        is_valid_item: false,
        error: aiResult.rejection_reason,
        confidence: aiResult.confidence
      });
    }
    
    // Get follow-up questions
    const questions = await geminiService.generateFollowUpQuestions(
      aiResult.category,
      aiResult.item_name
    );

    // Save to database
    const analysis = new Analysis({
      imageUrl: imagePath,
      material: aiResult.material,
      itemName: aiResult.item_name,
      description: aiResult.description,
      category: aiResult.category,
      conditionEstimate: aiResult.condition_estimate,
      confidence: aiResult.confidence,
      questions: questions
    });

    await analysis.save();
    
    console.log('✅ Analysis saved to database with ID:', analysis._id.toString());

    res.json({
      success: true,
      data: {
        analysisId: analysis._id,
        material: aiResult.material,
        itemName: aiResult.item_name,
        description: aiResult.description,
        category: aiResult.category,
        conditionEstimate: aiResult.condition_estimate,
        confidence: aiResult.confidence,
        questions
      }
    });

  } catch (error) {
    console.error('❌ Error in uploadImage:', error);
    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }
    next(error);
  }
};

const getAnalysis = async (req, res, next) => {
  try {
    const { analysisId } = req.params;
    
    console.log('Fetching analysis with ID:', analysisId);
    
    const analysis = await Analysis.findById(analysisId);
    
    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found'
      });
    }

    res.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error('Error in getAnalysis:', error);
    next(error);
  }
};

const submitAnswers = async (req, res, next) => {
  try {
    const { analysisId } = req.params;
    const { answers } = req.body;

    console.log('Received analysisId:', analysisId);
    console.log('Received answers:', answers);

    if (!answers || Object.keys(answers).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide answers to the questions'
      });
    }

    if (!analysisId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('Invalid ObjectId format');
      return res.status(400).json({
        success: false,
        error: 'Invalid analysis ID format'
      });
    }

    console.log('Searching for analysis in database...');
    const analysis = await Analysis.findById(analysisId);
    
    console.log('Analysis found:', !!analysis);
    
    if (!analysis) {
      const count = await Analysis.countDocuments();
      console.log('Total analyses in database:', count);
      
      return res.status(404).json({
        success: false,
        error: 'Analysis not found',
        debug: {
          searchedId: analysisId,
          totalAnalyses: count
        }
      });
    }

    const recommendation = recommendationService.generateRecommendation(
      analysis.category,
      analysis.itemName,
      answers,
      {
        material: analysis.material,
        description: analysis.description,
        conditionEstimate: analysis.conditionEstimate
      }
    );

    console.log('Generated recommendation:', recommendation);

    analysis.userAnswers = answers;
    analysis.recommendation = recommendation;
    await analysis.save();

    console.log('Analysis updated successfully');

    res.json({
      success: true,
      data: {
        analysisId: analysis._id,
        recommendation
      }
    });

  } catch (error) {
    console.error('Error in submitAnswers:', error);
    next(error);
  }
};

const getNearbyLocations = async (req, res, next) => {
  try {
    const { analysisId } = req.params;
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Please provide latitude and longitude'
      });
    }

    console.log(`Getting locations for analysis: ${analysisId} at ${latitude}, ${longitude}`);

    const locations = await locationService.updateAnalysisWithLocations(
      analysisId,
      parseFloat(latitude),
      parseFloat(longitude)
    );

    res.json({
      success: true,
      data: {
        analysisId,
        userLocation: { latitude, longitude },
        locations
      }
    });

  } catch (error) {
    console.error('Error in getNearbyLocations:', error);
    next(error);
  }
};

module.exports = {
  upload,
  uploadImage,
  getAnalysis,
  submitAnswers,
  getNearbyLocations
};