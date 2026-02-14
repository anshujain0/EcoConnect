import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadImage } from '../services/api';
import UploadZone from '../components/UploadZone';
import ImagePreview from '../components/ImagePreview';
import RejectionModal from '../components/RejectionModal';

function HomePage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [rejectionMessage, setRejectionMessage] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setVisible(true);
  }, []);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleUpload = async () => {
  if (!selectedFile) return;
  setUploading(true);
  try {
    const response = await uploadImage(selectedFile);
    
    if (response.success) {
      navigate(`/analysis/${response.data.analysisId}`);
    } else {
      if (response.is_valid_item === false) {
        setRejectionMessage(response.error);
        setShowRejectionModal(true);
        handleRemoveFile();
        
        // Scroll to upload section
        setTimeout(() => {
          const uploadSection = document.getElementById('upload');
          if (uploadSection) {
            uploadSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
      } else {
        alert('Upload failed. Please try again.');
      }
    }
  } catch (error) {
    console.error('Upload error:', error);
    
    if (error.response?.data?.is_valid_item === false) {
      setRejectionMessage(error.response.data.error);
      setShowRejectionModal(true);
      handleRemoveFile();
      
      // Scroll to upload section
      setTimeout(() => {
        const uploadSection = document.getElementById('upload');
        if (uploadSection) {
          uploadSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    } else {
      alert('Upload failed. Please try again.');
    }
  } finally {
    setUploading(false);
  }
};


  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-50 via-white to-soft-green overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-20 left-1/2 w-80 h-80 bg-soft-green/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className={`space-y-8 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-primary/20">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-primary">AI-Powered Sustainability</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-black text-text-dark leading-tight">
                Turn Your Waste Into
                <span className="block text-primary mt-2">Environmental Impact</span>
              </h1>

              <p className="text-xl text-text-dark/70 leading-relaxed">
                Upload a photo of any item. Our AI instantly identifies it, suggests the best eco-action, 
                and connects you with local recyclers, NGOs, or buyers. Make sustainability effortless.
              </p>

              <div className="flex flex-wrap gap-4">
  
                <a href="#upload"
                    className="group inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                    Start Now - It's Free
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </a>
                
                
                <a href="#how-it-works"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-text-dark font-semibold rounded-xl transition-all duration-300 border-2 border-gray-200"
                >
                    See How It Works
                </a>
                </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
                <div>
                  <p className="text-3xl font-black text-primary">98%</p>
                  <p className="text-sm text-text-dark/60">Accuracy</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-primary">2min</p>
                  <p className="text-sm text-text-dark/60">Average Time</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-primary">500+</p>
                  <p className="text-sm text-text-dark/60">Local Partners</p>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className={`relative transition-all duration-1000 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                  <div className="space-y-6">
                    {/* Icon Grid */}
                    <div className="grid grid-cols-3 gap-4">
                      <ItemCard icon="📱" label="E-waste" />
                      <ItemCard icon="♻️" label="Plastic" />
                      <ItemCard icon="👕" label="Fabric" />
                      <ItemCard icon="🔧" label="Metal" />
                      <ItemCard icon="📦" label="Paper" />
                      <ItemCard icon="🍃" label="Organic" />
                    </div>

                    {/* Process Visual */}
                    <div className="bg-gradient-to-r from-primary-50 to-soft-green rounded-xl p-6">
                      <div className="flex items-center justify-between">
                        <ProcessStep number="1" label="Upload" active />
                        <div className="flex-1 h-0.5 bg-primary/20 mx-2">
                          <div className="h-full bg-primary w-1/2 animate-pulse"></div>
                        </div>
                        <ProcessStep number="2" label="AI Scan" />
                        <div className="flex-1 h-0.5 bg-primary/20 mx-2"></div>
                        <ProcessStep number="3" label="Action" />
                      </div>
                    </div>

                    {/* Sample Result */}
                    <div className="bg-primary-50 rounded-lg p-4 border-l-4 border-primary">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-bold text-text-dark">Item Identified</p>
                          <p className="text-sm text-text-dark/70">Plastic bottle • Recyclable</p>
                          <p className="text-xs text-primary font-semibold mt-1">3 recyclers within 2km</p>
                        </div>
                      </div>
                    </div>
                  </div>
                    <RejectionModal 
                        isOpen={showRejectionModal}
                        onClose={() => setShowRejectionModal(false)}
                        message={rejectionMessage}
                    />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div id="upload" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-text-dark mb-4">Ready to Make a Difference?</h2>
          <p className="text-lg text-text-dark/70">Upload a photo and let AI guide your eco-friendly decision</p>
        </div>

        <div className="space-y-8">
          {!selectedFile ? (
            <UploadZone onFileSelect={handleFileSelect} />
          ) : (
            <>
              <ImagePreview file={selectedFile} imageUrl={previewUrl} onRemove={handleRemoveFile} />
              <div className="flex justify-center">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className={`px-10 py-4 bg-primary text-white font-bold rounded-lg text-lg transition-all duration-300 shadow-lg ${
                    uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-700 hover:shadow-xl transform hover:-translate-y-0.5'
                  }`}
                >
                  {uploading ? (
                    <span className="flex items-center gap-3">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Analyzing with AI...
                    </span>
                  ) : (
                    'Analyze Now →'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* How It Works */}
      <div id="how-it-works" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-text-dark mb-4">Simple. Smart. Sustainable.</h2>
            <p className="text-lg text-text-dark/70">Three easy steps to make an environmental impact</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="01"
              title="Snap & Upload"
              description="Take a photo of any item you want to recycle, donate, or sell. Our AI works with any quality image."
              icon={<CameraIcon />}
            />
            <StepCard
              number="02"
              title="AI Analysis"
              description="Our advanced AI instantly identifies the material, condition, and suggests the most eco-friendly action."
              icon={<BrainIcon />}
            />
            <StepCard
              number="03"
              title="Take Action"
              description="Get connected with nearby recyclers, NGOs, or buyers. We show you exactly where to go and what to do."
              icon={<LocationIcon />}
            />
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon="🎯"
            title="Accurate AI Detection"
            description="Our AI identifies materials with 98% accuracy, trained on thousands of waste items."
          />
          <FeatureCard 
            icon="🗺️"
            title="Local Network"
            description="Connected with 500+ verified recyclers, NGOs, and buyers across India."
          />
          <FeatureCard 
            icon="💰"
            title="Value Estimation"
            description="Get instant estimates for sellable items with direct links to online marketplaces."
          />
        </div>
      </div>
    </div>
  );
}

function ItemCard({ icon, label }) {
  return (
    <div className="bg-gradient-to-br from-white to-primary-50 rounded-lg p-4 text-center border border-primary/10 hover:shadow-md transition-all duration-300">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-xs font-semibold text-text-dark">{label}</p>
    </div>
  );
}

function ProcessStep({ number, label, active }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
        active ? 'bg-primary text-white' : 'bg-white text-text-dark border-2 border-gray-200'
      }`}>
        {number}
      </div>
      <p className="text-xs font-medium text-text-dark/60 mt-2">{label}</p>
    </div>
  );
}

function StepCard({ number, title, description, icon }) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-700 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      <div className="relative bg-white rounded-2xl p-8 border border-gray-100 hover:border-primary/30 transition-all duration-300 hover:shadow-xl">
        <div className="text-6xl font-black text-primary/10 mb-4">{number}</div>
        <div className="mb-6 text-primary">{icon}</div>
        <h3 className="text-2xl font-bold text-text-dark mb-3">{title}</h3>
        <p className="text-text-dark/70 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="card-hover text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-text-dark mb-3">{title}</h3>
      <p className="text-text-dark/70">{description}</p>
    </div>
  );
}

function CameraIcon() {
  return (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function BrainIcon() {
  return (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export default HomePage;