/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toaster } from '@/components/ui/sonner';
import { Lock, Home, LogOut, Package, MessageSquare, BarChart3 } from 'lucide-react';

const SESSION_KEY = 'bag_store_admin_auth';
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';

// ─────────────────────────────────────────────────────────────
// Login gate (centered form)
// ─────────────────────────────────────────────────────────────
const LoginGate = ({ onAuth }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        try { sessionStorage.setItem(SESSION_KEY, 'true'); } catch { /* noop */ }
        onAuth();
      } else {
        setError('Incorrect password. Please try again.');
        setPassword('');
      }
      setLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="space-y-3 text-center pb-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-slate-900 flex items-center justify-center">
              <Lock className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-2xl font-semibold text-slate-900">
              Admin Access
            </CardTitle>
            <p className="text-sm text-slate-500">
              Enter the password to manage your store
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  autoComplete="current-password"
                  className="h-11"
                />
                {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
              </div>
              <Button
                type="submit"
                disabled={loading || !password}
                className="w-full h-11 bg-slate-900 hover:bg-slate-800"
              >
                {loading ? 'Verifying…' : 'Sign in'}
              </Button>
            </form>
            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <Link href="/" className="text-xs text-slate-500 hover:text-slate-900">
                ← Back to storefront
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Top header with tabs (Products / Inquiries)
// ─────────────────────────────────────────────────────────────
const AdminHeader = ({ onLogout, titleSlot }) => {
  const pathname = usePathname();
  const tabs = [
    { href: '/admin',            label: 'Products',  icon: Package },
    { href: '/admin/inquiries',  label: 'Inquiries', icon: MessageSquare },
    { href: '/admin/analytics',  label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="container py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-slate-900 flex items-center justify-center">
            <Package className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900 leading-tight">
              Admin Dashboard
            </h1>
            {titleSlot ? (
              <div className="text-xs text-slate-500 mt-0.5">{titleSlot}</div>
            ) : (
              <p className="text-xs text-slate-500">Manage your store</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <nav className="flex items-center gap-1 mr-2 bg-slate-100 rounded-lg p-1">
            {tabs.map((t) => {
              const active = pathname === t.href;
              const Icon = t.icon;
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={`inline-flex items-center gap-2 px-3 h-8 rounded-md text-sm transition-colors ${
                    active
                      ? 'bg-white text-slate-900 shadow-sm font-medium'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                </Link>
              );
            })}
          </nav>
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">View Store</span>
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="gap-2 text-slate-600"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

// ─────────────────────────────────────────────────────────────
// AdminShell — wraps every admin page with auth + header
// ─────────────────────────────────────────────────────────────
export const AdminShell = ({ children, titleSlot }) => {
  const [mounted, setMounted] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      if (sessionStorage.getItem(SESSION_KEY) === 'true') setAuthed(true);
    } catch { /* noop */ }
  }, []);

  const handleLogout = () => {
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* noop */ }
    setAuthed(false);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-sm text-slate-500">Loading…</div>
      </div>
    );
  }

  if (!authed) {
    return <LoginGate onAuth={() => setAuthed(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-right" />
      <AdminHeader onLogout={handleLogout} titleSlot={titleSlot} />
      <main className="container py-8">{children}</main>
    </div>
  );
};

export default AdminShell;
