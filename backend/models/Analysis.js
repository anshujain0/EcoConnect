const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: String,
  type: String,
  address: String,
  distance: Number,
  lat: Number,
  lng: Number,
  phone: String,
  isOpen: Boolean,
  rating: Number,
  placeId: String
}, { _id: false });

const questionSchema = new mongoose.Schema({
  id: String,
  question: String,
  options: [String]
}, { _id: false });

const analysisSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true
  },
  material: {
    type: String,
    required: true
  },
  itemName: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    enum: ['plastic', 'metal', 'ewaste', 'fabric', 'glass', 'paper', 'organic', 'hazardous', 'other'],
    required: true
  },
  conditionEstimate: String,
  confidence: String,
  questions: [questionSchema],
  userAnswers: {
    type: Map,
    of: String
  },
  recommendation: {
    action: String,
    reasoning: String,
    estimatedValue: Number,
    olxSearchUrl: String,
    tips: [String]
  },
  nearbyLocations: [locationSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AnalysisV2', analysisSchema, 'analyses_v2');