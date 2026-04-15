import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import SiteNavbar from './components/SiteNavbar';
import Home from './components/Home';
import About from './components/About';
import PatientLogin from './components/PatientLogin';
import ImageUpload from './components/ImageUpload';
import LoadingAnalysis from './components/LoadingAnalysis';
import Results from './components/Results';
import History from './components/History';
import { analyzeImage } from './services/api';
import { AnalysisResult, PatientDetails } from './types';

const PATIENT_DETAILS_KEY = 'wbc_analyzer_patient_details';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [imagePreview, setImagePreview]   = useState<string>('');
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(() => {
    const stored = localStorage.getItem(PATIENT_DETAILS_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const pathname = location.pathname;

  const activeNavView = pathname === '/history'
    ? 'records'
    : pathname === '/about'
      ? 'about'
      : pathname === '/login'
        ? 'login'
      : pathname === '/'
        ? 'home'
        : 'demo';

  useEffect(() => {
    if (patientDetails) {
      localStorage.setItem(PATIENT_DETAILS_KEY, JSON.stringify(patientDetails));
    } else {
      localStorage.removeItem(PATIENT_DETAILS_KEY);
    }
  }, [patientDetails]);

  const handleStartAnalysis = () => navigate('/login');

  const handlePatientSave = (details: PatientDetails) => {
    setPatientDetails(details);
    setAnalysisResult(null);
    setImagePreview('');
    navigate('/demo');
  };

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
    navigate(patientDetails ? '/demo' : '/login');
    setAnalysisResult(null);
    setImagePreview('');
  };

  const handleImageSelect = async (file: File, preview: string) => {
    navigate('/loading');
    setImagePreview(preview);
    try {
      const result = await analyzeImage(file, patientDetails ?? undefined);
      setAnalysisResult({ ...result, image_path: preview, patient_details: patientDetails ?? undefined });
      navigate('/results');
    } catch {
      navigate(patientDetails ? '/demo' : '/login');
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
        <Route path="/about" element={<About onStartAnalysis={handleStartAnalysis} onViewHistory={handleViewHistory} />} />
        <Route
          path="/login"
          element={
            <PatientLogin
              initialDetails={patientDetails}
              onSave={handlePatientSave}
              onBack={handleGoHome}
            />
          }
        />
        <Route
          path="/demo"
          element={patientDetails
            ? <ImageUpload onImageSelect={handleImageSelect} onBack={handleBackToHome} />
            : <Navigate to="/login" replace />}
        />
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
