import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { KeyRound, Mail, Loader2, ArrowRight, CheckCircle, Lock } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = () => {
  const { isPasswordRecovery, setPasswordRecoveryHandled } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [isSettingNewPassword, setIsSettingNewPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Detect password recovery mode from auth context
  useEffect(() => {
    if (isPasswordRecovery) {
      setIsSettingNewPassword(true);
      setIsLogin(true);
      setIsResetting(false);
    }
  }, [isPasswordRecovery]);

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      setMessage('Senha redefinida com sucesso! Você será redirecionado...');
      setIsSettingNewPassword(false);
      setPasswordRecoveryHandled();

      // Sign out to force re-login with new password
      setTimeout(async () => {
        await supabase.auth.signOut();
        setMessage('');
        setPassword('');
        setConfirmPassword('');
      }, 2000);

    } catch (err: any) {
      console.error(err);
      setError('Erro ao redefinir senha: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (isResetting) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}`,
        });
        if (error) throw error;
        setMessage('Email de redefinição de senha enviado! Verifique sua caixa de entrada.');
        setIsResetting(false);
      } else if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        console.log('✅ Login realizado com sucesso!');
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) throw error;

        if (data.user && !data.session) {
          setMessage('Verifique seu email para confirmar o cadastro!');
        } else {
          setMessage('Cadastro realizado com sucesso!');
        }
        setIsLogin(true);
      }
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('Invalid login credentials')) {
        setError('Email ou senha inválidos');
      } else if (err.message?.includes('already registered')) {
        setError('Este email já está em uso');
      } else if (err.message?.includes('Password should be')) {
        setError('A senha deve ter pelo menos 6 caracteres');
      } else {
        setError('Ocorreu um erro: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Password Recovery Form
  if (isSettingNewPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-700">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-amber-500/20">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Definir Nova Senha
            </h1>
            <p className="text-slate-400">
              Digite sua nova senha para continuar
            </p>
          </div>

          {message && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg text-sm mb-6 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {message}
            </div>
          )}

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSetNewPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nova Senha</label>
              <div className="relative">
                <KeyRound className="w-5 h-5 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder:text-slate-600"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Confirmar Nova Senha</label>
              <div className="relative">
                <KeyRound className="w-5 h-5 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder:text-slate-600"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Salvar Nova Senha
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSettingNewPassword(false);
                setPasswordRecoveryHandled();
                supabase.auth.signOut();
              }}
              className="text-slate-400 hover:text-white text-sm transition-colors"
            >
              Cancelar e voltar ao Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-700">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-sky-500 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {isResetting ? 'Redefinir Senha' : (isLogin ? 'Bem-vindo de volta' : 'Crie sua conta')}
          </h1>
          <p className="text-slate-400">
            {isResetting
              ? 'Digite seu email para receber o link de redefinição'
              : (isLogin ? 'Faça login para acessar o sistema' : 'Comece a gerenciar seu fluxo de caixa')}
          </p>
        </div>

        {message && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg text-sm mb-6">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && !isResetting && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nome da Empresa/Usuário</label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-600"
                  placeholder="Ex: Minha Empresa"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-600"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          {!isResetting && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Senha</label>
              <div className="relative">
                <KeyRound className="w-5 h-5 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-600"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              {isLogin && (
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={() => { setIsResetting(true); setError(''); setMessage(''); }}
                    className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    Esqueci minha senha
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {isResetting ? 'Enviar Link' : (isLogin ? 'Entrar' : 'Criar Conta')}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          {isResetting ? (
            <button
              type="button"
              onClick={() => { setIsResetting(false); setError(''); setMessage(''); }}
              className="text-slate-400 hover:text-white text-sm transition-colors"
            >
              Voltar para o Login
            </button>
          ) : (
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); setMessage(''); }}
              className="text-slate-400 hover:text-white text-sm transition-colors"
            >
              {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
