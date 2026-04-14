import { useState, useEffect } from 'react';
import { Download, CheckCircle, AlertCircle, FileText, RotateCcw, Loader2 } from 'lucide-react';
import { AnalysisResult } from '../types';
import { WBC_TYPES } from '../services/api';
import { historyService } from '../services/history';

interface ResultsProps {
  results: AnalysisResult;
  imagePreview: string;
  onNewAnalysis: () => void;
}

// Normal ranges
const NORMAL_RANGES: Record<string, { min: number; max: number; label: string }> = {
  Neutrophil:  { min: 40, max: 60, label: '40–60%' },
  Lymphocyte:  { min: 20, max: 40, label: '20–40%' },
  Monocyte:    { min: 2,  max: 8,  label: '2–8%'   },
  Eosinophil:  { min: 1,  max: 4,  label: '1–4%'   },
  Basophil:    { min: 0.5,max: 1,  label: '0.5–1%' },
};

const CELL_COLORS = ['#3b82f6','#22c55e','#f59e0b','#ec4899','#8b5cf6'];

function isNormal(pct: number, type: string): boolean {
  const r = NORMAL_RANGES[type];
  return r ? pct >= r.min && pct <= r.max : true;
}

function Results({ results, imagePreview, onNewAnalysis }: ResultsProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const displayImage = imagePreview || results.image_path;

  const dominantInfo = WBC_TYPES.find(w => w.cell_type === results.dominant_type);
  const maxCount = Math.max(...results.cell_types.map(c => c.count));
  const overallStatus = results.cell_types.every(c => isNormal(c.percentage, c.cell_type)) ? 'Normal' : 'Review Required';

  useEffect(() => {
    // Save to history when results are viewed
    historyService.saveResult(results);
  }, [results]);

  // ── PDF GENERATION ─────────────────────────────────────────────────────
  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      await import('../services/pdf').then(m => m.generatePDFReport(results, displayImage));
      setDownloaded(true);
    } catch (err) {
      console.error('PDF generation failed', err);
      alert('PDF generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen pb-16 app-page-bg">

      {/* Header with step indicators */}
      <div className="text-center pt-12 pb-6 px-4">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
          Analysis Complete
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight">WBC Analysis Results</h1>
        <p className="text-gray-500 mt-2 text-sm">Patient ID: <span className="font-bold text-gray-700">{results.patient_id}</span></p>

        {/* Step indicators */}
        <div className="flex items-center justify-center mt-6">
          {['Upload','Analyze','Report'].map((label, i) => (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 ${
                  i < 2 ? 'bg-green-100 text-green-700 border-green-400'
                        : 'bg-green-500 text-white border-green-300 shadow-md shadow-green-200'
                }`}>
                  {i < 2 ? <CheckCircle className="w-5 h-5" /> : '3'}
                </div>
                <span className={`text-xs mt-1.5 font-semibold ${i === 2 ? 'text-green-700' : 'text-green-500'}`}>{label}</span>
              </div>
              {i < 2 && <div className="w-16 md:w-24 h-0.5 mb-4 mx-1 connector-fill" />}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">

        {/* ── PRIMARY RESULT CARD ── */}
        <div className="pro-surface rounded-3xl p-5 sm:p-7 animate-slideUp">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <h2 className="text-xl font-bold text-gray-800">Primary WBC Detected</h2>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${
              overallStatus === 'Normal'
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-orange-50 text-orange-700 border-orange-200'
            }`}>
              {overallStatus === 'Normal' ? '✓' : '!'} {overallStatus}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Image */}
            <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
              {displayImage ? (
                <img src={displayImage} alt="Blood smear" className="w-full h-44 sm:h-52 object-cover rounded-xl shadow-sm" />
              ) : (
                <div className="w-full h-44 sm:h-52 rounded-xl border border-dashed border-gray-300 bg-white flex items-center justify-center text-sm text-gray-400">
                  No uploaded image available
                </div>
              )}
              <p className="text-xs text-center text-gray-400 mt-2">Uploaded Blood Smear</p>
            </div>

            {/* Key stats */}
            <div className="flex flex-col gap-4">
              <div className="bg-green-50 rounded-2xl p-5 border border-green-100">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">WBC Type Detected</p>
                <p className="text-2xl font-extrabold text-green-700">{results.dominant_type}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full"
                      style={{ width: `${(results.dominant_confidence * 100).toFixed(0)}%`,
                               background: 'linear-gradient(90deg,#4caf6a,#2e9e50)',
                               animation: 'growBar 1.2s ease both' }} />
                  </div>
                  <span className="text-green-700 font-bold text-sm">{(results.dominant_confidence * 100).toFixed(1)}%</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Confidence Score</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-xs text-gray-500 mb-1">Total WBC</p>
                  <p className="text-2xl font-extrabold text-blue-700">{results.total_count}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                  <p className="text-xs text-gray-500 mb-1">Processing</p>
                  <p className="text-2xl font-extrabold text-purple-700">{results.results.processing_time}s</p>
                </div>
                <div className="col-span-2 bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                  <p className="text-xs text-gray-500">Model: <span className="font-bold text-gray-700">{results.results.model_version}</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* WBC description */}
          {dominantInfo && (
            <div className="mt-5 bg-green-50 border-l-4 border-green-500 rounded-r-xl px-5 py-4 text-sm text-gray-600 leading-relaxed">
              <strong className="text-green-800">{dominantInfo.cell_type}:</strong> {dominantInfo.description}
            </div>
          )}
        </div>

        {/* ── DIFFERENTIAL COUNT TABLE ── */}
        <div className="pro-surface rounded-3xl p-7 animate-slideUp" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-xl font-bold text-gray-800 mb-5">WBC Differential Count</h2>
          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'linear-gradient(90deg,#2e9e50,#388e3c)' }}>
                  {['Cell Type','Count','Percentage','Normal Range','Confidence','Status'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-white font-semibold text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.cell_types.map((cell, idx) => {
                  const normal = isNormal(cell.percentage, cell.cell_type);
                  return (
                    <tr key={cell.cell_type} className={idx % 2 === 0 ? 'bg-green-50/50' : 'bg-white'}>
                      <td className="px-5 py-3.5 font-semibold text-gray-800 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: CELL_COLORS[idx] }} />
                        {cell.cell_type}
                      </td>
                      <td className="px-5 py-3.5 text-gray-700">{cell.count}</td>
                      <td className="px-5 py-3.5 font-bold" style={{ color: normal ? '#15803d' : '#c2410c' }}>
                        {cell.percentage.toFixed(2)}%
                      </td>
                      <td className="px-5 py-3.5 text-gray-500">{NORMAL_RANGES[cell.cell_type]?.label}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-block bg-blue-100 text-blue-700 px-3 py-0.5 rounded-full text-xs font-bold">
                          {(cell.confidence * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {normal ? (
                          <span className="inline-flex items-center gap-1 text-green-600 font-bold text-xs">
                            <CheckCircle className="w-3.5 h-3.5" /> Normal
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-orange-600 font-bold text-xs">
                            <AlertCircle className="w-3.5 h-3.5" /> Review
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── VISUAL DISTRIBUTION ── */}
        <div className="pro-surface rounded-3xl p-7 animate-slideUp" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-xl font-bold text-gray-800 mb-6">Visual Distribution</h2>
          <div className="space-y-5">
            {results.cell_types.map((cell, idx) => {
              const width = maxCount > 0 ? (cell.count / maxCount) * 100 : 0;
              return (
                <div key={cell.cell_type}>
                  <div className="flex justify-between mb-1.5 text-sm">
                    <span className="font-semibold text-gray-700 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: CELL_COLORS[idx] }} />
                      {cell.cell_type}
                    </span>
                    <span className="text-gray-500">{cell.count} cells ({cell.percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="h-5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full flex items-center justify-end pr-2 text-white text-xs font-bold"
                      style={{ width: `${width}%`, background: CELL_COLORS[idx], animation: 'growBar 1s ease both', animationDelay: `${idx * 0.1}s` }}>
                      {cell.count}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── DOWNLOAD REPORT ── */}
        <div className="pro-surface rounded-3xl p-7 animate-slideUp" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Download Full Report</h2>
              <p className="text-sm text-gray-400">PDF includes: image, classification, confidence scores, date & disclaimer</p>
            </div>
          </div>

          {downloaded && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4 text-sm text-green-700 font-semibold animate-fadeIn">
              <CheckCircle className="w-5 h-5" /> Report downloaded successfully!
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className={`flex-1 flex items-center justify-center gap-3 text-white font-bold py-4 rounded-full text-base transition-all duration-300 ${
                !isGenerating ? 'btn-primary-brand' : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isGenerating
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating PDF…</>
                : <><Download className="w-5 h-5" /> Download PDF Report</>
              }
            </button>
            <button
              onClick={onNewAnalysis}
              className="flex-1 flex items-center justify-center gap-3 font-bold py-4 rounded-full text-base border-2 border-green-500 text-green-700 hover:bg-green-50 transition-colors"
            >
              <RotateCcw className="w-5 h-5" /> New Analysis
            </button>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 flex items-start gap-3 text-sm animate-slideUp" style={{ animationDelay: '0.4s' }}>
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-yellow-800 mb-1">Important Notice</p>
            <p className="text-yellow-700 leading-relaxed">
              This analysis is generated by an automated classification workflow for research and educational purposes only.
              It should not be used as a substitute for professional medical diagnosis or treatment.
              Always consult a qualified healthcare provider.
            </p>
          </div>
        </div>
      </div>

      <style>{`@keyframes growBar{from{width:0%}}`}</style>
    </div>
  );
}

export default Results;
