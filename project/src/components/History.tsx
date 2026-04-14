import { useState, useEffect } from 'react';
import { historyService } from '../services/history';
import { generatePDFReport } from '../services/pdf';
import { AnalysisResult } from '../types';
import { FileText, Download, Trash2, Eye, Calendar, Microscope, ArrowLeft } from 'lucide-react';

interface HistoryProps {
  onBack: () => void;
  onViewResult: (result: AnalysisResult) => void;
}

function History({ onBack, onViewResult }: HistoryProps) {
  const [records, setRecords] = useState<AnalysisResult[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    setRecords(historyService.getHistory());
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this record?')) {
      historyService.deleteResult(id);
      setRecords(historyService.getHistory());
    }
  };

  const handleDownload = async (record: AnalysisResult, e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloadingId(record.id);
    try {
      await generatePDFReport(record);
    } catch (err) {
      alert('Failed to generate PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="min-h-screen pb-16 app-page-bg">
      
      {/* Header */}
      <div className="text-center pt-12 pb-8 px-4">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
          Records
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight">Analysis History</h1>
        <p className="text-gray-500 mt-2 text-sm">View and download your past WBC analysis reports</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <button onClick={onBack}
          className="flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold mb-6 text-sm transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
        </button>

        {records.length === 0 ? (
          <div className="pro-surface rounded-3xl p-16 text-center animate-fadeIn">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No Records Found</h2>
            <p className="text-gray-400 mb-8 max-w-sm mx-auto">You haven't performed any analyses yet. Start a new analysis to see it here.</p>
            <button onClick={onBack} className="bg-green-600 text-white font-bold px-8 py-3 rounded-full hover:bg-green-700 transition-all">
              Start Analysis Now
            </button>
          </div>
        ) : (
          <div className="grid gap-4 animate-slideUp">
            {records.map((record) => (
              <div 
                key={record.id}
                onClick={() => onViewResult(record)}
                className="pro-surface rounded-2xl p-4 sm:p-5 md:p-6 hover:border-green-300 hover:shadow-md transition-all cursor-pointer group flex flex-col md:flex-row md:items-center gap-4 md:gap-6"
              >
                <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Microscope className="w-7 h-7 text-green-600" />
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-0.5">Patient ID</span>
                    <span className="font-bold text-gray-800 truncate">{record.patient_id}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-0.5">Date & Time</span>
                    <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(record.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-0.5">Primary WBC</span>
                    <span className="font-semibold text-green-700">{record.dominant_type}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:border-l md:pl-6 border-gray-100">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onViewResult(record); }}
                    className="p-2.5 bg-gray-50 text-gray-500 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={(e) => handleDownload(record, e)}
                    disabled={downloadingId === record.id}
                    className="p-2.5 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-lg transition-all"
                    title="Download PDF"
                  >
                    {downloadingId === record.id ? (
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Download className="w-5 h-5" />
                    )}
                  </button>
                  <button 
                    onClick={(e) => handleDelete(record.id, e)}
                    className="p-2.5 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                    title="Delete Record"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default History;
