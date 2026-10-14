'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { BASE_URL } from '@/lib/api';

type Status = 'idle' | 'loading' | 'error';

interface LoginResponse {
  accessToken: string;
  user: unknown;
}

export default function LoginPage() {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailRef.current?.value,
          password: passwordRef.current?.value,
        }),
      });
      if (res.status === 401) {
        setMessage('Email ou mot de passe incorrect.');
        setStatus('error');
        return;
      }
      if (!res.ok) {
        setMessage(`Erreur serveur (${res.status}). R\u00e9essayez plus tard.`);
        setStatus('error');
        return;
      }
      const data = (await res.json()) as LoginResponse;
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/admin');
    } catch {
      setMessage('Impossible de contacter le serveur. V\u00e9rifiez votre connexion.');
      setStatus('error');
    }
  }

  const isLoading = status === 'loading';

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <Logo href="/" />
        </div>
        <h1 className="text-center text-xl font-semibold text-gray-900">
          Connexion administrateur
        </h1>
        <p className="mt-1 mb-6 text-center text-sm text-muted">
          Acc\u00e8s r\u00e9serv\u00e9 aux membres du bureau
        </p>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-medium text-gray-600">
              Adresse e-mail
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="email"
                ref={emailRef}
                type="email"
                autoComplete="email"
                placeholder="admin@chessgabon.ga"
                required
                disabled={isLoading}
                className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-60"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-medium text-gray-600">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="password"
                ref={passwordRef}
                type={showPwd ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                required
                disabled={isLoading}
                className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-11 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-600"
                aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {status === 'error' && <Alert type="error" message={message} />}
          <Button type="submit" loading={isLoading} className="w-full" size="lg">
            {isLoading ? 'Connexion\u2026' : 'Se connecter'}
          </Button>
        </form>
        <p className="mt-6 text-center">
          <Link href="/" className="text-sm text-muted transition hover:text-brand">
            \u2190 Retour au classement
          </Link>
        </p>
      </div>
    </main>
  );
}
