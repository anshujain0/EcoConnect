import { useEffect } from 'react';
import { createPortal } from 'react-dom';

function RejectionModal({ isOpen, onClose, message }) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl transform transition-all"
        onClick={(e) => e.stopPropagation()}
        style={{ 
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto',
          animation: 'modalFadeIn 0.3s ease-out'
        }}
      >
        <div className="text-center">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          
          <h3 className="text-2xl font-bold text-text-dark mb-3">
            Invalid Item Detected
          </h3>
          
          <p className="text-text-dark/70 mb-6 leading-relaxed">
            {message}
          </p>
          
          <div className="bg-primary-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm font-semibold text-primary mb-2">
              ✓ We accept images of:
            </p>
            <ul className="text-sm text-text-dark/70 space-y-1">
              <li>• Electronics & E-waste (phones, laptops, batteries)</li>
              <li>• Plastic bottles, containers & packaging</li>
              <li>• Old clothes, fabrics & textiles</li>
              <li>• Metal items, cans & scrap metal</li>
              <li>• Glass bottles & jars</li>
              <li>• Paper, cardboard & books</li>
            </ul>
          </div>
          
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-primary hover:bg-primary-700 text-white font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Try Again with Valid Item
          </button>
        </div>
      </div>
    </div>
  );
  return createPortal(modalContent, document.body);
}

export default RejectionModal;