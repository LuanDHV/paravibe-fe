// src/app/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth";
import { authApi } from "@/api/auth";
import { RegisterRequest } from "@/types";

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterRequest>({
    email: "",
    name: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { user, tokens } = await authApi.register(formData);
      login(user, tokens);
      router.push("/");
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -right-1/3 w-1/2 h-1/2 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 -left-1/3 w-1/2 h-1/2 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Register Form */}
      <div className="relative z-10 w-full max-w-md px-6 mx-auto">
        <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">ParaVibe</h1>
            <p className="text-gray-300 text-sm">Create your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-white/10 border border-white/20 text-white placeholder:text-gray-400 rounded-lg h-12 px-4 transition-all focus:border-purple-500/50 focus:bg-white/15"
              />
            </div>

            <div>
              <Input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="bg-white/10 border border-white/20 text-white placeholder:text-gray-400 rounded-lg h-12 px-4 transition-all focus:border-purple-500/50 focus:bg-white/15"
              />
            </div>

            <div>
              <Input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="bg-white/10 border border-white/20 text-white placeholder:text-gray-400 rounded-lg h-12 px-4 transition-all focus:border-purple-500/50 focus:bg-white/15"
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-linear-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-70"
            >
              {isLoading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>

          <div className="text-center mt-8 pt-6 border-t border-white/10">
            <p className="text-gray-300 text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
