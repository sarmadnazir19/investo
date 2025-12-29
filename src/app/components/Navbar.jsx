import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LineChart, Gavel, LogOut } from "lucide-react";
import Image from "next/image";

export default function Navbar({ onLogout, loading }) {
  const pathname = usePathname();
  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
  ];

  return (
    <nav className="border-b backdrop-blur-md sticky top-0 z-50 shadow-lg" style={{ backgroundColor: '#191919', borderColor: '#cc980f' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18">

          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl backdrop-blur-sm flex items-center justify-center border shadow-lg transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: 'rgba(204,152,15,0.1)', borderColor: '#cc980f', boxShadow: '0 0 10px rgba(204,152,15,0.2)' }}>
              <Image 
                src="/assets/emp.png" 
                alt="Emp Logo" 
                width={48} 
                height={48} 
                className="text-white transition-transform duration-300 group-hover:rotate-12" 
              />
            </div>
            <span className="text-lg sm:text-xl font-bold drop-shadow-lg animate-gradient" style={{ color: '#cc980f' }}>
              Investomania - ABC XIII
            </span>
          </div>


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
                      ? "text-white shadow-lg scale-105" 
                      : "hover:bg-white/5 hover:text-white hover:shadow-md hover:scale-105 border border-transparent"
                    }
                  `}
                  style={isActive ? { backgroundColor: '#cc980f', color: '#191919', boxShadow: '0 0 10px rgba(204,152,15,0.5)' } : { color: '#cc980f' }}
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
                className="group flex items-center gap-2 px-3 py-2 text-white rounded-xl font-semibold shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ml-2 hover:scale-105 max-w-full overflow-x-hidden"
                style={{ backgroundColor: '#cc980f', color: '#191919', borderColor: '#cc980f', boxShadow: '0 0 10px rgba(204,152,15,0.3)', minWidth: 0 }}
              >
                <LogOut size={18} className={`${loading ? 'animate-spin' : 'group-hover:translate-x-1'} transition-transform duration-300`} />
                <span className="hidden sm:inline">{loading ? 'Logging out...' : 'Logout'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
      

      <div className="absolute bottom-0 left-0 w-full h-px" style={{ background: 'linear-gradient(to right, transparent, #cc980f, transparent)' }}></div>
    </nav>
  );
}