"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Button from "./components/Button";

export default function LandingPage() {
  const router = useRouter();
  return (
  <main className="min-h-screen flex flex-col items-center justify-center font-sans text-white" style={{ backgroundColor: '#191919' }}>
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
        <h1 className="text-5xl md:text-6xl font-extrabold text-center tracking-tight animate-fade-in delay-300" style={{ color: '#cc980f' }}>
          ABC XIII <span className="font-extrabold">Investomania</span>
        </h1>
        <p className="text-lg md:text-xl max-w-xl text-center animate-fade-in delay-400">
          Welcome to the official portal for Investomania for ABC XIII.
        </p>
        <div className="mt-6 animate-fade-in delay-500">
          <Button
            text="Login"
            color="#191919"
            textColor="#cc980f"
            glowColor="#cc980f"
            rippleColor="rgba(204,152,15,0.2)"
            onClick={() => router.push("/login")}
          />
        </div>
      </div>
    </main>
  );
}
