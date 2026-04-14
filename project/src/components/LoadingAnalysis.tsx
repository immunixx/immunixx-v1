function LoadingAnalysis() {
  const steps = [
    'Preprocessing image data…',
    'Running CNN classification model…',
    'Computing confidence scores…',
    'Generating differential count…',
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(160deg,#f1fdf4 0%,#ffffff 60%,#e8f5e9 100%)' }}>

      <div className="bg-white rounded-3xl px-10 py-14 max-w-md w-full text-center animate-fadeIn"
        style={{ boxShadow: '0 8px 40px rgba(46,158,80,.14)', border: '1px solid #dcf5e3' }}>

        {/* Spinner */}
        <div className="flex justify-center mb-8">
          <div className="relative w-20 h-20">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-4 border-green-100" />
            {/* Spinning arc */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-500"
              style={{ animation: 'spinRing 1.1s linear infinite' }} />
            {/* Inner pulse */}
            <div className="absolute inset-3 rounded-full bg-green-50 flex items-center justify-center"
              style={{ animation: 'pulseDot 2s ease-in-out infinite' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#2e9e50" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
          </div>
        </div>

        <h3 className="text-2xl font-extrabold text-gray-800 mb-2 tracking-tight">Analyzing Image…</h3>
        <p className="text-gray-400 text-sm mb-8">
          Our CNN model is processing your blood smear and classifying white blood cells
        </p>

        {/* Step list */}
        <div className="text-left space-y-3">
          {steps.map((step, i) => (
            <div key={step} className="flex items-center gap-3 text-sm"
              style={{ animation: `fadeIn 0.5s ease both`, animationDelay: `${i * 0.35}s` }}>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0"
                style={{ animation: `pulseDot 1.5s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }} />
              <span className="text-gray-600 font-medium">{step}</span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-8 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg,#4caf6a,#2e9e50)',
              animation: 'growBar 3.2s cubic-bezier(0.22,1,0.36,1) both',
              width: '92%',
            }} />
        </div>
        <p className="text-xs text-gray-400 mt-2">Please wait — this may take a few seconds</p>
      </div>

      <style>{`
        @keyframes spinRing  { to { transform: rotate(360deg); } }
        @keyframes pulseDot  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.8)} }
        @keyframes growBar   { from{width:0%} to{width:92%} }
      `}</style>
    </div>
  );
}

export default LoadingAnalysis;
