import React, { useState, useEffect, useRef } from 'react';
import { StyleCombination } from '../types';
import { Sparkles, Loader2, Share2, Heart, ChevronsLeftRight } from 'lucide-react';
import { generateLookPreview } from '../services/geminiService';

interface CombinationCardProps {
  combination: StyleCombination;
  originalImageBase64: string;
}

export const CombinationCard: React.FC<CombinationCardProps> = ({ combination, originalImageBase64 }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if look is already saved on mount
    try {
      const savedData = localStorage.getItem('styleScout_savedLooks');
      if (savedData) {
        const savedLooks: StyleCombination[] = JSON.parse(savedData);
        const exists = savedLooks.some(
          (look) => look.name === combination.name && look.description === combination.description
        );
        setIsSaved(exists);
      }
    } catch (err) {
      console.error('Error reading localStorage', err);
    }
  }, [combination]);

  const toggleSaveLook = () => {
    try {
      const savedData = localStorage.getItem('styleScout_savedLooks');
      let savedLooks: StyleCombination[] = savedData ? JSON.parse(savedData) : [];

      if (isSaved) {
        // Remove
        savedLooks = savedLooks.filter(
          (look) => !(look.name === combination.name && look.description === combination.description)
        );
      } else {
        // Add
        savedLooks.push(combination);
      }

      localStorage.setItem('styleScout_savedLooks', JSON.stringify(savedLooks));
      setIsSaved(!isSaved);
    } catch (err) {
      console.error('Error updating localStorage', err);
    }
  };

  const handleVisualize = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      // Build description based on what's available
      let promptParts = [];
      if (combination.hairstyle) promptParts.push(`Hairstyle: ${combination.hairstyle}`);
      if (combination.facialHair) promptParts.push(`Facial Hair: ${combination.facialHair}`);
      
      const description = `${promptParts.join('. ')}. Look details: ${combination.description}`;
      
      const imageUrl = await generateLookPreview(originalImageBase64, description);
      setGeneratedImage(imageUrl);
      setSliderPosition(50); // Reset slider to middle
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

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `stylescout-look-${combination.name.replace(/\s+/g, '-').toLowerCase()}.png`;
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
        const file = new File([blob], `stylescout-look-${combination.name.replace(/\s+/g, '-').toLowerCase()}.png`, { type: 'image/png' });

        await navigator.share({
          title: `My StyleScout Look: ${combination.name}`,
          text: `Check out this ${combination.name} look recommended for me by StyleScout AI!`,
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
    <div className="bg-gradient-to-br from-surface to-[#1F1F1F] rounded-xl overflow-hidden border border-gray-700 shadow-xl flex flex-col h-full relative group/card">
      <div className="p-6 flex-grow">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-2xl font-bold text-white tracking-tight">{combination.name}</h3>
          <div className="flex items-center gap-3">
             <button
              onClick={toggleSaveLook}
              className={`p-2 rounded-full transition-all duration-300 ${
                isSaved 
                  ? 'bg-red-500/20 text-red-500' 
                  : 'bg-surface/50 text-gray-400 hover:text-red-400 hover:bg-surface border border-transparent hover:border-gray-600'
              }`}
              aria-label={isSaved ? "Remove from saved looks" : "Save look"}
              title={isSaved ? "Remove from Saved" : "Save Look"}
            >
              <Heart className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
            </button>
            <Sparkles className="text-primary w-5 h-5" />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {combination.hairstyle && (
            <span className="bg-secondary px-3 py-1 rounded text-xs text-gray-300 border border-gray-700">
              {combination.hairstyle}
            </span>
          )}
          
          {combination.hairstyle && combination.facialHair && (
            <span className="text-gray-500 flex items-center">+</span>
          )}

          {combination.facialHair && (
            <span className="bg-secondary px-3 py-1 rounded text-xs text-gray-300 border border-gray-700">
              {combination.facialHair}
            </span>
          )}
        </div>

        <p className="text-gray-300 text-sm leading-relaxed mb-4">
          {combination.description}
        </p>
        
        <p className="text-xs text-gray-500 italic border-l-2 border-gray-700 pl-3">
          {combination.reasoning}
        </p>
      </div>

      <div className="p-6 pt-0 mt-auto space-y-4">
        {generatedImage ? (
          <div className="space-y-3 animate-fade-in">
            {/* COMPARISON SLIDER */}
            <div 
              ref={containerRef}
              className="relative rounded-lg overflow-hidden border border-gray-700 aspect-square group select-none"
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
                   style={{ width: containerRef.current?.offsetWidth || '100%' }}
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
            
            <div className="flex gap-2">
              <button 
                onClick={handleShare}
                className="flex-1 py-2 px-3 bg-primary text-secondary rounded-lg text-xs font-bold hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
              >
                <Share2 className="w-3 h-3" />
                Share Look
              </button>
              <button 
                onClick={() => setGeneratedImage(null)}
                className="py-2 px-3 bg-secondary border border-gray-600 text-gray-400 rounded-lg text-xs font-medium hover:text-white hover:border-gray-500 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
             {error && <p className="text-red-400 text-xs text-center">{error}</p>}
             <button
              onClick={handleVisualize}
              disabled={isGenerating}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2
                ${isGenerating 
                  ? 'bg-gray-800 text-gray-400 cursor-not-allowed' 
                  : 'bg-primary/10 text-primary hover:bg-primary hover:text-secondary border border-primary/20 hover:border-transparent'}
              `}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating New Look...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Visualize This Look
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-gray-600">
              Generates an AI preview of you with this style.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};