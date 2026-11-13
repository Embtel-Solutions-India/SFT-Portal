import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  if (pathnames.length === 0) return null;

  return (
    <nav className="flex items-center gap-1.5 text-xs text-[#5e6d61] mb-1 font-mono">
      <Link to="/" className="hover:text-[#008236] flex items-center gap-1 transition-colors">
        <Home className="w-3 h-3" />
        <span>Home</span>
      </Link>
      {pathnames.map((segment, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const formattedName = segment
          .replace(/-/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());

        return (
          <React.Fragment key={routeTo}>
            <ChevronRight className="w-3 h-3 text-[#8a998c]" />
            {isLast ? (
              <span className="font-semibold text-[#18221b] truncate max-w-[200px]">
                {formattedName}
              </span>
            ) : (
              <Link to={routeTo} className="hover:text-[#008236] transition-colors truncate max-w-[150px]">
                {formattedName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

