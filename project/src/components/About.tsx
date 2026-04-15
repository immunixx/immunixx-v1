import { ArrowRight, Activity, Microscope, FileText } from 'lucide-react';

interface AboutProps {
  onStartAnalysis: () => void;
  onViewHistory: () => void;
}

function About({ onStartAnalysis, onViewHistory }: AboutProps) {
  return (
    <div className="min-h-screen app-page-bg">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="text-center mb-10 sm:mb-12 animate-fadeIn">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center shadow-lg bg-[radial-gradient(circle_at_35%_35%,_#e8f5e9,_#c8e6c9)] border-[3px] border-[#b8eac4] shadow-[0_4px_24px_rgba(46,158,80,.22),_0_0_0_8px_rgba(46,158,80,.06)]">
              <Microscope className="w-10 h-10 sm:w-12 sm:h-12 text-green-700" />
            </div>
          </div>

          <span className="inline-block bg-green-100 text-green-700 text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-3">
            About
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-800 mb-5 leading-tight tracking-tight">
            About Immunixx
          </h1>
          <p className="text-base sm:text-lg text-gray-500 max-w-3xl mx-auto leading-relaxed">
            Immunixx is designed to support early detection of white blood cell abnormalities, especially low neutrophil levels that can indicate neutropenia and infection risk.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-3 mb-8">
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-green-100">
            <Activity className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">Early Neutropenia Detection</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Our analyzer helps flag low neutrophil patterns early, giving clinicians faster visibility into possible neutropenia.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-green-100">
            <FileText className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">ANC-Based Screening</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Doctors use Absolute Neutrophil Count, and the app highlights severity ranges such as mild, moderate, and severe neutropenia.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-green-100">
            <Microscope className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">Sepsis Risk Awareness</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Severe neutropenia with fever can indicate neutropenic sepsis, a life-threatening emergency requiring urgent care.
            </p>
          </div>
        </div>

        <div className="pro-surface rounded-3xl p-6 sm:p-10 md:p-14 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-[linear-gradient(90deg,#4caf6a,#2e9e50,#4caf6a)] bg-[length:200%_100%] animate-[shimmer_2.5s_linear_infinite]" />

          <div className="space-y-8 text-gray-500 leading-relaxed">
            <section>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-4 tracking-tight">Why This Matters Clinically</h2>
              <p className="mb-4">
                White blood cell analysis is essential for detecting infection, immune suppression, and hematological abnormalities. One of the most important findings is neutropenia, which means a low neutrophil count.
              </p>
              <p className="mb-4">
                Low neutrophils reduce the body&apos;s ability to fight infection. When this is missed or detected late, the risk of serious complications increases, including rapid infection spread and sepsis.
              </p>
              <p className="mb-4">
                Doctors commonly assess this using ANC, or Absolute Neutrophil Count:
              </p>
              <div className="rounded-2xl border border-green-100 bg-green-50/60 p-5 text-sm text-gray-700">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div><span className="font-bold text-gray-800">Mild:</span> 1000–1500</div>
                  <div><span className="font-bold text-gray-800">Moderate:</span> 500–1000</div>
                  <div><span className="font-bold text-gray-800">Severe:</span> &lt;500</div>
                  <div><span className="font-bold text-gray-800">Fever + Severe Neutropenia:</span> Neutropenic Sepsis</div>
                </div>
              </div>
              <p className="mt-4">
                This is why early identification is clinically important. Delays in recognizing WBC abnormalities like neutropenia can increase mortality risk and reduce the time available for treatment.
              </p>
              <p className="mt-4">Current diagnostic workflows also face several practical challenges:</p>
              <ul className="space-y-3">
                <li>• Conventional hematology analyzers are expensive and laboratory-bound</li>
                <li>• Manual microscopy requires skilled technicians and significant time</li>
                <li>• Diagnostic workflows may experience delays during high workloads</li>
                <li>• Smaller clinics often lack access to advanced laboratory infrastructure</li>
              </ul>
              <p className="mt-4">These limitations can slow down clinical decision-making when time matters most.</p>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-4 tracking-tight">How Immunixx Helps</h2>
              <p className="mb-4">
                Immunixx analyzes peripheral blood smear images and generates structured WBC results that can support faster screening and timely medical intervention.
              </p>
              <p className="mb-4">
                The goal is not to replace clinical judgment, but to surface concerning patterns early so healthcare teams can prioritize urgent cases.
              </p>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
                <p className="font-bold mb-2">Analyzer alert meanings</p>
                <ul className="space-y-2 text-amber-900/90">
                  <li>• <span className="font-semibold">Possible Infection Alert:</span> abnormal WBC pattern suggests possible infection and may need additional diagnostic tests.</li>
                  <li>• <span className="font-semibold">Possible Sepsis Risk:</span> urgent alert for potential severe infection risk; immediate medical evaluation is recommended.</li>
                  <li>• <span className="font-semibold">Leukemia Screening Alert:</span> abnormal WBC distribution detected; further hematological investigation is recommended.</li>
                </ul>
              </div>
            </section>

            <section className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={onStartAnalysis}
                className="btn-primary-brand inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-bold text-white transition-all"
              >
                Start Analysis <ArrowRight className="ml-2 h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onViewHistory}
                className="inline-flex items-center justify-center rounded-full border-2 border-green-500 px-6 py-3 text-sm font-bold text-green-700 transition-colors hover:bg-green-50"
              >
                View Records
              </button>
            </section>

            <section className="pt-2 text-sm text-gray-500">
              <p>
                Neutropenia plus fever is a medical emergency. If the analyzer flags a severe pattern, the result should be treated as a prompt for urgent clinical review.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;