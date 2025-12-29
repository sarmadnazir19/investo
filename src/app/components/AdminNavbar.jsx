import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, TrendingUp, LayoutDashboard, Trophy } from "lucide-react";
import Image from "next/image";

export default function AdminNavbar() {
  const pathname = usePathname();
  
  const navItems = [
    { href: "/admin", label: "Users", icon: Users },
    { href: "/admin/stocks", label: "Stocks", icon: TrendingUp },
    { href: "/admin/news", label: "News", icon: LayoutDashboard },
    { href: "/admin/livebids", label: "Live Bids", icon: TrendingUp },
    { href: "/admin/leaderboard", label: "Leaderboard", icon: Trophy },
  ];

  return (
    <nav className="border-b backdrop-blur-sm sticky top-0 z-50" style={{ backgroundColor: '#191919', borderColor: '#cc980f' }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center">
              <Image src="/assets/emp.png" alt="Emp Logo" width={48} height={48} className="text-white" />
            </div>
            <span className="text-xl font-bold" style={{ color: '#cc980f' }}>
              Investomania - ABC XIII
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
                      ? "text-white shadow-lg" 
                      : "hover:bg-white/5 hover:text-white"
                    }
                  `}
                  style={isActive ? { backgroundColor: '#cc980f', color: '#191919', boxShadow: '0 0 10px rgba(204,152,15,0.5)' } : { color: '#cc980f' }}
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