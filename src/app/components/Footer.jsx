import Link from "next/link";

function Footer() {
  const items = [
    "Copyright © 2025 LGS JT",
    "⚬",
    "All rights Reserved",
    "⚬",
    // eslint-disable-next-line react/jsx-key
    <section className="flex flex-wrap justify-center gap-1 text-xs sm:text-sm ">
      Made By:{" "}
      <Link
        href="https://github.com/ARTariqDev"
        target="_blank"
        rel="noopener noreferrer"
        className="relative text-[#fff8de] hover:text-[#fff8de]/80 font-mono transition-all duration-300 hover:shadow-[0_0_8px_rgba(255,248,222,0.5)] hover:scale-105 border-b border-transparent group"
      >
        <span className="relative z-10">Abdur Rehman Tariq</span>
        <span className="absolute inset-0 bg-gradient-to-r from-[#fff8de]/0 via-[#fff8de]/10 to-[#fff8de]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></span>
      </Link>{" "}
      &{" "}
      <Link
        href="https://www.instagram.com/waleed._fr/"
        target="_blank"
        rel="noopener noreferrer"
        className="relative text-[#fff8de] hover:text-[#fff8de]/80 font-mono transition-all duration-300 hover:shadow-[0_0_8px_rgba(255,248,222,0.5)] hover:scale-105 border-b border-transparent group"
      >
        <span className="relative z-10">Waleed Ajmal</span>
        <span className="absolute inset-0 bg-gradient-to-r from-[#fff8de]/0 via-[#fff8de]/10 to-[#fff8de]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></span>
      </Link>
    </section>
  ];

  return (
    <footer className="w-full fixed bottom-0 left-0 bg-gradient-to-r from-purple-950 via-purple-900 to-purple-950 py-3 sm:py-4 px-4 border-t border-purple-700/40 shadow-lg shadow-purple-900/30 z-50 backdrop-blur-md overflow-hidden text-center">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,248,222,0.08)_25%,rgba(255,248,222,0.08)_50%,transparent_50%,transparent_75%,rgba(255,248,222,0.08)_75%)] bg-[length:20px_20px] animate-pulse"></div>
      </div>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-300/50 to-transparent"></div>
      <ul className="relative text-purple-200 text-xs sm:text-sm font-mono flex flex-wrap justify-center items-center gap-2 sm:gap-4">
        {items.map((item, i) => (
          <li
            key={i}
            className="transition-all duration-300 hover:text-purple-100 flex items-center justify-center"
          >
            {item}
          </li>
        ))}
      </ul>
    </footer>
  );
}

export default Footer;