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
        <span className="relative z-10">Abdur Rehman Tariq </span>
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
    <footer className="w-full bg-[#111111]/80 py-3 sm:py-4 px-4 border-t border-[#fff8de]/20 relative backdrop-blur-sm overflow-hidden text-center mt-[2rem]">

      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,248,222,0.05)_25%,rgba(255,248,222,0.05)_50%,transparent_50%,transparent_75%,rgba(255,248,222,0.05)_75%)] bg-[length:20px_20px] animate-pulse"></div>
      </div>

      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#fff8de]/50 to-transparent"></div>

      <ul className="relative text-[#fff8de]/80 text-xs sm:text-sm font-mono flex flex-wrap justify-center items-center gap-2 sm:gap-4">
        {items.map((item, i) => (
          <li
            key={i}
            className="transition-all duration-300 hover:text-[#fff8de] flex items-center justify-center"
          >
            {item}
          </li>
        ))}
      </ul>
    </footer>
  );
}

export default Footer;