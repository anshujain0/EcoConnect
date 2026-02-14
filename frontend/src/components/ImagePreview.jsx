function ImagePreview({ file, imageUrl, onRemove }) {
  return (
    <div className="card">
      <div className="flex gap-6 items-start">
        <div className="w-48 h-48 rounded-lg overflow-hidden border-2 border-soft-green shadow-md flex-shrink-0">
          <img 
            src={imageUrl} 
            alt="Preview" 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-text-dark mb-2">Image Selected</h3>
          <div className="space-y-2 text-sm text-text-dark/70">
            <p className="truncate">
              <span className="font-semibold">File:</span> {file.name}
            </p>
            <p>
              <span className="font-semibold">Size:</span> {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <p>
              <span className="font-semibold">Type:</span> {file.type}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-4 p-3 bg-primary-50 rounded-lg">
            <svg className="w-5 h-5 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-semibold text-primary">Ready to analyze</span>
          </div>

          <button
            onClick={onRemove}
            className="mt-4 text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
          >
            Remove & Choose Different Image
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImagePreview;