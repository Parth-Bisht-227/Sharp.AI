import React, { useState, useRef, useEffect } from 'react';
import { StyleRecommendation } from '../types';
import { Sparkles, Loader2, ChevronsLeftRight, Share2, RefreshCw, Star, Globe } from 'lucide-react';
import { generateLookPreview } from '../services/geminiService';

// Asset-backed constants matching hosted images
const ALL_HAIRSTYLES = [
  "Afro", "Braids / Cornrows", "Buzz Cut", "Caesar Cut", "Crew Cut",
  "Curly Hair", "Dreadlocks", "Fade", "Fringe / Bangs", "Long Wavy Flow",
  "Man Bun", "Pompadour", "Quiff", "Side Part", "Slick Back",
  "Spiky / Faux Hawk", "Textured Crop", "Undercut"
];

const ALL_FACIAL_HAIR = [ 
  "Anchor Beard", "Balbo", "Chin Strap", "Clean Shaven", "Full Beard", 
  "Goatee", "Heavy Stubble", "Mutton Chops", "Chevron Mustache", 
  "Short Boxed Beard", "Prominent Sideburns", "Van Dyke" 
];

interface StylePlaygroundProps {
  hairstyles: StyleRecommendation[];
  facialHair: StyleRecommendation[];
  originalImageBase64: string;
}

export const StylePlayground: React.FC<StylePlaygroundProps> = ({ hairstyles, facialHair, originalImageBase64 }) => {
  const [viewMode, setViewMode] = useState<'recommended' | 'explore'>('recommended');
  const [selectedHair, setSelectedHair] = useState<string | null>(null);
  const [selectedBeard, setSelectedBeard] = useState<string | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [containerWidth, setContainerWidth] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Monitor container size to ensure foreground image matches background exactly
  useEffect(() => {
    if (!generatedImage || !containerRef.current) return;

    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    // Initial measurement
    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [generatedImage]);

  // Determine which lists to display based on view mode
  const displayHairstyles = viewMode === 'recommended' 
    ? hairstyles.map(h => h.name) 
    : ALL_HAIRSTYLES;

  const displayFacialHair = viewMode === 'recommended'
    ? facialHair.map(h => h.name)
    : ALL_FACIAL_HAIR;

  const handleVisualize = async () => {
    // If lists are present but nothing selected, don't generate (unless list is empty)
    const hairPart = selectedHair ? `Hairstyle: ${selectedHair}` : '';
    const beardPart = selectedBeard ? `Facial Hair: ${selectedBeard}` : '';
    
    if (!hairPart && !beardPart) return;

    setIsGenerating(true);
    setError(null);
    try {
      const description = `${hairPart}. ${beardPart}. Create a cohesive look.`;
      const imageUrl = await generateLookPreview(originalImageBase64, description);
      setGeneratedImage(imageUrl);
      setSliderPosition(50);
    } catch (err) {
      console.error(err);
      setError("Could not generate preview. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  };

  const handleReset = () => {
    setGeneratedImage(null);
    setError(null);
    setContainerWidth(0);
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `stylescout-custom-${new Date().getTime()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (!generatedImage) return;

    if (navigator.share) {
      try {
        const response = await fetch(generatedImage);
        const blob = await response.blob();
        const file = new File([blob], 'custom-look.png', { type: 'image/png' });

        await navigator.share({
          title: 'My Custom StyleScout Look',
          text: `Checking out this custom look: ${selectedHair || ''} + ${selectedBeard || ''}`,
          files: [file]
        });
      } catch (err) {
        console.error('Error sharing:', err);
        downloadImage();
      }
    } else {
      downloadImage();
    }
  };

  return (
    <div className="bg-surface border border-gray-700 rounded-2xl p-6 md:p-8 space-y-8">
      <div className="flex flex-col items-center">
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
          <Sparkles className="text-primary" />
          Style Playground
        </h3>
        <p className="text-gray-400 mb-6 text-center">Mix and match styles to create a custom look.</p>

        {/* View Toggle */}
        <div className="bg-black/40 p-1.5 rounded-xl flex gap-1 mb-2 border border-gray-800">
          <button
            onClick={() => setViewMode('recommended')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              viewMode === 'recommended' 
                ? 'bg-secondary text-primary shadow-lg border border-gray-700' 
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            <Star className={`w-4 h-4 ${viewMode === 'recommended' ? 'fill-current' : ''}`} />
            Recommended
          </button>
          <button
            onClick={() => setViewMode('explore')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              viewMode === 'explore' 
                ? 'bg-secondary text-primary shadow-lg border border-gray-700' 
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            <Globe className="w-4 h-4" />
            Explore Library
          </button>
        </div>
      </div>

      {/* Selection Area */}
      <div className="space-y-8 animate-fade-in">
        {/* Hairstyles Section */}
        {displayHairstyles.length > 0 ? (
          <div>
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
               Select Hairstyle
            </h4>
            <div className="flex flex-wrap gap-3">
              {displayHairstyles.map((name) => (
                <button
                  key={name}
                  onClick={() => setSelectedHair(name === selectedHair ? null : name)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border ${
                    selectedHair === name
                      ? 'bg-primary text-secondary border-primary shadow-[0_0_15px_rgba(207,181,59,0.3)] scale-105'
                      : 'bg-secondary text-gray-400 border-gray-700 hover:border-gray-500 hover:text-gray-200'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        ) : (
          viewMode === 'recommended' && (
             <div className="p-4 border border-dashed border-gray-700 rounded-lg text-center">
                <p className="text-gray-500 text-sm">No hairstyle suggestions available for this analysis mode.</p>
             </div>
          )
        )}

        {/* Facial Hair Section */}
        {displayFacialHair.length > 0 ? (
          <div>
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
               Select Facial Hair
            </h4>
            <div className="flex flex-wrap gap-3">
              {displayFacialHair.map((name) => (
                <button
                  key={name}
                  onClick={() => setSelectedBeard(name === selectedBeard ? null : name)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border ${
                    selectedBeard === name
                      ? 'bg-primary text-secondary border-primary shadow-[0_0_15px_rgba(207,181,59,0.3)] scale-105'
                      : 'bg-secondary text-gray-400 border-gray-700 hover:border-gray-500 hover:text-gray-200'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        ) : (
          viewMode === 'recommended' && (
             <div className="p-4 border border-dashed border-gray-700 rounded-lg text-center">
                <p className="text-gray-500 text-sm">No facial hair suggestions available for this analysis mode.</p>
             </div>
          )
        )}
      </div>

      {/* Action Button */}
      {!generatedImage && (
        <div className="flex flex-col items-center pt-2">
            {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
            <button
                onClick={handleVisualize}
                disabled={isGenerating || (!selectedHair && !selectedBeard)}
                className={`w-full max-w-md py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2
                ${isGenerating || (!selectedHair && !selectedBeard)
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-primary to-yellow-500 text-secondary hover:shadow-lg hover:scale-[1.02]'}
                `}
            >
                {isGenerating ? (
                <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Generating Custom Look...
                </>
                ) : (
                <>
                    <Sparkles className="w-6 h-6" />
                    Visualize Custom Look
                </>
                )}
            </button>
        </div>
      )}

      {/* Result Display with Slider */}
      {generatedImage && (
        <div className="animate-fade-in bg-black/40 p-4 rounded-xl border border-gray-800">
             <div className="mb-4 flex justify-between items-center">
                 <h4 className="text-white font-bold">Your Custom Preview</h4>
                 <button onClick={handleReset} className="text-xs text-primary hover:underline flex items-center gap-1">
                     <RefreshCw className="w-3 h-3" /> Create Another
                 </button>
             </div>
             
             <div 
               ref={containerRef}
               className="relative rounded-lg overflow-hidden border border-gray-700 aspect-square group select-none max-w-2xl mx-auto"
             >
                {/* 1. Background: Original Image */}
                <img 
                  src={originalImageBase64} 
                  alt="Original" 
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* 2. Foreground: Generated Image (Clipped) */}
                <div 
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${sliderPosition}%` }}
                >
                  <img 
                    src={generatedImage} 
                    alt="Generated" 
                    className="absolute inset-0 h-full max-w-none object-cover"
                    style={{ 
                      width: containerWidth ? `${containerWidth}px` : '100%',
                      opacity: containerWidth ? 1 : 0 
                    }}
                  />
                </div>

                {/* 3. Slider Handle */}
                <div 
                   className="absolute inset-y-0 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_2px_rgba(0,0,0,0.5)] z-20"
                   style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-primary text-primary">
                     <ChevronsLeftRight size={16} />
                  </div>
                </div>
                
                {/* 4. Labels */}
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-primary text-[10px] px-2 py-1 rounded z-10 font-bold border border-primary/20">
                  AFTER
                </div>
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-gray-300 text-[10px] px-2 py-1 rounded z-10 font-bold">
                  BEFORE
                </div>

                {/* 5. Invisible Input for Interaction */}
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={sliderPosition} 
                  onChange={handleSliderChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                />
             </div>

             <div className="flex gap-2 mt-4 max-w-2xl mx-auto">
              <button 
                onClick={handleShare}
                className="flex-1 py-3 px-3 bg-primary text-secondary rounded-lg text-xs font-bold hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
              >
                <Share2 className="w-3 h-3" />
                Share Custom Look
              </button>
              <button 
                onClick={handleReset}
                className="py-3 px-3 bg-secondary border border-gray-600 text-gray-400 rounded-lg text-xs font-medium hover:text-white hover:border-gray-500 transition-colors"
              >
                Reset
              </button>
            </div>
        </div>
      )}
    </div>
  );
};