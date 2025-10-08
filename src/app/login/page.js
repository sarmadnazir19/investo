"use client";

import Button from "../components/Button";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
	const [username, setUsername] = useState("");
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
					const data = await res.json();
					if (!res.ok) {
						setError(data.error || "Login failed");
						return;
					}
					if (username === "StonksAdmin" && password === "StonksAdmin4321!") {
						router.push("/admin");
					} else {
						router.push("/dashboard");
					}
				} catch (err) {
					setError("Network error");
				}
			};

	return (
		<main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-purple-900 to-purple-800 font-sans text-white">
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
					<label htmlFor="username" className="block mb-2 text-sm font-medium text-white">Username</label>
					<input
						type="text"
						id="username"
						name="username"
						autoComplete="username"
						required
						value={username}
						onChange={e => setUsername(e.target.value)}
						className="w-full px-4 py-2 rounded-lg bg-purple-950 text-white border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
						className="w-full px-4 py-2 rounded-lg bg-purple-950 text-white border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
					/>
				</div>
				{error && <div className="text-red-400 mb-4 text-sm">{error}</div>}
				<Button
					text="Login"
					color="#4b006e"
					textColor="#fff"
					glowColor="#ff00cc"
					rippleColor="rgba(255,255,255,0.2)"
					onClick={handleLogin}
				/>
			</form>
		</main>
	);
}
