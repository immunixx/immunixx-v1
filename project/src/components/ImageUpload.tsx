import { useState, useRef } from 'react';
import { Upload, X, AlertCircle, CheckCircle, ArrowLeft, FileText, Activity } from 'lucide-react';

interface ImageUploadProps {
  onImageSelect: (file: File, preview: string) => void;
  onBack: () => void;
}

// ── Canvas-based WBC color analysis ──────────────────────────────────────────
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rN = r / 255, gN = g / 255, bN = b / 255;
  const max = Math.max(rN, gN, bN), min = Math.min(rN, gN, bN);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rN) h = ((gN - bN) / d) % 6;
  else if (max === gN) h = (bN - rN) / d + 2;
  else h = (rN - gN) / d + 4;
  h = h * 60;
  if (h < 0) h += 360;
  return [h, s, l];
}

function detectWBCImage(dataUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const SIZE = 120;
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(true); return; } // fail-open
      ctx.drawImage(img, 0, 0, SIZE, SIZE);
      const { data } = ctx.getImageData(0, 0, SIZE, SIZE);
      const total = SIZE * SIZE;

      let lightPx = 0;   // white/light pink background
      let purplePx = 0;  // nuclei (Giemsa stain – violet/purple)
      let pinkPx = 0;    // cytoplasm / eosin stain
      let greenPx = 0;   // strong green (nature/scene images)
      let bluePx = 0;    // strong blue (sky / non-medical)

      for (let i = 0; i < data.length; i += 4) {
        const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);

        if (l > 0.78) { lightPx++; continue; }

        if (s > 0.12) {
          if (h >= 260 && h <= 330)              purplePx++;  // purple/violet
          if ((h >= 330 || h <= 25) && l > 0.35) pinkPx++;   // pink/magenta
          if (h >= 80 && h <= 165 && s > 0.20)   greenPx++;  // natural green
          if (h >= 190 && h <= 255 && s > 0.25)  bluePx++;   // sky/deep blue
        }
      }

      const lightR  = lightPx  / total;
      const purpleR = purplePx / total;
      const pinkR   = pinkPx   / total;
      const greenR  = greenPx  / total;
      const blueR   = bluePx   / total;

      // WBC smear: lots of light bg + purple and/or pink stain
      const hasWBCColors = lightR > 0.30 && (purpleR > 0.015 || pinkR > 0.025);
      // Reject images that are dominated by natural green/blue and lack light bg
      const looksNatural = (greenR > 0.25 || blueR > 0.30) && lightR < 0.30;

      resolve(hasWBCColors && !looksNatural);
    };
    img.onerror = () => resolve(false);
    img.src = dataUrl;
  });
}

// ── Component ─────────────────────────────────────────────────────────────────
function ImageUpload({ onImageSelect, onBack }: ImageUploadProps) {
  const [preview, setPreview]           = useState<string | null>(null);
  const [fileName, setFileName]         = useState('');
  const [fileSize, setFileSize]         = useState('');
  const [isDragging, setIsDragging]     = useState(false);
  const [validating, setValidating]     = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef                    = useRef<HTMLInputElement>(null);
  const selectedFile                    = useRef<File | null>(null);

  const fmt = (b: number) =>
    b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(2)} MB`;

  const processFile = async (file: File) => {
    // Basic type/size check
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      setError('Invalid file type. Please upload a JPG or PNG image.');
      setUploadSuccess(false);
      setPreview(null);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10 MB.');
      setUploadSuccess(false);
      setPreview(null);
      return;
    }

    // Read file
    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result as string;

      setValidating(true);
      setError(null);
      setUploadSuccess(false);

      const isWBC = await detectWBCImage(dataUrl);

      setValidating(false);

      if (!isWBC) {
        setError(
          '⚠️ Invalid Image — This does not appear to be a WBC blood smear image. ' +
          'Please upload a properly stained microscopy image of white blood cells.'
        );
        setPreview(null);
        selectedFile.current = null;
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      selectedFile.current = file;
      setFileName(file.name);
      setFileSize(fmt(file.size));
      setPreview(dataUrl);
      setUploadSuccess(true);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  };
  const handleDragOver  = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop      = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  };
  const handleClear = () => {
    setPreview(null); setFileName(''); setFileSize('');
    setError(null); setUploadSuccess(false);
    selectedFile.current = null;
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const handleAnalyze = () => {
    if (preview && selectedFile.current) onImageSelect(selectedFile.current, preview);
  };

  return (
    <div className="min-h-screen pb-16 app-page-bg">

      {/* ── PAGE HEADER ── */}
      <div className="text-center pt-10 sm:pt-12 pb-4 px-4">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
          Demo
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight">
          Smart White Blood Cell Analysis for Faster Clinical Decisions
        </h1>
        <p className="text-gray-500 mt-3 text-sm md:text-base max-w-3xl mx-auto leading-relaxed">
          Immunixx provides rapid, image-based blood smear analysis to support hospitals and diagnostic laboratories in delivering timely and reliable patient care.
        </p>
        <p className="text-gray-500 mt-3 text-sm md:text-base max-w-3xl mx-auto leading-relaxed">
          Our platform transforms microscopic blood smear images into structured clinical insights, helping healthcare professionals detect abnormalities quickly and confidently.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => document.getElementById('upload-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="btn-primary-brand inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-bold text-white transition-all"
          >
            Request Demo
          </button>
          <a
            href="mailto:partners@immunixx.com?subject=Partner%20With%20Us"
            className="btn-secondary-brand inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-bold transition-all"
          >
            Partner With Us
          </a>
        </div>
      </div>

      {/* ── WIREFLOW DIAGRAM ── */}
      <div className="px-4 py-6 max-w-3xl mx-auto overflow-x-auto">
        <div className="flex items-center justify-center gap-0 min-w-[640px]">

        {/* STEP 1 */}
        <div className={`flex flex-col items-center gap-2 transition-all duration-300`}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md"
            style={{ background: 'linear-gradient(135deg,#2e9e50,#1d8a3e)', boxShadow: '0 4px 16px rgba(46,158,80,.35)' }}>
            <Upload className="w-7 h-7 text-white" />
          </div>
          <span className="text-xs font-bold text-green-700">Upload Image</span>
          <span className="text-xs text-gray-400 text-center max-w-[80px]">JPG / PNG</span>
        </div>

        {/* Arrow 1→2 */}
        <div className="flex flex-col items-center mx-1 mb-5">
          <div className="flex items-center">
            <div className="w-8 md:w-14 h-0.5 bg-gradient-to-r from-green-400 to-green-300" />
            <svg viewBox="0 0 12 12" fill="none" className="w-4 h-4 flex-shrink-0 -ml-1">
              <path d="M2 6h8M7 3l3 3-3 3" stroke="#4caf6a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xs text-gray-300 mt-1">validates</span>
        </div>

        {/* STEP 2 */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: preview ? 'linear-gradient(135deg,#2e9e50,#1d8a3e)' : '#e5e7eb',
                     boxShadow: preview ? '0 4px 16px rgba(46,158,80,.35)' : 'none',
                     transition: 'all 0.4s ease' }}>
            <Activity className={`w-7 h-7 ${preview ? 'text-white' : 'text-gray-400'}`} />
          </div>
          <span className={`text-xs font-bold ${preview ? 'text-green-700' : 'text-gray-400'}`}>Smart Analysis</span>
          <span className="text-xs text-gray-400 text-center max-w-[80px]">CNN Model</span>
        </div>

        {/* Arrow 2→3 */}
        <div className="flex flex-col items-center mx-1 mb-5">
          <div className="flex items-center">
            <div className={`w-8 md:w-14 h-0.5 ${preview ? 'bg-gradient-to-r from-green-400 to-green-300' : 'bg-gray-200'}`}
              style={{ transition: 'background 0.4s ease' }} />
            <svg viewBox="0 0 12 12" fill="none" className="w-4 h-4 flex-shrink-0 -ml-1">
              <path d="M2 6h8M7 3l3 3-3 3" stroke={preview ? '#4caf6a' : '#d1d5db'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xs text-gray-300 mt-1">generates</span>
        </div>

        {/* STEP 3 */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: '#e5e7eb' }}>
            <FileText className="w-7 h-7 text-gray-400" />
          </div>
          <span className="text-xs font-bold text-gray-400">Download Report</span>
          <span className="text-xs text-gray-400 text-center max-w-[80px]">PDF Report</span>
        </div>
        </div>
      </div>

      {/* ── STEP INDICATOR BAR ── */}
      <div className="flex items-center justify-center mb-6">
        {['Upload', 'Analyze', 'Report'].map((label, i) => (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 ${
                i === 0
                  ? 'bg-green-500 text-white border-green-300 shadow-sm shadow-green-200'
                  : 'bg-gray-100 text-gray-400 border-gray-200'
              }`}>{i + 1}</div>
              <span className={`text-xs mt-1 font-semibold ${i === 0 ? 'text-green-700' : 'text-gray-400'}`}>{label}</span>
            </div>
            {i < 2 && <div className="w-14 md:w-20 h-0.5 mb-4 mx-1"
              style={{ background: '#e5e7eb' }} />}
          </div>
        ))}
      </div>

      {/* ── MAIN CARD ── */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <button onClick={onBack}
          className="flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold mb-4 text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        <div id="upload-card" className="pro-surface rounded-3xl p-6 sm:p-8 md:p-10 animate-slideUp">

          <h2 className="text-xl font-bold text-gray-800 mb-1">Step 1: Upload Blood Smear Image</h2>
          <p className="text-sm text-gray-400 mb-6">Upload a Giemsa/Wright's stained blood smear microscopy image</p>

          {/* Upload zone */}
          {!preview ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
                isDragging ? 'border-green-500 bg-green-50 scale-[1.01]'
                           : 'border-green-300 hover:border-green-500 hover:bg-green-50'
              }`}
            >
              <div className="flex flex-col items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                  isDragging ? 'bg-green-200' : 'bg-green-100'
                }`}>
                  <Upload className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <p className="text-gray-700 font-medium">
                    Drag &amp; drop or {' '}
                    <span className="text-green-600 font-bold underline underline-offset-2">browse file</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG — Max 10 MB</p>
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png"
                onChange={handleInputChange} className="hidden" />
            </div>
          ) : (
            <div className="space-y-4 animate-fadeIn">
              <div className="relative bg-gray-50 rounded-2xl p-3 border border-gray-200">
                <button onClick={handleClear}
                  className="absolute top-3 right-3 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow transition-colors z-10">
                  <X className="w-4 h-4" />
                </button>
                <img src={preview} alt="Blood smear preview"
                  className="max-w-full max-h-64 mx-auto rounded-xl object-contain shadow-sm" />
              </div>
              <div className="flex items-center gap-3 bg-green-50 rounded-xl px-4 py-3 border border-green-100">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#2e9e50" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{fileName}</p>
                  <p className="text-xs text-gray-400">{fileSize}</p>
                </div>
              </div>
            </div>
          )}

          {/* Validating spinner */}
          {validating && (
            <div className="mt-5 flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 animate-fadeIn">
              <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              <p className="text-blue-700 text-sm font-medium">Validating image… checking for WBC blood smear…</p>
            </div>
          )}

          {/* Error — non-WBC or file issue */}
          {error && !validating && (
            <div className="mt-5 animate-fadeIn">
              <div className="flex items-start gap-3 bg-red-50 border border-red-300 rounded-2xl px-5 py-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <p className="text-red-700 font-bold text-sm mb-1">Invalid Image Detected</p>
                  <p className="text-red-600 text-sm leading-relaxed">{error}</p>
                  <div className="mt-3 bg-red-100 rounded-xl px-4 py-3 text-xs text-red-700">
                    <p className="font-semibold mb-1">✅ Valid WBC images look like:</p>
                    <ul className="space-y-0.5 list-disc list-inside">
                      <li>Light/white background (slide background)</li>
                      <li>Purple/violet stained nuclei (Giemsa stain)</li>
                      <li>Pink/magenta cytoplasm (eosin stain)</li>
                      <li>Taken from blood smear microscopy</li>
                    </ul>
                  </div>
                </div>
              </div>
              {/* Try again button */}
              <button
                onClick={() => { setError(null); fileInputRef.current?.click(); }}
                className="mt-3 w-full border-2 border-dashed border-red-300 hover:border-red-400 rounded-xl py-3 text-sm text-red-500 hover:text-red-600 font-semibold transition-colors"
              >
                🔄 Try Again — Upload a WBC Image
              </button>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png"
                onChange={handleInputChange} className="hidden" />
            </div>
          )}

          {/* Upload success */}
          {uploadSuccess && !error && (
            <div className="mt-5 flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 animate-fadeIn">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-green-700 text-sm font-semibold">
                ✅ WBC image validated successfully! Ready for analysis.
              </p>
            </div>
          )}

          {/* Analyze button */}
          {!error && (
            <button
              onClick={handleAnalyze}
              disabled={!preview || !!error || validating}
              className={`w-full mt-6 flex items-center justify-center gap-3 text-white font-bold py-4 rounded-full text-base transition-all duration-300 ${
                preview && !error && !validating
                  ? 'btn-primary-brand cursor-pointer'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              <Activity className="w-5 h-5" />
              {validating ? 'Validating…' : 'Analyze Image'}
            </button>
          )}

          {/* Guidelines */}
          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
            <h4 className="font-semibold text-blue-900 text-sm mb-2">📋 Image Guidelines</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Use high-quality blood smear microscopy images</li>
              <li>• Ensure proper Giemsa or Wright's staining is visible</li>
              <li>• Image should clearly show white blood cells with purple nuclei</li>
              <li>• Avoid blurry, dark, or low-resolution images</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageUpload;
