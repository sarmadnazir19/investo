"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Button from "./components/Button";

export default function LandingPage() {
  const router = useRouter();
  return (
  <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-purple-900 to-purple-800 font-sans text-white">
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        <div className="flex gap-8 items-center">
          <Image
            src="/assets/emp.png"
            alt="Emp Logo"
            width={120}
            height={120}
            className="drop-shadow-xl animate-fade-in delay-200"
            priority
          />
        </div>
        <h1 className="text-5xl text-red-500 md:text-6xl font-extrabold text-center tracking-tight animate-fade-in delay-300">
          JT Empressario&apos;25 <span className="font-extrabold">$tonks</span>
        </h1>
        <p className="text-lg md:text-xl max-w-xl text-center animate-fade-in delay-400">
          Welcome to the official portal for $tonks for JT Empressario&#39;25.
        </p>
        <div className="mt-6 animate-fade-in delay-500">
          <Button
            text="Login"
            color="#2d014d"
            textColor="#fff"
            glowColor="#ff00cc"
            rippleColor="rgba(255,255,255,0.2)"
            onClick={() => router.push("/login")}
          />
        </div>
      </div>
    </main>
  );
}
