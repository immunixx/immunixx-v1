import { Activity, FileText, Upload, Microscope, ArrowRight, HeartPulse, FileSpreadsheet, Stethoscope } from 'lucide-react';

interface HomeProps {
  onStartAnalysis: () => void;
  onViewHistory: () => void;
}

function Home({ onStartAnalysis, onViewHistory }: HomeProps) {
  return (
    <div className="min-h-screen app-page-bg">

      <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-14 max-w-4xl">

        {/* ── HERO ── */}
        <div className="text-center mb-10 sm:mb-12 animate-fadeIn">

          {/* Floating microscope icon */}
          <div className="flex justify-center mb-8">
            <div className="animate-float w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center shadow-lg"
              style={{
                background: 'radial-gradient(circle at 35% 35%, #e8f5e9, #c8e6c9)',
                border: '3px solid #b8eac4',
                boxShadow: '0 4px 24px rgba(46,158,80,.22), 0 0 0 8px rgba(46,158,80,.06)',
              }}>
              <Microscope className="w-10 h-10 sm:w-12 sm:h-12 text-green-700" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-800 mb-5 leading-tight tracking-tight">
            Smart White Blood Cell Analyzer
          </h1>
          <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            A refined image-driven platform for precise white blood cell classification and analysis.
            Upload your blood smear images to receive instant, detailed WBC differential count reports.
          </p>
        </div>

        {/* ── HIGHLIGHT CARDS ── */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-3 mb-12">
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-green-100">
            <HeartPulse className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">Faster Clinical Insight</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              We help healthcare providers reduce diagnostic delays and improve workflow efficiency.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-green-100">
            <FileSpreadsheet className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">Structured Reporting</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              The platform generates detailed WBC reports that can be downloaded and reviewed later.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-green-100">
            <Stethoscope className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">Accessible Analysis</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Our goal is to make high-quality blood analysis more accessible beyond centralized laboratories.
            </p>
          </div>
        </div>

        {/* ── FEATURE CARDS ── */}
        <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mb-12">

          {/* CARD 1: Upload Image — CLICKABLE */}
          <button
            onClick={onStartAnalysis}
            className="bg-white rounded-2xl p-6 sm:p-8 text-center flex flex-col items-center gap-4 cursor-pointer
                       transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl animate-slideUp group relative"
            style={{
              boxShadow: '0 4px 20px rgba(46,158,80,.14), 0 2px 6px rgba(0,0,0,.06)',
              borderTop: '4px solid #2e9e50',
              animationDelay: '0ms',
              border: '1px solid #dcf5e3',
              borderTopWidth: '4px',
              outline: 'none',
            }}
          >
            {/* Pulse ring to invite click */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-green-300 opacity-30 scale-125"
                style={{ animation: 'pulseDot 2s ease-in-out infinite' }} />
              <div className="w-14 h-14 rounded-full bg-green-100 group-hover:bg-green-200 flex items-center justify-center transition-colors relative z-10">
                <Upload className="w-7 h-7 text-green-600" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-800">Upload Image</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Upload blood smear images in JPG or PNG format for analysis</p>
            {/* Click hint */}
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full
                             group-hover:bg-green-100 transition-colors">
              Click to Upload <ArrowRight className="w-3 h-3" />
            </span>
          </button>

          {/* CARD 2: Smart Analysis — info only, points to upload */}
          <div
            className="bg-white rounded-2xl p-6 sm:p-8 text-center flex flex-col items-center gap-4 cursor-default
                       transition-all duration-300 hover:-translate-y-2 animate-slideUp relative"
            style={{
              boxShadow: '0 4px 20px rgba(46,158,80,.08), 0 2px 6px rgba(0,0,0,.04)',
              borderTop: '4px solid #2e9e50',
              animationDelay: '80ms',
            }}
          >
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <Activity className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Smart Analysis</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Structured classification of five WBC types with confidence scoring</p>
            <span className="text-xs text-gray-400 italic">Runs after upload →</span>
          </div>

          {/* CARD 3: Download Report — CLICKABLE */}
          <button
            onClick={onViewHistory}
            className="bg-white rounded-2xl p-6 sm:p-8 text-center flex flex-col items-center gap-4 cursor-pointer
                       transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl animate-slideUp group relative"
            style={{
              boxShadow: '0 4px 20px rgba(46,158,80,.14), 0 2px 6px rgba(0,0,0,.06)',
              borderTop: '4px solid #2e9e50',
              animationDelay: '160ms',
              border: '1px solid #dcf5e3',
              borderTopWidth: '4px',
              outline: 'none',
            }}
          >
            <div className="w-14 h-14 rounded-full bg-green-100 group-hover:bg-green-200 flex items-center justify-center transition-colors">
              <FileText className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Download Report</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Get comprehensive PDF reports with detailed analysis results</p>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full
                             group-hover:bg-green-100 transition-colors">
              View Records <ArrowRight className="w-3 h-3" />
            </span>
          </button>

        </div>

        {/* ── CTA BUTTON ── */}
        <div className="text-center mb-14 sm:mb-20">
          <button
            id="start-analysis-btn"
            onClick={onStartAnalysis}
            className="btn-primary-brand inline-flex items-center gap-3 text-white font-bold text-lg px-12 py-4 rounded-full
                       transition-all duration-300 hover:-translate-y-1 active:translate-y-0"
          >
            <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Start Analysis
          </button>
        </div>

      </div>

      {/* ── FOOTER ── */}
      <footer className="text-center py-5 text-xs text-gray-400 border-t border-green-100 bg-white mt-6">
        © 2026 Immunixx WBC Platform &nbsp;|&nbsp; For Research &amp; Educational Purposes Only
      </footer>
    </div>
  );
}

export default Home;
