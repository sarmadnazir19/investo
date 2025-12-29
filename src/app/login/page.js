"use client";

import Button from "../components/Button";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
	const [username, setusername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const router = useRouter();

			const handleLogin = async () => {
				setError("");
				try {
					const res = await fetch("/api/login", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ username, password }),
						credentials: "include",
					});
					
					if (!res.ok) {
						const data = await res.json().catch(() => ({ error: "Login failed" }));
						setError(data.error || "Login failed");
						return;
					}
					
					const data = await res.json();
					if (data.success) {
						if (username === "StonksAdmin" && password === "StonksAdmin4321!") {
							router.push("/admin");
						} else {
							router.push("/dashboard");
						}
					} else {
						setError(data.error || "Login failed");
					}
				} catch (err) {
					console.error("Login error:", err);
					setError("Network error. Please check your connection and try again.");
				}
			};

	return (
		<main className="min-h-screen flex flex-col items-center justify-center font-sans text-white" style={{ backgroundColor: '#191919' }}>
			<form className="bg-black/60 rounded-xl shadow-lg p-8 flex flex-col items-center w-full max-w-sm animate-fade-in" onSubmit={e => { e.preventDefault(); handleLogin(); }}>
				<Image
					src="/assets/emp.png"
					alt="Emp Logo"
					width={80}
					height={80}
					className="mb-6 drop-shadow-xl"
					priority
				/>
				<h2 className="text-2xl font-bold mb-6 text-white">Login</h2>
				<div className="w-full mb-4">
					<label htmlFor="username" className="block mb-2 text-sm font-medium text-white">username</label>
					<input
						type="text"
						id="username"
						name="username"
						autoComplete="username"
						required
						value={username}
						onChange={e => setusername(e.target.value)}
						className="w-full px-4 py-2 rounded-lg text-white border focus:outline-none focus:ring-2 transition-all"
						style={{ backgroundColor: '#191919', borderColor: '#cc980f' }}
					/>
				</div>
				<div className="w-full mb-6">
					<label htmlFor="password" className="block mb-2 text-sm font-medium text-white">Password</label>
					<input
						type="password"
						id="password"
						name="password"
						autoComplete="current-password"
						required
						value={password}
						onChange={e => setPassword(e.target.value)}
						className="w-full px-4 py-2 rounded-lg text-white border focus:outline-none focus:ring-2 transition-all"
						style={{ backgroundColor: '#191919', borderColor: '#cc980f' }}
					/>
				</div>
				{error && <div className="text-red-400 mb-4 text-sm">{error}</div>}
				<Button
					text="Login"
					color="#191919"
					textColor="#cc980f"
					glowColor="#cc980f"
					rippleColor="rgba(204,152,15,0.2)"
					onClick={handleLogin}
				/>
			</form>
		</main>
	);
}
