import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { LogIn, UserPlus, Loader2, Sparkles, Layout } from 'lucide-react';

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        if (!fullName.trim()) {
          setError('Please enter your full name');
          setLoading(false);
          return;
        }
        await signUp(email, password, fullName);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 md:p-0">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 bg-white md:rounded-[3rem] overflow-hidden md:shadow-2xl md:shadow-brand-100/50 md:border md:border-gray-100 min-h-[80vh]">
        
        {/* Left Side: Branding */}
        <div className="relative bg-brand-100 p-12 md:p-20 flex flex-col justify-center overflow-hidden group">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -mr-48 -mt-48 blur-3xl opacity-50 group-hover:scale-110 transition-transform duration-1000" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-200 rounded-full -ml-32 -mb-32 blur-3xl opacity-30 group-hover:scale-125 transition-transform duration-1000" />
          
          <div className="flex items-center justify-start ml-[-3rem]">
              <img src="/upscalemedia-transformed.png" alt="Kando" className="h-56 w-auto" />
            </div>
          <div className="relative z-10 space-y-8">
            
            
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight leading-tight">
                Welcome to <span className="text-brand-600">Kando</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 font-medium max-w-md leading-relaxed">
                Streamline your workflow with precision. Manage tasks, collaborate with your team, and watch your productivity soar.
              </p>
            </div>

            <div className="pt-8 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-white/50 text-xs font-bold text-brand-700">
                <Sparkles className="w-4 h-4" />
                Premium Experience
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-white/50 text-xs font-bold text-brand-700">
                <Layout className="w-4 h-4" />
                Intuitive Design
              </div>
            </div>
          </div>

          {/* Bottom Quote/Funny Note */}
          <div className="absolute bottom-12 left-12 md:left-20 right-12 md:right-20 z-10">
            <p className="text-xs font-bold text-brand-800/40 uppercase tracking-[0.2em]">
              Don't just work, Kando it.
            </p>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="p-12 md:p-20 flex flex-col justify-center bg-white">
          <div className="max-w-sm w-full mx-auto space-y-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-gray-900">
                {isLogin ? 'Sign In' : 'Create Account'}
              </h2>
              <p className="text-gray-500 font-medium">
                {isLogin ? 'Welcome back! Please enter your details.' : 'Join us today and start managing better.'}
              </p>
            </div>

            <div className="flex p-1 bg-gray-50 rounded-2xl">
              <button
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                }}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                  isLogin
                    ? 'bg-white text-brand-600 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                }}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                  !isLogin
                    ? 'bg-white text-brand-600 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:bg-white transition-all text-sm font-bold placeholder:text-gray-400"
                    placeholder="John Doe"
                    required={!isLogin}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:bg-white transition-all text-sm font-bold placeholder:text-gray-400"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:bg-white transition-all text-sm font-bold placeholder:text-gray-400"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-shake">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white py-5 px-6 rounded-2xl font-bold shadow-xl shadow-gray-200 hover:bg-brand-600 hover:shadow-brand-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isLogin ? 'Authenticating...' : 'Creating Account...'}
                  </>
                ) : (
                  <>
                    {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                    {isLogin ? 'Sign In to Kando' : 'Join Kando Today'}
                  </>
                )}
              </button>
            </form>

            <div className="text-center">
              <p className="text-xs text-gray-500 font-medium">
                {isLogin ? "New to Kando? " : 'Already have an account? '}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                  }}
                  className="text-brand-600 font-bold hover:text-brand-700"
                >
                  {isLogin ? 'Create an account' : 'Sign in here'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
