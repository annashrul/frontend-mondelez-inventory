import { translate as translateUi } from '@/lib/i18n';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTranslation } from '@/lib/i18n';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from '@/lib/toast';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useThemeLogo } from '@/hooks/useThemeLogo';

export default function Login() {
  const logoUrl = useThemeLogo();
  const company = useSettingsStore(state => state.settings.nama_perusahaan);
  const { t } = useTranslation();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [challenge, setChallenge] = useState(null);
  const [code, setCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const res = challenge
        ? await api.post('/auth/verify-otp', { challenge_id: challenge, code })
        : await api.post('/auth/login', form, { timeout: 45000 });
      if (res.requires_2fa) {
        setChallenge(res.challenge_id);
        setForm(current => ({ ...current, password: '' }));
        toast.info(res.message);
        return;
      }
      login(res.user, res.token);
      toast.success('Login berhasil!');
    } catch (err) {
      toast.error(err.message || 'Username atau password salah');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 shadow-lg ring-1 ring-white/20">
            <img src={logoUrl} alt={translateUi("Sistem Inventaris")} className="h-12 w-12 object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-white">{company}</h1>
          <p className="text-neutral-400 mt-2">{t('Silakan login untuk melanjutkan')}</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>{translateUi("Login")}</CardTitle>
            <CardDescription>{translateUi("Masukkan credentials Anda")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {challenge ? (
                <div className="space-y-2">
                  <Label htmlFor="login-code">{translateUi("Kode verifikasi email")}</Label>
                  <p className="text-xs text-muted-foreground">{t('Masukkan kode 6 digit dari email akun Anda. Kode berlaku 5 menit.')}</p>
                  <Input id="login-code" value={code} onChange={event => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" required autoFocus />
                </div>
              ) : <>
              <div className="space-y-2">
                <Label htmlFor="username">{translateUi("Username")}</Label>
                <Input
                  id="username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder={translateUi("Masukkan username")}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{translateUi("Password")}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder={translateUi("Masukkan password")}
                    className="pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                    aria-label={t(showPassword ? "Sembunyikan password" : "Tampilkan password")}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </Button>
                </div>
              </div>
              </>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? translateUi("Memproses...") : challenge ? translateUi("Verifikasi & Login") : translateUi("Login")}
              </Button>
              {challenge && <Button type="button" variant="ghost" className="w-full" disabled={loading} onClick={() => { setChallenge(null); setCode(''); }}>{translateUi("Kembali ke login")}</Button>}
              {import.meta.env.VITE_USE_MOCKS === 'true' && (
                <p className="text-center text-xs text-muted-foreground">{translateUi("Demo: ")}<strong>{"admin/admin"}</strong>, <strong>{"budi/budi"}</strong>{translateUi(", atau ")}<strong>{"owner/owner"}</strong>
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
