import React, { useState, useRef, useEffect, useCallback } from 'react';

// ==========================================
// 1. TIPAGENS E INTERFACES
// ==========================================
interface Expense {
  id?: number;
  description: string;
  amount: number;
  local: string;
  merchant: string;
  createdAt?: string;
}

interface UserProfile {
  username: string;
  createdAt: string;
}

type Language = 'en' | 'pt';
type Theme = 'light' | 'dark';
type Tab = 'dashboard' | 'profile';

// ==========================================
// 2. CONFIGURAÇÕES E TRANSLATIONS
// ==========================================
const API_BASE_URL = 'http://localhost:8080/api/v1';

const translations = {
  en: {
    title: 'SayExpense',
    login: 'Login',
    register: 'Register',
    username: 'Username',
    password: 'Password',
    enter: 'Enter',
    signUp: 'Sign Up',
    logout: 'Logout',
    logged: 'Logged in',
    recording: 'Audio Command',
    recordingDesc: 'Record an audio to manage your expenses.',
    startRecording: 'Start Recording',
    stopRecording: 'Stop Recording',
    recorded: 'Recorded audio:',
    sendToAI: 'Send audio',
    discard: 'Discard',
    yourExpenses: 'Query Results',
    description: 'Description',
    local: 'Location',
    merchant: 'Merchant',
    amount: 'Amount',
    createdAt: 'Date',
    total: 'Total',
    close: 'Clear',
    noExpenses: 'No expenses found.',
    loginSuccess: 'Login successful!',
    loginFailed: 'Login failed. Check your credentials.',
    registerSuccess: 'Registration successful! Please login.',
    registerFailed: 'Registration failed. Username may already exist.',
    sendError: 'Connection error.',
    logoutSuccess: 'Logout successful.',
    audioDiscarded: 'Audio discarded.',
    haveAccount: 'Already have an account?',
    noAccount: "Don't have an account?",
    processing: 'Processing...',
    // Chaves que estavam faltando:
    querySuccess: 'Expenses loaded successfully!',
    expenseCreated: 'Expense recorded successfully!',
    // Tabs e Perfil
    tabDashboard: 'Dashboard',
    tabProfile: 'Profile',
    profile: 'My Profile',
    updateProfile: 'Update Profile',
    newUsername: 'New Username',
    newPassword: 'New Password',
    deleteAccount: 'Delete Account',
    deleteConfirm: 'Are you sure you want to delete your account? This action deletes all your expenses and cannot be undone.',
    profileUpdated: 'Profile updated! Please log in again.',
    profileUpdateFailed: 'Failed to update profile. Username might be taken.',
    accountDeleted: 'Account deleted successfully.',
    accountDeleteFailed: 'Failed to delete account.',
    memberSince: 'Member since'
  },
  pt: {
    title: 'SayExpense',
    login: 'Login',
    register: 'Cadastro',
    username: 'Usuário',
    password: 'Senha',
    enter: 'Entrar',
    signUp: 'Cadastrar',
    logout: 'Sair',
    logged: 'Autenticado',
    recording: 'Comando de Voz',
    recordingDesc: 'Grave um áudio para gerenciar as despesas.',
    startRecording: 'Iniciar Gravação',
    stopRecording: 'Parar Gravação',
    recorded: 'Áudio gravado:',
    sendToAI: 'Enviar áudio',
    discard: 'Descartar',
    yourExpenses: 'Resultados da Consulta',
    description: 'Descrição',
    local: 'Local',
    merchant: 'Comerciante',
    amount: 'Valor',
    createdAt: 'Data',
    total: 'Total',
    close: 'Limpar',
    noExpenses: 'Nenhuma despesa encontrada.',
    loginSuccess: 'Login realizado com sucesso!',
    loginFailed: 'Falha no login. Verifique suas credenciais.',
    registerSuccess: 'Cadastro realizado com sucesso! Faça login.',
    registerFailed: 'Falha no cadastro. Usuário já pode existir.',
    sendError: 'Erro de conexão.',
    logoutSuccess: 'Logout realizado.',
    audioDiscarded: 'Áudio descartado.',
    haveAccount: 'Já tem uma conta?',
    noAccount: 'Não tem uma conta?',
    processing: 'Processando...',
    // Chaves que estavam faltando:
    querySuccess: 'Despesas carregadas com sucesso!',
    expenseCreated: 'Despesa registrada com sucesso!',
    // Tabs e Perfil
    tabDashboard: 'Dashboard',
    tabProfile: 'Perfil',
    profile: 'Meu Perfil',
    updateProfile: 'Atualizar Perfil',
    newUsername: 'Novo Usuário',
    newPassword: 'Nova Senha',
    deleteAccount: 'Excluir Conta',
    deleteConfirm: 'Tem certeza que deseja excluir sua conta? Isso apagará todas as suas despesas e é irreversível.',
    profileUpdated: 'Perfil updated! Por favor, faça login novamente.',
    profileUpdateFailed: 'Falha ao atualizar. O usuário já pode existir.',
    accountDeleted: 'Conta excluída com sucesso.',
    accountDeleteFailed: 'Falha ao excluir a conta.',
    memberSince: 'Membro desde'
  }
};

// ==========================================
// 3. CUSTOM HOOKS
// ==========================================
function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  const start = async () => {
    try {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };

      mediaRecorder.start();
      setIsRecording(true);
      return true;
    } catch (error) {
      console.error("Mic error:", error);
      return false;
    }
  };

  const stop = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();

      // Desliga o hardware do microfone no navegador imediatamente
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      setIsRecording(false);
    }
  };

  const clear = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
  }, [audioUrl]);

  return { start, stop, clear, isRecording, audioBlob, audioUrl };
}

function usePersistedState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState] as const;
}

// ==========================================
// 4. COMPONENTE PRINCIPAL
// ==========================================
export default function App() {
  const [theme, setTheme] = usePersistedState<Theme>('app_theme', 'light');
  const [language, setLanguage] = usePersistedState<Language>('app_language', 'pt');
  const [token, setToken] = usePersistedState<string | null>('app_token', null);

  const [mensagem, setMensagem] = useState({ text: '', type: 'info' });
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const t = translations[language];
  const recorder = useAudioRecorder();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const showMessage = useCallback((text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setMensagem({ text, type });
    setTimeout(() => setMensagem({ text: '', type: 'info' }), 6000);
  }, []);

  const handleLogout = useCallback(() => {
    setToken(null);
    setExpenses([]);
    setUserProfile(null);
    recorder.clear();
    showMessage(t.logoutSuccess, 'success');
  }, [setToken, recorder, showMessage, t.logoutSuccess]);

  // --- BUSCAR DADOS DO USUÁRIO ---
  useEffect(() => {
    if (token) {
      fetch(`${API_BASE_URL}/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => setUserProfile(data))
      .catch(() => handleLogout());
    }
  }, [token, handleLogout]);

  // --- HANDLERS DE AUTENTICAÇÃO E PERFIL ---
  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username');
    const password = formData.get('password');
    const endpoint = showLogin ? '/auth/login' : '/users';

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) throw new Error();

      if (showLogin) {
        const jwt = await response.text();
        setToken(jwt);
        showMessage(t.loginSuccess, 'success');
        setActiveTab('dashboard');
      } else {
        showMessage(t.registerSuccess, 'success');
        setShowLogin(true);
      }
    } catch {
      showMessage(showLogin ? t.loginFailed : t.registerFailed, 'error');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get('newUsername');
    const password = formData.get('newPassword');

    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) throw new Error();

      showMessage(t.profileUpdated, 'success');
      setToken(null);
      setUserProfile(null);
    } catch {
      showMessage(t.profileUpdateFailed, 'error');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm(t.deleteConfirm)) return;

    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error();

      showMessage(t.accountDeleted, 'success');
      setToken(null);
      setUserProfile(null);
    } catch {
      showMessage(t.accountDeleteFailed, 'error');
    }
  };

  // --- HANDLERS DE ÁUDIO & IA ---
  const sendAudioToAI = async () => {
    if (!recorder.audioBlob || !token) return;

    setIsProcessing(true);
    showMessage(t.processing, 'info');

    const formData = new FormData();
    formData.append('file', recorder.audioBlob, 'audio.webm');

    try {
      const response = await fetch(`${API_BASE_URL}/expense/process`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!response.ok) throw new Error('Falha no processamento');
      const data = await response.json();

      if (Array.isArray(data)) {
        setExpenses(data);
        showMessage(t.querySuccess, 'success');
      }
      else if (data && data.description) {
        setExpenses([]);
        showMessage(t.expenseCreated, 'success');
      }

      recorder.clear();
    } catch (error) {
      showMessage(t.sendError, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="app-container">
      {/* Cabeçalho */}
      <header className="header">
        <h1>🎙️ {t.title}</h1>
        <div className="controls">
          <button className="btn-icon" onClick={() => setLanguage(l => l === 'en' ? 'pt' : 'en')}>
            {language === 'en' ? '🇧🇷 PT' : '🇺🇸 EN'}
          </button>
          <button className="btn-icon" onClick={() => setTheme(th => th === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      <div className="content-wrapper">
        {/* Sistema de Alertas */}
        {mensagem.text && (
          <div style={{
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            color: '#fff',
            animation: 'fadeIn 0.3s ease',
            backgroundColor: mensagem.type === 'error' ? 'var(--danger)' : (mensagem.type === 'success' ? 'var(--success)' : 'var(--primary)')
          }}>
            {mensagem.text}
          </div>
        )}

        {/* Tela de Login / Registro */}
        {!token ? (
          <div className="card form-card">
            <h2>{showLogin ? t.login : t.register}</h2>
            <form onSubmit={handleAuth}>
              <div className="form-group">
                <label>{t.username}</label>
                <input name="username" type="text" placeholder={t.username} required />
              </div>
              <div className="form-group">
                <label>{t.password}</label>
                <input name="password" type="password" placeholder={t.password} required />
              </div>
              <button className="btn btn-primary" type="submit">
                {showLogin ? t.enter : t.signUp}
              </button>
            </form>

            <div className="toggle-auth">
              {showLogin ? t.noAccount : t.haveAccount}
              <button type="button" className="btn-link" onClick={() => { setShowLogin(!showLogin); setMensagem({text: '', type: 'info'}); }}>
                {showLogin ? t.signUp : t.enter}
              </button>
            </div>
          </div>
        ) : (
          /* ÁREA LOGADA */
          <>
            {/* Status e Navegação de Abas */}
            <div className="card status-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', padding: '1rem 2rem', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="status-badge">
                  ✓ {t.logged} {userProfile && `- @${userProfile.username}`}
                </div>
                <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                  {t.logout}
                </button>
              </div>

              {/* Menu das Abas */}
              <div style={{ display: 'flex', gap: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem',
                    color: activeTab === 'dashboard' ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: activeTab === 'dashboard' ? '600' : '400',
                    borderBottom: activeTab === 'dashboard' ? '2px solid var(--primary)' : '2px solid transparent',
                    paddingBottom: '0.5rem', transition: 'all 0.2s'
                  }}
                >
                  📊 {t.tabDashboard}
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem',
                    color: activeTab === 'profile' ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: activeTab === 'profile' ? '600' : '400',
                    borderBottom: activeTab === 'profile' ? '2px solid var(--primary)' : '2px solid transparent',
                    paddingBottom: '0.5rem', transition: 'all 0.2s'
                  }}
                >
                  👤 {t.tabProfile}
                </button>
              </div>
            </div>

            {/* ABA: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="dashboard-grid">
                {/* WIDGET 1: GRAVADOR DE ÁUDIO */}
                <div className="card">
                  <h2>{t.recording}</h2>
                  <p className="subtitle">{t.recordingDesc}</p>

                  {!recorder.isRecording ? (
                    <button className="btn btn-primary" onClick={() => recorder.start()} disabled={isProcessing}>
                      🎙️ {t.startRecording}
                    </button>
                  ) : (
                    <button className="btn btn-secondary" onClick={() => recorder.stop()}>
                      {t.stopRecording}
                    </button>
                  )}

                  {recorder.audioUrl && (
                    <div className="audio-preview">
                      <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600' }}>{t.recorded}</p>
                      <audio controls src={recorder.audioUrl} />

                      <div className="audio-actions action-buttons">
                        <button className="btn btn-success" onClick={sendAudioToAI} disabled={isProcessing}>
                          {isProcessing ? '⏳...' : t.sendToAI}
                        </button>
                        <button className="btn btn-secondary" onClick={() => { recorder.clear(); showMessage(t.audioDiscarded, 'info'); }} disabled={isProcessing}>
                          🗑️
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* WIDGET 2: RESULTADOS DA IA (Tabela) */}
                <div className="card" style={{ opacity: expenses.length > 0 ? 1 : 0.5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ margin: 0 }}>{t.yourExpenses}</h2>
                    {expenses.length > 0 && (
                      <button className="btn btn-secondary btn-sm" onClick={() => setExpenses([])}>
                        {t.close}
                      </button>
                    )}
                  </div>

                  {expenses.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 1rem' }}>
                      <span style={{ fontSize: '2rem', display: 'block', marginBottom: '1rem' }}>📂</span>
                      {t.noExpenses}
                    </div>
                  ) : (
                    <>
                      <div className="table-responsive">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>{t.description}</th>
                              <th>{t.local}</th>
                              <th>{t.merchant}</th>
                              <th>{t.createdAt}</th>
                              <th className="amount">{t.amount}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {expenses.map((exp, i) => (
                              <tr key={exp.id || i}>
                                <td>{exp.description}</td>
                                <td>{exp.local}</td>
                                <td>{exp.merchant}</td>
                                <td>
                                  {exp.createdAt ? new Date(exp.createdAt).toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US') : 'N/A'}
                                </td>
                                <td className="amount">
                                  R$ {exp.amount.toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div style={{ marginTop: '1.5rem', textAlign: 'right', fontSize: '1.25rem' }}>
                        <span style={{ color: 'var(--text-muted)', marginRight: '1rem' }}>{t.total}:</span>
                        <strong>R$ {expenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}</strong>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ABA: PERFIL */}
            {activeTab === 'profile' && (
              <div className="dashboard-grid">
                <div className="card form-card">
                  <h2>👤 {t.profile}</h2>
                  {userProfile && (
                    <p className="subtitle" style={{ textAlign: 'center' }}>
                      {t.memberSince}: <strong>{new Date(userProfile.createdAt).toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US')}</strong>
                    </p>
                  )}

                  <form onSubmit={handleUpdateProfile} style={{ marginBottom: '2.5rem', marginTop: '1.5rem' }}>
                    <div className="form-group">
                      <label>{t.newUsername}</label>
                      <input name="newUsername" type="text" defaultValue={userProfile?.username} required />
                    </div>
                    <div className="form-group">
                      <label>{t.newPassword}</label>
                      <input name="newPassword" type="password" placeholder="***" required />
                    </div>
                    <button className="btn btn-secondary" type="submit">
                      {t.updateProfile}
                    </button>
                  </form>

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
                    <button className="btn btn-danger" onClick={handleDeleteAccount}>
                      ⚠️ {t.deleteAccount}
                    </button>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.75rem', textAlign: 'center' }}>
                      * {t.deleteConfirm}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}