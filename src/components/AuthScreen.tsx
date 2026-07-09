import React from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { LogIn } from 'lucide-react';
import { motion } from 'motion/react';

export const AuthScreen: React.FC = () => {
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/unauthorized-domain') {
        alert('Bu alan adı (domain) henüz Firebase üzerinde yetkilendirilmemiş. Lütfen Firebase Console -> Authentication -> Settings -> Authorized domains kısmından bu domaini ekleyin.');
      } else {
        alert('Giriş yapılırken bir hata oluştu.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 text-center"
      >
        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 p-2 shadow-sm border border-slate-100">
          <img 
            src="/logo/black-logo.png" 
            alt="Logo" 
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=TOPALOGLU&background=C5A059&color=fff';
            }}
          />
        </div>
        
        <h1 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">TOPALOGLU ERP</h1>
        <p className="text-slate-500 mb-8 text-sm">
          Siparişlerinizi her yerden yönetmek için giriş yapın.
        </p>

        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all group"
        >
          <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          Google ile Giriş Yap
        </button>

        <p className="mt-8 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
          Güvenli Bulut Altyapısı
        </p>
      </motion.div>
    </div>
  );
};
