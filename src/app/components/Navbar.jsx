import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LineChart, Gavel,LogOut } from "lucide-react";
import Image from "next/image";

export default function Navbar({ onLogout, loading }) {
  const pathname = usePathname();
  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/bids", label: "Live Bidding", icon: Gavel },
  ];

  return (
    <nav className="bg-gradient-to-r from-purple-950 via-purple-900 to-purple-950 border-b border-purple-700/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center">
              <Image src="/assets/emp.png" alt="Emp Logo" width={48} height={48} className="text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              $TONKS - JT Empressario'25
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
                    flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
                    ${isActive 
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-500/50" 
                      : "text-purple-300 hover:bg-purple-800/50 hover:text-white"
                    }
                  `}
                >
                  <Icon size={18} />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
 
            {onLogout && (
              <button
                onClick={onLogout}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-700 via-purple-600 to-pink-500 hover:from-purple-800 hover:to-pink-600 text-white rounded-lg font-semibold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed ml-2 border border-purple-500/50"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}