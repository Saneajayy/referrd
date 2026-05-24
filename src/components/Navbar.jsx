import { Link, useNavigate } from 'react-router-dom';
import logoImg from '../assets/logo.png';

/**
 * Shared top navbar used on all non-hero pages.
 * Logo always sits at the left inside the fixed bar, linking to /.
 */
export default function Navbar() {
  const navigate = useNavigate();

  const handleDashboard = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    navigate(token ? '/dashboard' : '/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 z-20 bg-white/95 backdrop-blur-sm border-b border-black/5 flex items-center px-6 max-md:px-4">
      {/* Logo — left-anchored, always same size */}
      <Link to="/" className="flex items-center shrink-0">
        <img src={logoImg} alt="Referr'd" className="w-11 h-11 object-contain" />
      </Link>

      {/* Nav links — centered */}
      <div className="flex-1 flex justify-center gap-14 items-center max-md:hidden">
        <a
          href="#"
          onClick={handleDashboard}
          className="text-[18px] tracking-[-0.5px] no-underline text-black font-normal transition-opacity hover:opacity-50"
        >
          Dashboard
        </a>
        {[
          { label: 'Job Openings', href: '/jobs' },
          { label: 'Pricing',      href: '/pricing' },
          { label: 'About',        href: '/#about' },
        ].map(({ label, href }) => (
          <Link
            key={label}
            to={href}
            className="text-[18px] tracking-[-0.5px] no-underline text-black font-normal transition-opacity hover:opacity-50"
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Spacer to balance logo */}
      <div className="w-11 shrink-0 max-md:hidden" />
    </nav>
  );
}
