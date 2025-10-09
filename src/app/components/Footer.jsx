import Link from "next/link";
import { Github, Instagram } from "lucide-react";

function Footer() {
  return (
    <footer className="w-full bg-gradient-to-b from-purple-950/50 to-purple-950/80 py-2 sm:py-4 px-3 sm:px-4 border-t border-purple-700/30 relative backdrop-blur-md overflow-hidden mt-8 sm:mt-12">

      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(168,85,247,0.1)_25%,rgba(168,85,247,0.1)_50%,transparent_50%,transparent_75%,rgba(168,85,247,0.1)_75%)] bg-[length:30px_30px] animate-pulse"></div>
      </div>


      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/60 to-transparent"></div>


      <div className="relative max-w-6xl mx-auto">

        <div className="flex flex-col items-center gap-1.5 sm:gap-3">

          <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-2 text-purple-300/80 text-[10px] sm:text-xs">
            <span className="font-semibold">Copyright © 2025 LGS JT</span>
            <span className="text-purple-500/50 hidden sm:inline">•</span>
            <span className="hidden sm:inline">All Rights Reserved</span>
          </div>


          <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-2 text-[10px] sm:text-xs">
            <span className="text-purple-400 hidden sm:inline">Made by:</span>
            <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-2">
              <Link
                href="https://github.com/ARTariqDev"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative px-1.5 py-0.5 sm:px-2 sm:py-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/40 hover:to-pink-600/40 rounded border sm:rounded-lg border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
              >
                <span className="flex items-center gap-1 sm:gap-1.5 text-purple-200 group-hover:text-white font-medium">
                  <Github size={10} className="sm:hidden group-hover:rotate-12 transition-transform duration-300" />
                  <Github size={12} className="hidden sm:block group-hover:rotate-12 transition-transform duration-300" />
                  <span className="text-[10px] sm:text-xs">Abdur Rehman Tariq</span>
                </span>
              </Link>
              
              <span className="text-purple-500/50 text-[10px]">&</span>
              
              <Link
                href="https://www.instagram.com/waleed._fr/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative px-1.5 py-0.5 sm:px-2 sm:py-1 bg-gradient-to-r from-pink-600/20 to-purple-600/20 hover:from-pink-600/40 hover:to-purple-600/40 rounded border sm:rounded-lg border-pink-500/30 hover:border-pink-400/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-pink-500/20"
              >
                <span className="flex items-center gap-1 sm:gap-1.5 text-purple-200 group-hover:text-white font-medium">
                  <Instagram size={10} className="sm:hidden group-hover:rotate-12 transition-transform duration-300" />
                  <Instagram size={12} className="hidden sm:block group-hover:rotate-12 transition-transform duration-300" />
                  <span className="text-[10px] sm:text-xs">Waleed Ajmal</span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>


      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
    </footer>
  );
}

export default Footer;