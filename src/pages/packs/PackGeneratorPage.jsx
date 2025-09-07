import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PersonalizationForm from '../../components/packs/PersonalizationForm';
import { cn } from '../../utils/cn';

const PackGeneratorPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const packType = searchParams.get('type') || 'PACK_30DAY';
  
  const [generationState, setGenerationState] = useState({
    loading: false,
    error: null,
    result: null,
    step: 'form' // 'form', 'generating', 'success', 'error'
  });

  // Handle form submission
  const handleGeneratePackage = async (formData) => {
    setGenerationState({
      loading: true,
      error: null,
      result: null,
      step: 'generating'
    });

    try {
      const response = await fetch('/api/generate-pack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packType,
          userInputs: formData,
          deliveryOptions: {
            includePDF: true,
            sendEmail: true
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Generation failed');
      }

      setGenerationState({
        loading: false,
        error: null,
        result: data,
        step: 'success'
      });

      // Track successful generation
      if (window.gtag) {
        window.gtag('event', 'pack_generated', {
          event_category: 'engagement',
          event_label: packType,
          value: 1
        });
      }

    } catch (error) {
      console.error('Pack generation error:', error);
      
      setGenerationState({
        loading: false,
        error: error.message,
        result: null,
        step: 'error'
      });

      // Track generation errors
      if (window.gtag) {
        window.gtag('event', 'pack_generation_error', {
          event_category: 'error',
          event_label: packType,
          value: 1
        });
      }
    }
  };

  // Handle retry
  const handleRetry = () => {
    setGenerationState({
      loading: false,
      error: null,
      result: null,
      step: 'form'
    });
  };

  // Handle new pack request
  const handleNewPack = () => {
    setGenerationState({
      loading: false,
      error: null,
      result: null,
      step: 'form'
    });
    navigate('/packs');
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            AI-Powered Strategy Packs
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get personalized, actionable strategy content generated specifically for your situation
          </p>
        </div>

        {/* Form Step */}
        {generationState.step === 'form' && (
          <PersonalizationForm
            packType={packType}
            onSubmit={handleGeneratePackage}
            loading={generationState.loading}
          />
        )}

        {/* Generating Step */}
        {generationState.step === 'generating' && (
          <GeneratingView packType={packType} />
        )}

        {/* Success Step */}
        {generationState.step === 'success' && generationState.result && (
          <SuccessView 
            result={generationState.result} 
            onNewPack={handleNewPack} 
          />
        )}

        {/* Error Step */}
        {generationState.step === 'error' && (
          <ErrorView 
            error={generationState.error}
            onRetry={handleRetry}
            onNewPack={handleNewPack}
          />
        )}
      </div>
    </div>
  );
};

// Generating view component
const GeneratingView = ({ packType }) => {
  const [progress, setProgress] = useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const packNames = {
    'PACK_30DAY': '30-Day Idea→Product Sprint',
    'KIT_AUTOMATION': 'Micro-Automation Kit',
    'KIT_DIAGRAMS': 'Visual Thinking Toolkit'
  };

  return (
    <div className="max-w-lg mx-auto text-center">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Generating Your {packNames[packType]}
        </h2>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        <div className="text-gray-600 space-y-2">
          <p className="font-medium">Our AI is working on:</p>
          <ul className="text-sm space-y-1">
            <li>• Analyzing your specific situation</li>
            <li>• Generating personalized strategies</li>
            <li>• Creating actionable recommendations</li>
            <li>• Formatting your professional PDF</li>
          </ul>
          <p className="text-xs mt-4 text-gray-500">
            This usually takes 2-3 minutes
          </p>
        </div>
      </div>
    </div>
  );
};

// Success view component
const SuccessView = ({ result, onNewPack }) => {
  const downloadPDF = () => {
    if (window.gtag) {
      window.gtag('event', 'pack_download', {
        event_category: 'engagement',
        event_label: result.packType
      });
    }
    // PDF download would be implemented here
    alert('PDF download functionality will be implemented based on your backend setup');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-6 text-white text-center">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Your Pack is Ready! 🎉</h2>
          <p className="opacity-90">
            We've generated {result.sectionsCount} personalized sections just for you
          </p>
        </div>

        {/* Pack Summary */}
        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Pack Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Pack Type:</span>
                  <span className="font-medium">{result.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Personalized for:</span>
                  <span className="font-medium">{result.personalizedFor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sections:</span>
                  <span className="font-medium">{result.sectionsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Content Size:</span>
                  <span className="font-medium">{Math.round(result.contentSize / 1024)} KB</span>
                </div>
              </div>
            </div>
            
            {result.pdf && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">PDF Available</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Format:</span>
                    <span className="font-medium">Professional PDF</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Size:</span>
                    <span className="font-medium">{Math.round(result.pdf.size / 1024)} KB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pages:</span>
                    <span className="font-medium">~{result.sectionsCount + 3}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {result.pdf && (
              <button
                onClick={downloadPDF}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF Pack
              </button>
            )}
            
            {result.emailSent && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-green-800 text-sm">
                  📧 We've also sent your pack to your email address
                </p>
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={onNewPack}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
              >
                Generate Another Pack
              </button>
              
              <button
                onClick={() => window.open('/advisory', '_blank')}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200"
              >
                Book Strategy Session
              </button>
            </div>
          </div>

          {/* Content Preview */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Content Preview</h3>
            <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
              {Object.entries(result.sections).slice(0, 2).map(([title, section]) => (
                <div key={title} className="mb-4 last:mb-0">
                  <h4 className="font-medium text-sm text-blue-600 mb-1">{title}</h4>
                  <p className="text-xs text-gray-600 line-clamp-3">
                    {typeof section.content === 'string' 
                      ? section.content.substring(0, 200) + '...'
                      : 'Content generated successfully'
                    }
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Error view component
const ErrorView = ({ error, onRetry, onNewPack }) => {
  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Generation Failed
        </h2>
        
        <p className="text-gray-600 mb-6">
          {error || 'Something went wrong while generating your pack. Please try again.'}
        </p>
        
        <div className="space-y-3">
          <button
            onClick={onRetry}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            Try Again
          </button>
          
          <button
            onClick={onNewPack}
            className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
          >
            Choose Different Pack
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mt-6">
          If the problem persists, please contact{' '}
          <a href="mailto:ivan@peycheff.com" className="text-blue-600 hover:underline">
            ivan@peycheff.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default PackGeneratorPage;
