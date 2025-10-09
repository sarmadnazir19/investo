import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LineChart, Gavel, LogOut } from "lucide-react";
import Image from "next/image";

export default function Navbar({ onLogout, loading }) {
  const pathname = usePathname();
  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/bids", label: "Live Bidding", icon: Gavel },
  ];

  return (
    <nav className="bg-gradient-to-r from-purple-950/95 via-purple-900/95 to-purple-950/95 border-b border-purple-700/30 backdrop-blur-md sticky top-0 z-50 shadow-lg shadow-purple-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm flex items-center justify-center border border-purple-500/30 shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all duration-300 group-hover:scale-110">
              <Image 
                src="/assets/emp.png" 
                alt="Emp Logo" 
                width={48} 
                height={48} 
                className="text-white transition-transform duration-300 group-hover:rotate-12" 
              />
            </div>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-200 via-pink-200 to-purple-300 bg-clip-text text-transparent drop-shadow-lg animate-gradient">
              $TONKS - JT Empressario'25
            </span>
          </div>

          {/* Navigation Items */}
          <div className="flex gap-2 items-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    group flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-medium transition-all duration-300
                    ${isActive 
                      ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/50 scale-105" 
                      : "text-purple-300 hover:bg-white/5 hover:text-white hover:shadow-md hover:shadow-purple-500/20 hover:scale-105 border border-transparent hover:border-purple-500/30"
                    }
                  `}
                >
                  <Icon size={18} className="group-hover:rotate-12 transition-transform duration-300" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
 
            {onLogout && (
              <button
                onClick={onLogout}
                disabled={loading}
                className="group flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-red-600/80 via-pink-600/80 to-purple-600/80 hover:from-red-600 hover:via-pink-600 hover:to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-pink-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ml-2 border border-pink-500/30 hover:scale-105 hover:shadow-pink-500/50 max-w-full overflow-x-hidden"
                style={{ minWidth: 0 }}
              >
                <LogOut size={18} className={`${loading ? 'animate-spin' : 'group-hover:translate-x-1'} transition-transform duration-300`} />
                <span className="hidden sm:inline">{loading ? 'Logging out...' : 'Logout'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Subtle glow effect at bottom */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
    </nav>
  );
}