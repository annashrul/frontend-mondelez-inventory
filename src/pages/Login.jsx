import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Boxes, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.user, res.token);
      toast.success('Login berhasil!');
    } catch (err) {
      if (form.username === 'admin' && form.password === 'admin') {
        login(
          { id: 1, nama: 'Administrator', username: 'admin', level: 'Admin' },
          'demo-token-12345'
        );
        toast.success('Login berhasil! (Demo Mode)');
      } else {
        toast.error(err.message || 'Username atau password salah');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-xl mb-4 shadow-lg">
            <Boxes className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-white">Inventory System</h1>
          <p className="text-neutral-400 mt-2">Silakan login untuk melanjutkan</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Login</CardTitle>
            <CardDescription>Masukkan credentials Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="Masukkan username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Masukkan password"
                    className="pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Memproses...' : 'Login'}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Demo: <strong>admin/admin</strong>, <strong>budi/budi</strong>, atau <strong>owner/owner</strong>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
