export interface StyleRecommendation {
  name: string;
  description: string;
  reasoning: string;
}

export interface StyleCombination {
  name: string;
  description: string;
  hairstyle: string;
  facialHair: string;
  reasoning: string;
}

export interface AnalysisResult {
  faceShape: string;
  faceAnalysis: string;
  hairstyles: StyleRecommendation[];
  facialHair: StyleRecommendation[];
  combinations: StyleCombination[];
  groomingTips: string[];
}

export enum AppState {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR'
}

export enum AnalysisMode {
  COMPLETE = 'COMPLETE',
  HAIRSTYLE_ONLY = 'HAIRSTYLE_ONLY',
  FACIAL_HAIR_ONLY = 'FACIAL_HAIR_ONLY'
}

export interface UploadedImage {
  file: File;
  previewUrl: string;
  base64: string;
}