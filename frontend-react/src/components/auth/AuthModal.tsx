import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { X, Mail, Lock, User, Loader2, Sparkles, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  subtitle?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'Đăng nhập để lưu lịch trình',
  subtitle = 'Vui lòng đăng nhập hoặc tạo tài khoản để hệ thống lưu lịch trình du lịch cá nhân hóa vào tài khoản của bạn.'
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let authData;
      if (isRegister) {
        await authService.register(email, password, fullName);
        authData = await authService.login(email, password);
        toast.success('Tạo tài khoản thành công!');
      } else {
        authData = await authService.login(email, password);
        toast.success('Đăng nhập thành công!');
      }

      login(authData);

      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Đăng nhập/Đăng ký thất bại. Vui lòng kiểm tra lại!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl text-slate-100 overflow-hidden">
        {/* Decorative ambient gradient */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-sky-500/20">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-black text-white">{isRegister ? 'Tạo tài khoản mới' : title}</h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-xs">{subtitle}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Họ và tên</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500 transition"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500 transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 transition disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                {isRegister ? 'Đăng ký & Lưu lịch trình' : 'Đăng nhập & Tiếp tục'}
              </>
            )}
          </button>
        </form>

        {/* Switch Register/Login */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          {isRegister ? (
            <span>
              Đã có tài khoản?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="text-sky-400 font-bold hover:underline"
              >
                Đăng nhập
              </button>
            </span>
          ) : (
            <span>
              Chưa có tài khoản?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="text-sky-400 font-bold hover:underline"
              >
                Tạo tài khoản mới
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
