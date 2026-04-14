import { Home as HomeIcon, Microscope, FileText, Info } from 'lucide-react';
import logo from '../../logo.png';

type ActiveView = 'home' | 'about' | 'demo' | 'records';

interface SiteNavbarProps {
  activeView: ActiveView;
  onHome: () => void;
  onAbout: () => void;
  onDemo: () => void;
  onRecords: () => void;
}

function NavPill({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-full border px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold transition-all duration-200 ${
        active
          ? 'border-green-600 bg-green-600 text-white shadow-sm shadow-green-200'
          : 'border-green-200 bg-white text-green-800 hover:border-green-300 hover:bg-green-50'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function SiteNavbar({ activeView, onHome, onAbout, onDemo, onRecords }: SiteNavbarProps) {
  return (
    <nav className="sticky top-0 z-50 border-b border-green-200/80 bg-[#edf8f0]/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-16 sm:h-20 max-w-6xl items-center justify-between gap-3 sm:gap-4 px-3 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onHome}
          className="flex h-10 sm:h-12 w-36 sm:w-44 items-center justify-center overflow-hidden rounded-md border border-green-700 bg-green-800 p-0 text-left shadow-sm"
        >
          <img src={logo} alt="Immunixx logo" className="h-full w-full scale-[3.8] object-contain object-center" />
        </button>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <NavPill
            label="Home"
            icon={<HomeIcon className="h-4 w-4" />}
            active={activeView === 'home'}
            onClick={onHome}
          />
          <NavPill
            label="About"
            icon={<Info className="h-4 w-4" />}
            active={activeView === 'about'}
            onClick={onAbout}
          />
          <NavPill
            label="Demo"
            icon={<Microscope className="h-4 w-4" />}
            active={activeView === 'demo'}
            onClick={onDemo}
          />
          <NavPill
            label="Records"
            icon={<FileText className="h-4 w-4" />}
            active={activeView === 'records'}
            onClick={onRecords}
          />
        </div>
      </div>
    </nav>
  );
}

export default SiteNavbar;