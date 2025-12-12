import React, { useState, useCallback, useRef } from 'react';
import { Scissors, RefreshCw, ChevronRight, User, CheckCircle2, Layers, Sparkles } from 'lucide-react';
import { ImageUploader } from './components/ImageUploader';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ResultCard } from './components/ResultCard';
import { CombinationCard } from './components/CombinationCard';
import { StylePlayground } from './components/StylePlayground';
import { analyzeFace } from './services/geminiService';
import { AppState, AnalysisResult, UploadedImage, AnalysisMode } from './types';

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<AnalysisMode>(AnalysisMode.COMPLETE);
  
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleImageSelect = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        setUploadedImage({
          file,
          previewUrl: URL.createObjectURL(file),
          base64: e.target.result
        });
        setAppState(AppState.UPLOADING); // Transition to Mode Selection view
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleConfirmAnalysis = useCallback(async () => {
    if (!uploadedImage) return;

    setAppState(AppState.ANALYZING);
    setErrorMsg(null);

    try {
      const result = await analyzeFace(uploadedImage.base64, selectedMode);
      setAnalysisResult(result);
      setAppState(AppState.RESULTS);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      console.error(err);
      setErrorMsg("Something went wrong while analyzing your image. Please try again.");
      setAppState(AppState.ERROR);
    }
  }, [uploadedImage, selectedMode]);

  const handleReset = useCallback(() => {
    setAppState(AppState.IDLE);
    setUploadedImage(null);
    setAnalysisResult(null);
    setErrorMsg(null);
    setSelectedMode(AnalysisMode.COMPLETE);
  }, []);

  // Helper to format text with **bold** markers
  const formatText = (text: string) => {
    const parts = text.split(/(\*\*[\s\S]*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="text-white font-bold">{part.slice(2, -2)}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Determine title for the curated combinations section
  let combinationTitle = "Curated Look Combinations";
  if (selectedMode === AnalysisMode.HAIRSTYLE_ONLY) combinationTitle = "Curated Hairstyle Looks";
  if (selectedMode === AnalysisMode.FACIAL_HAIR_ONLY) combinationTitle = "Curated Beard & Stubble Looks";

  return (
    <div className="min-h-screen flex flex-col bg-[#121212] text-text">
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .scanning-line {
          animation: scan 2s linear infinite;
        }
      `}</style>
      {/* Header */}
      <header className="border-b border-gray-800 bg-secondary/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-secondary shadow-lg">
              <Scissors size={20} className="transform -rotate-45" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">Sharp<span className="text-primary">.AI</span></span>
          </div>
          <button 
            onClick={handleReset}
            className={`text-sm font-medium hover:text-primary transition-colors ${appState === AppState.IDLE ? 'invisible' : 'visible'}`}
          >
            New Analysis
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        
        {/* Error State */}
        {appState === AppState.ERROR && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-200 flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={handleConfirmAnalysis} className="text-sm underline hover:text-white">Try Again</button>
          </div>
        )}

        {/* Hero / Upload Section */}
        {appState === AppState.IDLE && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-fade-in">
            <div className="space-y-4 max-w-3xl">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Look <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-200">Sharp.</span>
                <span className="block mt-2">Feel Unstoppable.</span>
              </h1>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Upload a selfie and let our AI master barber analyze your features to design your signature look.
              </p>
            </div>
            
            <div className="w-full max-w-xl">
              <ImageUploader onImageSelect={handleImageSelect} />
            </div>
            
            <div className="flex flex-wrap gap-8 justify-center mt-12 text-gray-500 grayscale opacity-60">
               {/* Mock Logos / Trust indicators could go here */}
               <span className="text-xs uppercase tracking-widest font-semibold">Powered by Gemini 2.5</span>
            </div>
          </div>
        )}

        {/* Confirmation & Analysis State */}
        {(appState === AppState.UPLOADING || appState === AppState.ANALYZING) && uploadedImage && (
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-center min-h-[50vh]">
            
            {/* Left: Image Preview with Scanner */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-700 aspect-square md:aspect-[3/4] bg-black group order-2 md:order-1">
              <img 
                src={uploadedImage.previewUrl} 
                alt="Upload Preview" 
                className="w-full h-full object-cover opacity-80"
              />
              
              {/* Scanning Overlay */}
              {appState === AppState.ANALYZING && (
                <div className="absolute inset-0 z-10 pointer-events-none">
                  {/* Grid overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(207,181,59,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(207,181,59,0.1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30"></div>
                  {/* Scanning bar */}
                  <div className="absolute left-0 right-0 h-1 bg-primary/80 shadow-[0_0_15px_3px_rgba(207,181,59,0.6)] scanning-line"></div>
                  {/* Gradient trail following the line */}
                  <div className="absolute left-0 right-0 h-24 bg-gradient-to-t from-primary/20 to-transparent scanning-line" style={{ transform: 'translateY(-100%)' }}></div>
                  
                  {/* Facial landmarks mock UI */}
                  <div className="absolute top-1/3 left-1/4 w-4 h-4 border border-primary/60 rounded-full animate-ping"></div>
                  <div className="absolute top-1/3 right-1/4 w-4 h-4 border border-primary/60 rounded-full animate-ping delay-100"></div>
                  <div className="absolute bottom-1/3 left-1/2 w-4 h-4 border border-primary/60 rounded-full animate-ping delay-300"></div>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white font-medium text-lg">Your Photo</p>
                <p className="text-gray-400 text-sm">
                  {appState === AppState.ANALYZING ? "Scanning features..." : "Ready for analysis"}
                </p>
              </div>
            </div>

            {/* Right: Controls */}
            <div className="flex flex-col space-y-6 order-1 md:order-2">
              {appState === AppState.UPLOADING ? (
                <div className="space-y-6 animate-fade-in-up">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-white">Customize Analysis</h2>
                    <p className="text-gray-400">What are you looking to change today?</p>
                  </div>
                  
                  <div className="grid gap-3">
                    <button 
                      onClick={() => setSelectedMode(AnalysisMode.HAIRSTYLE_ONLY)}
                      className={`p-4 rounded-xl border flex items-center justify-between transition-all ${selectedMode === AnalysisMode.HAIRSTYLE_ONLY ? 'bg-primary/20 border-primary' : 'bg-surface border-gray-700 hover:border-gray-500'}`}
                    >
                       <div className="flex items-center gap-3">
                         <Scissors className={selectedMode === AnalysisMode.HAIRSTYLE_ONLY ? "text-primary" : "text-gray-500"} />
                         <span className={selectedMode === AnalysisMode.HAIRSTYLE_ONLY ? "text-white font-bold" : "text-gray-300"}>Hairstyle Only</span>
                       </div>
                       {selectedMode === AnalysisMode.HAIRSTYLE_ONLY && <div className="w-3 h-3 bg-primary rounded-full"></div>}
                    </button>

                    <button 
                      onClick={() => setSelectedMode(AnalysisMode.FACIAL_HAIR_ONLY)}
                      className={`p-4 rounded-xl border flex items-center justify-between transition-all ${selectedMode === AnalysisMode.FACIAL_HAIR_ONLY ? 'bg-primary/20 border-primary' : 'bg-surface border-gray-700 hover:border-gray-500'}`}
                    >
                       <div className="flex items-center gap-3">
                         <User className={selectedMode === AnalysisMode.FACIAL_HAIR_ONLY ? "text-primary" : "text-gray-500"} />
                         <span className={selectedMode === AnalysisMode.FACIAL_HAIR_ONLY ? "text-white font-bold" : "text-gray-300"}>Facial Hair Only</span>
                       </div>
                       {selectedMode === AnalysisMode.FACIAL_HAIR_ONLY && <div className="w-3 h-3 bg-primary rounded-full"></div>}
                    </button>

                    <button 
                      onClick={() => setSelectedMode(AnalysisMode.COMPLETE)}
                      className={`p-4 rounded-xl border flex items-center justify-between transition-all ${selectedMode === AnalysisMode.COMPLETE ? 'bg-primary/20 border-primary' : 'bg-surface border-gray-700 hover:border-gray-500'}`}
                    >
                       <div className="flex items-center gap-3">
                         <Sparkles className={selectedMode === AnalysisMode.COMPLETE ? "text-primary" : "text-gray-500"} />
                         <span className={selectedMode === AnalysisMode.COMPLETE ? "text-white font-bold" : "text-gray-300"}>Complete Makeover</span>
                       </div>
                       {selectedMode === AnalysisMode.COMPLETE && <div className="w-3 h-3 bg-primary rounded-full"></div>}
                    </button>
                  </div>

                  <div className="pt-4 flex gap-4">
                    <button 
                      onClick={handleConfirmAnalysis}
                      className="flex-1 bg-primary hover:bg-yellow-500 text-secondary font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      Start Analysis
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={handleReset}
                      className="px-4 py-4 rounded-xl border border-gray-600 hover:bg-gray-800 text-white transition-colors"
                    >
                      Change Photo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-6 h-full">
                   <LoadingSpinner />
                   <div className="space-y-2 text-center max-w-xs">
                     <p className="text-white font-medium">Analyzing facial geometry...</p>
                     <p className="text-xs text-gray-500">
                        {selectedMode === AnalysisMode.COMPLETE ? "Matching hairstyles and beard types." : 
                         selectedMode === AnalysisMode.HAIRSTYLE_ONLY ? "Scanning hairline and face shape." : 
                         "Analyzing jawline and facial density."}
                     </p>
                   </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results View */}
        {appState === AppState.RESULTS && analysisResult && (
          <div ref={resultsRef} className="space-y-16 animate-fade-in pb-16">
            
            {/* Top Section: Analysis Summary */}
            <div className="bg-surface border border-gray-700 rounded-2xl p-6 md:p-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
               <div className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0">
                  <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse"></div>
                  <div className="absolute inset-2 border-2 border-primary rounded-full flex items-center justify-center bg-secondary">
                     <User className="w-16 h-16 text-primary" />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-primary text-secondary px-3 py-1 rounded-full text-xs font-bold uppercase whitespace-nowrap">
                    {analysisResult.faceShape}
                  </div>
               </div>
               <div className="text-center md:text-left">
                 <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Analysis Complete</h2>
                 <p className="text-gray-300 text-lg leading-relaxed max-w-2xl">
                   {analysisResult.faceAnalysis}
                 </p>
               </div>
            </div>

            {/* STYLE PLAYGROUND (New Feature) */}
            <StylePlayground 
              hairstyles={analysisResult.hairstyles} 
              facialHair={analysisResult.facialHair} 
              originalImageBase64={uploadedImage!.base64} 
            />

            {/* Curated Combinations Section (All Modes) */}
            {analysisResult.combinations && analysisResult.combinations.length > 0 && (
              <div className="space-y-8">
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="p-3 bg-primary/10 rounded-full text-primary mb-4">
                      <Layers className="w-8 h-8" />
                    </div>
                    <h3 className="text-3xl font-bold text-white">{combinationTitle}</h3>
                    <p className="text-gray-400 mt-2 max-w-xl">
                      Our AI has selected specific styles that work perfectly for your face shape. Click "Visualize" to see them on you.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {analysisResult.combinations.map((combo, idx) => (
                      <CombinationCard 
                        key={idx} 
                        combination={combo} 
                        originalImageBase64={uploadedImage!.base64} 
                      />
                  ))}
                </div>
              </div>
            )}

            {/* Individual Recommendations Grid */}
            <div className="grid lg:grid-cols-2 gap-12 border-t border-gray-800 pt-12">
              
              {/* Hairstyles (Conditional Render) */}
              {analysisResult.hairstyles.length > 0 && (
                <div className={`space-y-6 ${analysisResult.facialHair.length === 0 ? 'lg:col-span-2' : ''}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <Scissors className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Recommended Hairstyles</h3>
                  </div>
                  <div className={`grid gap-6 ${analysisResult.facialHair.length === 0 ? 'md:grid-cols-2' : ''}`}>
                    {analysisResult.hairstyles.map((style, idx) => (
                      <ResultCard key={idx} recommendation={style} type="hair" />
                    ))}
                  </div>
                </div>
              )}

              {/* Beards / Facial Hair (Conditional Render) */}
              {analysisResult.facialHair.length > 0 && (
                <div className={`space-y-6 ${analysisResult.hairstyles.length === 0 ? 'lg:col-span-2' : ''}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <User className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Facial Hair Options</h3>
                  </div>
                  <div className={`grid gap-6 ${analysisResult.hairstyles.length === 0 ? 'md:grid-cols-2' : ''}`}>
                    {analysisResult.facialHair.map((style, idx) => (
                      <ResultCard key={idx} recommendation={style} type="beard" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Grooming Tips */}
            <div className="bg-gradient-to-br from-surface to-secondary border border-gray-700 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <CheckCircle2 className="text-primary" />
                Pro Grooming Tips
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analysisResult.groomingTips.map((tip, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <span className="text-primary font-bold text-xl opacity-50">0{idx + 1}</span>
                    <p className="text-gray-300 text-sm leading-relaxed">{formatText(tip)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center pt-8">
              <button 
                onClick={handleReset}
                className="flex items-center gap-2 px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-full transition-all"
              >
                <RefreshCw className="w-5 h-5" />
                Start New Analysis
              </button>
            </div>
            
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 mt-auto bg-secondary">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Sharp.AI. Generated recommendations are for entertainment purposes.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;