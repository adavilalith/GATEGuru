import { useState } from 'react';
import { Link, useLocation } from "wouter"; // Import Link and useLocation from wouter
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type AuthMode = 'login' | 'signup';

export default function AuthPage() {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Only for signup
  const [, setLocation] = useLocation(); // wouter's way to get the navigate function

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd send email/password to your backend here
    // For this UI-only example, we just simulate success
    console.log('Logging in with:', { email, password });
    setLocation('/dashboard'); // Redirect to dashboard using wouter's setLocation
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    // In a real app, you'd send signup data to your backend
    // For this UI-only example, we just simulate success
    console.log('Signing up with:', { email, password });
    setLocation('/dashboard'); // Redirect to dashboard using wouter's setLocation
  };

  const toggleAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'signup' : 'login');
    // Clear form fields when switching mode
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {authMode === 'login' ? 'Welcome Back!' : 'Create an Account'}
          </CardTitle>
          <CardDescription>
            {authMode === 'login'
              ? 'Enter your credentials to access your dashboard.'
              : 'Sign up to get started.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={authMode === 'login' ? handleLogin : handleSignup} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {authMode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}
            <Button type="submit" className="w-full">
              {authMode === 'login' ? 'Log In' : 'Sign Up'}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            {authMode === 'login' ? (
              <>
                Don't have an account?{' '}
                <Button variant="link" onClick={toggleAuthMode} className="p-0 h-auto">
                  Sign Up
                </Button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Button variant="link" onClick={toggleAuthMode} className="p-0 h-auto">
                  Log In
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}