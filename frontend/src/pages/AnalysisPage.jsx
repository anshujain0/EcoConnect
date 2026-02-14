import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAnalysis, submitAnswers } from '../services/api';
import axios from 'axios';

function AnalysisPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [locationStatus, setLocationStatus] = useState('idle');
  const [feedback, setFeedback] = useState({ rating: 0, comment: '' });
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    fetchAnalysis();
  }, [id]);

  const fetchAnalysis = async () => {
    try {
      const response = await getAnalysis(id);
      if (response.success) {
        setAnalysis(response.data);
      }
    } catch (error) {
      console.error('Error fetching analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, answer) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const callLocationsAPI = async (latitude, longitude) => {
    try {
      console.log('Calling locations API with:', latitude, longitude);
      const response = await axios.post(
        `https://ecoconnect-xzvo.onrender.com/api/analysis/${id}/locations`,
        { latitude, longitude }
      );
      if (response.data.success) {
        console.log('Locations fetched:', response.data.data.locations.length);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const fetchNearbyLocations = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.log('Geolocation not supported');
        callLocationsAPI(22.7196, 75.8577).then(resolve);
        return;
      }

      setLocationStatus('requesting');

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocationStatus('granted');
          await callLocationsAPI(latitude, longitude);
          resolve();
        },
        async () => {
          setLocationStatus('denied');
          await callLocationsAPI(22.7196, 75.8577);
          resolve();
        },
        { timeout: 8000, maximumAge: 60000 }
      );
    });
  };

  const handleSubmitAnswers = async () => {
  if (Object.keys(selectedAnswers).length < 4) {
    alert('Please answer all questions');
    return;
  }

  setSubmitting(true);
  try {
    const response = await submitAnswers(id, selectedAnswers);
    
    if (response.success) {
      await fetchNearbyLocations();
      
      await new Promise(resolve => setTimeout(resolve, 500));

      await fetchAnalysis();
      
      setTimeout(() => {
        document.getElementById('recommendations')?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 600);
    }
  } catch (error) {
    console.error('Error submitting answers:', error);
    alert('Failed to submit answers. Please try again.');
  } finally {
    setSubmitting(false);
  }
};

  const submitFeedback = async () => {
    if (feedback.rating === 0) {
      alert('Please select a rating');
      return;
    }
    try {
      const response = await axios.post('https://ecoconnect-xzvo.onrender.com/api/feedback', {
        analysisId: id,
        rating: feedback.rating,
        comment: feedback.comment,
        wasHelpful: feedback.rating >= 3
      });
      if (response.data.success) {
        setFeedbackSubmitted(true);
      }
    } catch (error) {
      console.error('Feedback error:', error);
      alert('Failed to submit feedback. Please try again.');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!analysis) return <ErrorMessage />;

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-text-dark mb-3">
            AI Analysis Complete
          </h1>
          <p className="text-lg text-text-dark/70">
            Review the results and answer questions for personalized recommendations
          </p>
        </div>

        {/* AI Results Card */}
        <div className="card mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-64 h-64 rounded-lg overflow-hidden border-2 border-soft-green shadow-md flex-shrink-0 bg-gray-100">
              <img
                src={`https://ecoconnect-xzvo.onrender.com/${analysis.imageUrl.replace(/\\/g, '/')}`}
                alt={analysis.itemName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-primary">{analysis.itemName}</h2>
                <span className={`px-4 py-1 rounded-full text-sm font-bold ${
                  analysis.confidence === 'high' ? 'bg-primary text-white' : 'bg-secondary text-text-dark'
                }`}>
                  {analysis.confidence} confidence
                </span>
              </div>

              <p className="text-text-dark/80 mb-4">{analysis.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-text-dark/60 mb-1">Material Type</p>
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-soft-green rounded-full text-primary font-semibold">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {analysis.material}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-text-dark/60 mb-1">Category</p>
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-primary font-semibold capitalize">
                    {analysis.category}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-text-dark/60 mb-1">Estimated Condition</p>
                <p className="text-base font-semibold text-text-dark capitalize">
                  {analysis.conditionEstimate}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Location Banner */}
        {locationStatus === 'requesting' && (
          <div className="mb-6 p-4 bg-secondary/20 border border-secondary rounded-lg flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent flex-shrink-0"></div>
            <p className="text-text-dark font-medium">
              Requesting your location to find nearby recyclers...
            </p>
          </div>
        )}

        {locationStatus === 'denied' && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-300 rounded-lg flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-yellow-800 font-semibold">Location access denied</p>
              <p className="text-yellow-700 text-sm">Showing nearby facilities based on your city instead.</p>
            </div>
          </div>
        )}

        {locationStatus === 'granted' && (
          <div className="mb-6 p-4 bg-primary-50 border border-primary/30 rounded-lg flex items-center gap-3">
            <svg className="w-5 h-5 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-primary font-medium">
              Using your exact location for accurate nearby results!
            </p>
          </div>
        )}

        {/* Questions Section */}
        {!analysis.recommendation?.action && analysis.questions && (
          <div className="card mb-8">
            <h2 className="text-2xl font-bold text-text-dark mb-2">
              Answer a Few Questions
            </h2>
            <p className="text-text-dark/70 mb-8">
              Help us provide better recommendations by answering these quick questions
            </p>

            <div className="space-y-6">
              {analysis.questions.map((question, index) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  index={index}
                  selectedAnswer={selectedAnswers[question.id]}
                  onSelect={(answer) => handleAnswerSelect(question.id, answer)}
                />
              ))}
            </div>

            <div className="mt-8 flex flex-col items-center gap-3">
              {/* Progress indicator */}
              <p className="text-sm text-text-dark/60">
                {Object.keys(selectedAnswers).length} of 4 questions answered
              </p>
              <div className="flex gap-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`h-2 w-12 rounded-full transition-all duration-300 ${
                    Object.keys(selectedAnswers).length >= i ? 'bg-primary' : 'bg-gray-200'
                  }`}></div>
                ))}
              </div>
              <button
                onClick={handleSubmitAnswers}
                disabled={submitting || Object.keys(selectedAnswers).length < 4}
                className={`mt-4 px-10 py-4 bg-secondary text-text-dark font-bold rounded-lg text-lg
                  transition-all duration-300 shadow-lg
                  ${(submitting || Object.keys(selectedAnswers).length < 4)
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-secondary-hover hover:shadow-xl'
                  }`}
              >
                {submitting ? (
                  <span className="flex items-center gap-3">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Finding recommendations & nearby locations...
                  </span>
                ) : (
                  'Get Recommendations →'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Recommendations Section */}
        {analysis.recommendation?.action && (
          <div id="recommendations" className="space-y-8">
            <RecommendationCard recommendation={analysis.recommendation} />

            {/* Nearby Locations */}
            {analysis.nearbyLocations && analysis.nearbyLocations.length > 0 ? (
              <LocationsCard locations={analysis.nearbyLocations} />
            ) : (
              <div className="card text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
                <p className="text-text-dark/70 font-medium">No nearby locations found in your area yet.</p>
                <p className="text-text-dark/50 text-sm mt-1">Try searching online for local recyclers near you.</p>
              </div>
            )}

            {/* Feedback Section */}
            <div className="card">
              <h3 className="text-2xl font-bold text-text-dark mb-4">
                How was your experience?
              </h3>

              {!feedbackSubmitted ? (
                <>
                  <p className="text-text-dark/70 mb-4">
                    Your feedback helps us improve our recommendations
                  </p>

                  <div className="flex gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => setFeedback({...feedback, rating: star})}
                        className={`text-4xl transition-all duration-200 ${
                          feedback.rating >= star
                            ? 'text-yellow-400 scale-110'
                            : 'text-gray-300 hover:text-yellow-200'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                    {feedback.rating > 0 && (
                      <span className="ml-3 text-lg font-semibold text-text-dark self-center">
                        {feedback.rating === 5 ? 'Excellent!' :
                         feedback.rating === 4 ? 'Great!' :
                         feedback.rating === 3 ? 'Good' :
                         feedback.rating === 2 ? 'Fair' : 'Poor'}
                      </span>
                    )}
                  </div>

                  <textarea
                    value={feedback.comment}
                    onChange={(e) => setFeedback({...feedback, comment: e.target.value})}
                    placeholder="Tell us what you think... (optional)"
                    className="w-full p-4 border-2 border-gray-200 rounded-lg mb-4 focus:border-primary focus:outline-none transition-colors"
                    rows="4"
                  />

                  <button
                    onClick={submitFeedback}
                    disabled={feedback.rating === 0}
                    className={`px-8 py-3 bg-primary text-white font-bold rounded-lg transition-all duration-300
                      ${feedback.rating === 0
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-primary-700 shadow-lg hover:shadow-xl'
                      }`}
                  >
                    Submit Feedback
                  </button>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-xl font-bold text-primary mb-2">Thank you for your feedback!</p>
                  <p className="text-text-dark/70">Your input helps us improve EcoConnect</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Back to Home */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-primary hover:text-primary-700 font-semibold transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Upload Another Item
          </button>
        </div>
      </div>
    </div>
  );
}

function QuestionCard({ question, index, selectedAnswer, onSelect }) {
  return (
    <div className="border border-soft-green rounded-lg p-6 bg-white">
      <h3 className="text-lg font-bold text-text-dark mb-4">
        {index + 1}. {question.question}
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {question.options.map((option) => (
          <button
            key={option}
            onClick={() => onSelect(option)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 text-left
              ${selectedAnswer === option
                ? 'border-primary bg-primary/10 shadow-md'
                : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
              }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                ${selectedAnswer === option ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                {selectedAnswer === option && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-sm font-medium text-text-dark">{option}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function RecommendationCard({ recommendation }) {
  return (
    <div className="card border-l-4 border-primary">
      <h2 className="text-3xl font-black text-primary mb-4">
        Recommendation: {recommendation.action}
      </h2>
      <p className="text-lg text-text-dark/80 mb-6">{recommendation.reasoning}</p>

      {recommendation.estimatedValue && (
        <div className="bg-secondary/20 rounded-lg p-4 mb-6">
          <p className="text-sm text-text-dark/70 mb-1">Estimated Value</p>
          <p className="text-2xl font-bold text-text-dark">₹{recommendation.estimatedValue}</p>
        </div>
      )}

      {recommendation.olxSearchUrl && (
        
        <a href={recommendation.olxSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-700 transition-all duration-300 mb-6"
        >
          Search on OLX
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      )}

      {recommendation.tips && recommendation.tips.length > 0 && (
        <div className="mt-6">
          <h3 className="font-bold text-text-dark mb-3">Helpful Tips:</h3>
          <ul className="space-y-2">
            {recommendation.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-text-dark/80">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function LocationsCard({ locations }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-text-dark">Nearby Facilities</h2>
        <span className="text-sm text-text-dark/50 bg-gray-100 px-3 py-1 rounded-full">
          {locations.length} found
        </span>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {locations.map((location, index) => (
          <div key={index} className="border border-soft-green rounded-lg p-4 hover:shadow-md transition-shadow">
            <h3 className="font-bold text-primary text-lg mb-1">{location.name}</h3>
            <span className="inline-block text-xs font-semibold bg-secondary/30 text-text-dark px-2 py-1 rounded-full mb-3">
              {location.type}
            </span>
            <div className="space-y-2 text-sm text-text-dark/70">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span>{location.address}</span>
              </div>
              {location.phone && location.phone !== 'Not available' && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span>{location.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="font-semibold text-primary">{location.distance} km away</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
        <p className="text-text-dark/70">Loading analysis...</p>
      </div>
    </div>
  );
}

function ErrorMessage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <p className="text-red-600 text-xl font-bold mb-4">Analysis not found</p>
        <p className="text-text-dark/70 mb-6">This analysis doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-700 transition-all"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}

export default AnalysisPage;