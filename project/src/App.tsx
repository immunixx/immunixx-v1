import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import SiteNavbar from './components/SiteNavbar';
import Home from './components/Home';
import ImageUpload from './components/ImageUpload';
import LoadingAnalysis from './components/LoadingAnalysis';
import Results from './components/Results';
import History from './components/History';
import { analyzeImage } from './services/api';
import { AnalysisResult } from './types';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [imagePreview, setImagePreview]   = useState<string>('');
  const pathname = location.pathname;

  const activeNavView = pathname === '/history'
    ? 'records'
    : pathname === '/about'
      ? 'about'
      : pathname === '/'
        ? 'home'
        : 'demo';

  useEffect(() => {
    if (pathname === '/about') {
      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [pathname]);

  const handleStartAnalysis = () => navigate('/demo');

  const handleGoHome = () => {
    navigate('/');
    setAnalysisResult(null);
    setImagePreview('');
  };

  const handleGoAbout = () => {
    navigate('/about');
    setAnalysisResult(null);
    setImagePreview('');
  };

  const handleGoDemo = () => {
    navigate('/demo');
    setAnalysisResult(null);
    setImagePreview('');
  };

  const handleImageSelect = async (file: File, preview: string) => {
    navigate('/loading');
    setImagePreview(preview);
    try {
      const result = await analyzeImage(file);
      setAnalysisResult({ ...result, image_path: preview });
      navigate('/results');
    } catch {
      navigate('/demo');
    }
  };

  const handleBackToHome = () => {
    navigate('/');
    setAnalysisResult(null);
    setImagePreview('');
  };

  const handleNewAnalysis = () => {
    navigate('/demo');
    setAnalysisResult(null);
    setImagePreview('');
  };

  const handleViewHistory = () => navigate('/history');

  const handleViewResult = (result: AnalysisResult) => {
    setAnalysisResult(result);
    setImagePreview(result.image_path || '');
    navigate('/results');
  };

  return (
    <div className="min-h-screen">
      <SiteNavbar
        activeView={activeNavView}
        onHome={handleGoHome}
        onAbout={handleGoAbout}
        onDemo={handleGoDemo}
        onRecords={handleViewHistory}
      />

      <Routes>
        <Route path="/" element={<Home onStartAnalysis={handleStartAnalysis} onViewHistory={handleViewHistory} />} />
        <Route path="/about" element={<Home onStartAnalysis={handleStartAnalysis} onViewHistory={handleViewHistory} />} />
        <Route path="/demo" element={<ImageUpload onImageSelect={handleImageSelect} onBack={handleBackToHome} />} />
        <Route path="/loading" element={<LoadingAnalysis />} />
        <Route
          path="/results"
          element={
            analysisResult
              ? <Results results={analysisResult} imagePreview={imagePreview} onNewAnalysis={handleNewAnalysis} />
              : <Navigate to="/demo" replace />
          }
        />
        <Route path="/history" element={<History onBack={handleBackToHome} onViewResult={handleViewResult} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
