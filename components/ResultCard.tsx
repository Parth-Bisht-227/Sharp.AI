import React, { useState } from 'react';
import { StyleRecommendation } from '../types';
import { Info, ImageOff, Maximize2, X } from 'lucide-react';

interface ResultCardProps {
  recommendation: StyleRecommendation;
  type: 'hair' | 'beard';
}

const BASE_URL = 'https://raw.githubusercontent.com/Parth-Bisht-227/StyleScout-AI/main/public/styles/';

// Map of style keywords to HOSTED GitHub Raw image paths
const STYLE_IMAGES: Record<string, string> = {
  // --- HAIRSTYLES ---
  'crop': `${BASE_URL}texturedcrop.jpg`,
  'french': `${BASE_URL}texturedcrop.jpg`,
  'textured': `${BASE_URL}texturedcrop.jpg`,
  
  'quiff': `${BASE_URL}quiff.jpg`,
  'brush up': `${BASE_URL}quiff.jpg`,
  'volume': `${BASE_URL}quiff.jpg`,

  'fade': `${BASE_URL}fade.jpg`,
  'taper': `${BASE_URL}fade.jpg`,
  'skin': `${BASE_URL}fade.jpg`, 
  
  'side part': `${BASE_URL}sidepart.jpg`,
  'comb over': `${BASE_URL}sidepart.jpg`,
  'classic': `${BASE_URL}sidepart.jpg`,
  'ivy league': `${BASE_URL}sidepart.jpg`,

  'undercut': `${BASE_URL}undercut.jpg`,
  'disconnected': `${BASE_URL}undercut.jpg`,

  'buzz': `${BASE_URL}buzzcut.jpg`,
  'military': `${BASE_URL}buzzcut.jpg`,
  'high and tight': `${BASE_URL}buzzcut.jpg`,
  'burr': `${BASE_URL}buzzcut.jpg`,

  'crew': `${BASE_URL}crewcut.jpg`,
  
  'fringe': `${BASE_URL}fringeforward.jpg`,
  'bangs': `${BASE_URL}fringeforward.jpg`,

  'pompadour': `${BASE_URL}pompadour.jpg`,
  
  'slick': `${BASE_URL}slickback.jpg`,
  
  'long': `${BASE_URL}longhairwavy.jpg`,
  'wavy': `${BASE_URL}longhairwavy.jpg`,
  'flow': `${BASE_URL}longhairwavy.jpg`,
  'surfer': `${BASE_URL}longhairwavy.jpg`,

  'bun': `${BASE_URL}manbun.jpg`,
  'top knot': `${BASE_URL}manbun.jpg`,
  
  'curly': `${BASE_URL}curly.jpg`,
  'coils': `${BASE_URL}curly.jpg`,
  
  'afro': `${BASE_URL}afro.jpg`,
  
  'braid': `${BASE_URL}braidscornrows.jpg`,
  'cornrow': `${BASE_URL}braidscornrows.jpg`,
  'plaits': `${BASE_URL}braidscornrows.jpg`,
  
  'dread': `${BASE_URL}dreadlocks.jpg`,
  'locs': `${BASE_URL}dreadlocks.jpg`,
  
  'caesar': `${BASE_URL}caesarcut.jpg`,
  
  'spiky': `${BASE_URL}spiky.jpg`,
  'faux hawk': `${BASE_URL}spiky.jpg`, 

  // --- FACIAL HAIR ---
  'clean': `${BASE_URL}cleanshaven.jpg`, 
  'shaven': `${BASE_URL}cleanshaven.jpg`, 
  'none': `${BASE_URL}cleanshaven.jpg`, 
  'bald': `${BASE_URL}cleanshaven.jpg`,

  'stubble': `${BASE_URL}stubbleheavy.jpg`,
  'shadow': `${BASE_URL}stubbleheavy.jpg`,
  'scruff': `${BASE_URL}stubbleheavy.jpg`,

  'full beard': `${BASE_URL}fullbeard.jpg`,
  'lumberjack': `${BASE_URL}fullbeard.jpg`,

  'short beard': `${BASE_URL}shortbeardboxed.jpg`,
  'boxed': `${BASE_URL}shortbeardboxed.jpg`,
  'corporate': `${BASE_URL}shortbeardboxed.jpg`,
  'verdi': `${BASE_URL}shortbeardboxed.jpg`,

  'goatee': `${BASE_URL}goateefull.jpg`,
  'circle': `${BASE_URL}goateefull.jpg`,

  'mustache': `${BASE_URL}mustachechevron.jpg`,
  'moustache': `${BASE_URL}mustachechevron.jpg`,
  'stache': `${BASE_URL}mustachechevron.jpg`,
  'chevron': `${BASE_URL}mustachechevron.jpg`,

  'van dyke': `${BASE_URL}vandyke.jpg`,
  
  'anchor': `${BASE_URL}anchor.jpg`,
  
  'balbo': `${BASE_URL}balbo.jpg`,
  
  'mutton': `${BASE_URL}muttonchopsfriendly.jpg`,
  'chops': `${BASE_URL}muttonchopsfriendly.jpg`,
  
  'sideburn': `${BASE_URL}sideburnsprominent.jpg`,
  'burns': `${BASE_URL}sideburnsprominent.jpg`,
  
  'chin strap': `${BASE_URL}chinstrap.jpg`,
  'strap': `${BASE_URL}chinstrap.jpg`,
};

// Fallback images (Unsplash)
const DEFAULT_HAIR = 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=1000&auto=format&fit=crop';
const DEFAULT_BEARD = 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80';

const getStyleImage = (name: string, type: 'hair' | 'beard'): string => {
  const lowerName = name.toLowerCase().replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
  const keys = Object.keys(STYLE_IMAGES).sort((a, b) => b.length - a.length);
  const match = keys.find(keyword => lowerName.includes(keyword));
  
  if (match) {
    return STYLE_IMAGES[match];
  }
  
  return type === 'hair' ? DEFAULT_HAIR : DEFAULT_BEARD;
};

export const ResultCard: React.FC<ResultCardProps> = ({ recommendation, type }) => {
  const [imgSrc, setImgSrc] = useState<string>(getStyleImage(recommendation.name, type));
  const [hasError, setHasError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  React.useEffect(() => {
    setImgSrc(getStyleImage(recommendation.name, type));
    setHasError(false);
  }, [recommendation.name, type]);

  const handleError = () => {
    const fallback = type === 'hair' ? DEFAULT_HAIR : DEFAULT_BEARD;
    
    // INSTANT SWAP: If hosted image fails, switch to fallback
    if (imgSrc !== fallback) {
      setImgSrc(fallback);
    } else {
      // Only error out if the fallback also fails
      setHasError(true);
    }
  };

  return (
    <>
      <div className="bg-surface rounded-lg border border-gray-700 hover:border-primary/50 transition-colors shadow-lg overflow-hidden flex flex-col h-full group/card">
        {/* Clickable Image Container */}
        <div 
          className="h-48 w-full relative overflow-hidden bg-gray-800 cursor-pointer"
          onClick={() => !hasError && setIsModalOpen(true)}
        >
          {!hasError ? (
            <>
              <img 
                src={imgSrc} 
                alt={recommendation.name} 
                className="w-full h-full object-cover opacity-90 group-hover/card:opacity-100 group-hover/card:scale-105 transition-all duration-700"
                onError={handleError}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center">
                <Maximize2 className="text-white w-8 h-8 drop-shadow-lg" />
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600 bg-gray-900">
              <div className="text-center p-4">
                 <ImageOff className="w-8 h-8 opacity-50 mx-auto mb-2" />
                 <span className="text-xs opacity-50">Image unavailable</span>
              </div>
            </div>
          )}
          <div className="absolute top-3 right-3 pointer-events-none">
            <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-secondary/90 text-gray-200 font-semibold backdrop-blur-sm border border-gray-600`}>
              {type}
            </span>
          </div>
        </div>
        
        <div className="p-6 pt-4 flex-grow flex flex-col">
          <h3 className="text-xl font-bold text-primary mb-3">{recommendation.name}</h3>
          
          <p className="text-gray-300 mb-6 text-sm leading-relaxed flex-grow">
            {recommendation.description}
          </p>
          
          <div className="bg-secondary/50 rounded-lg p-4 border-l-2 border-primary mt-auto">
            <div className="flex items-start gap-3">
               <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
               <p className="text-xs text-gray-400 italic leading-relaxed">
                 <span className="font-bold text-gray-300 not-italic block mb-1">Why it works</span>
                 {recommendation.reasoning}
               </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-secondary rounded-xl overflow-hidden max-w-4xl w-full max-h-[90vh] shadow-2xl flex flex-col border border-gray-700">
             <div className="absolute top-4 right-4 z-10">
               <button onClick={() => setIsModalOpen(false)} className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors">
                 <X className="w-6 h-6" />
               </button>
             </div>
             <div className="flex-grow overflow-hidden bg-black flex items-center justify-center">
               <img 
                 src={imgSrc} 
                 alt={recommendation.name} 
                 className="max-w-full max-h-[75vh] object-contain"
               />
             </div>
             <div className="p-6 bg-secondary border-t border-gray-800">
               <h3 className="text-2xl font-bold text-primary">{recommendation.name}</h3>
               <p className="text-gray-300 mt-2">{recommendation.description}</p>
             </div>
          </div>
        </div>
      )}
    </>
  );
};