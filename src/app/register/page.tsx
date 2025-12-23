// src/app/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/auth';
import { authApi } from '@/api/auth';
import { RegisterRequest } from '@/types';

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterRequest>({
    email: '',
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { user, tokens } = await authApi.register(formData);
      login(user, tokens);
      router.push('/');
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="bg-black/20 backdrop-blur-lg p-8 rounded-lg shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">ParaVibe</h1>
          <p className="text-gray-300">Create your account</p>
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
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>

          <div>
            <Input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
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
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center">{error}</div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-linear-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-300">
            Already have an account?{' '}
            <Link href="/login" className="text-purple-400 hover:text-purple-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}