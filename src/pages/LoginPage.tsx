import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff, LogIn, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message || 'Dang nhap that bai');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Dang nhap Google that bai');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden bg-[#0c1222]">
        <div className="absolute inset-0">
          <div className="absolute -top-24 -left-24 w-[500px] h-[500px] rounded-full bg-[#1e3a5f]/20 blur-[100px]" />
          <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full bg-[#0f2847]/30 blur-[120px]" />
          <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-[#162d4a]/20 blur-[80px]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div className="relative z-10 flex flex-col justify-between px-16 py-12 w-full">
          <div className="flex items-center gap-4">
            <img src="/mcv-logo.svg" alt="MCV" className="h-9" />
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-xs text-slate-400 mb-6 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Cong thong tin noi bo
            </div>

            <h1 className="text-[2.75rem] font-bold text-white leading-[1.15] mb-5 tracking-tight">
              MCV Group<br />
              <span className="text-[#5b9bd5]">Internal Portal</span>
            </h1>

            <p className="text-slate-400 text-base leading-relaxed max-w-sm">
              Cong thong tin noi bo danh cho toan bo nhan vien MCV Group. Truy cap cac he thung HRM, CRM, Finance va nhieu cong cu khac.
            </p>

            {/* App icons preview */}
            <div className="mt-10 grid grid-cols-4 gap-3">
              {[
                { name: 'HRM', desc: 'Nhan su', icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', color: '#5b9bd5' },
                { name: 'CRM', desc: 'Khach hang', icon: 'M17 21v-2a4 4 0 0 0-3-3.87M9 21v-2a4 4 0 0 1 3-3.87', color: '#3BB54A' },
                { name: 'Finance', desc: 'Tai chinh', icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6', color: '#E41E25' },
                { name: 'More', desc: 'Sap ra mat', icon: 'M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM19 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM5 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z', color: '#64748b' },
              ].map((app) => (
                <div key={app.name} className="bg-white/[0.04] backdrop-blur-sm rounded-xl p-3.5 border border-white/[0.06] hover:bg-white/[0.06] transition-colors text-center group cursor-default">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: app.color + '18' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={app.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={app.icon} />
                    </svg>
                  </div>
                  <div className="text-xs font-semibold text-white">{app.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{app.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-600">
            &copy; 2026 MCV Media & Technology Group. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="w-full lg:w-[48%] flex items-center justify-center bg-[#f8fafc] p-8">
        <div className="w-full max-w-[420px]">
          <div className="lg:hidden flex items-center gap-4 mb-10">
            <img src="/mcv-logo.svg" alt="MCV" className="h-8" />
          </div>

          <div className="mb-8">
            <h2 className="text-[1.625rem] font-bold text-slate-900 mb-1.5">Dang nhap</h2>
            <p className="text-slate-500 text-[15px]">Su dung tai khoan MCV de truy cap he thong noi bo.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-[15px] text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-[#1e3a5f]/15 focus:border-[#1e3a5f] transition-all outline-none"
                  placeholder="name@mcv.com.vn"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Mat khau</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-white border border-slate-200 rounded-xl text-[15px] text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-[#1e3a5f]/15 focus:border-[#1e3a5f] transition-all outline-none"
                  placeholder="Nhap mat khau"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#1e3a5f] focus:ring-[#1e3a5f]/30" />
                <span className="text-sm text-slate-600 group-hover:text-slate-700 transition-colors">Ghi nho dang nhap</span>
              </label>
              <button type="button" className="text-sm font-medium text-[#1e3a5f] hover:text-[#152d4a] transition-colors">
                Quen mat khau?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#1e3a5f] hover:bg-[#152d4a] text-white rounded-xl font-semibold text-[15px] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#1e3a5f]/25 hover:shadow-[#152d4a]/30"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-[18px] h-[18px]" />
                  Dang nhap
                </>
              )}
            </button>
          </form>

          <div className="mt-7">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#f8fafc] text-slate-400 text-xs uppercase tracking-wider">hoac dang nhap voi</span>
              </div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              className="mt-4 w-full py-3.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-3 shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </button>
          </div>

          <div className="mt-10 text-center">
            <p className="text-xs text-slate-400">MCV Media & Technology Group</p>
            <p className="text-xs text-slate-300 mt-0.5">Cong thong tin noi bo</p>
          </div>
        </div>
      </div>
    </div>
  );
}
