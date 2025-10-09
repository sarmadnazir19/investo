import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, TrendingUp, LayoutDashboard } from "lucide-react";
import Image from "next/image";

export default function AdminNavbar() {
  const pathname = usePathname();
  
  const navItems = [
    { href: "/admin", label: "Users", icon: Users },
    { href: "/admin/stocks", label: "Stocks", icon: TrendingUp },
    { href: "/admin/news", label: "News", icon: LayoutDashboard },
    { href: "/admin/livebids", label: "Live Bids", icon: TrendingUp },
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


          <div className="flex gap-2">
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
          </div>
        </div>
      </div>
    </nav>
  );
}