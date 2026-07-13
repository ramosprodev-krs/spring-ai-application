import { useState, useRef, useEffect } from 'react';

interface Expense {
  id?: number;
  description: string;
  amount: number;
  local: string;
  merchant: string;
  createdAt?: string;
}

interface UserEntity {
  id?: number;
  username: string;
  createdAt?: string;
}

interface UserPatchDto {
  username: string;
  password: string;
}

type Language = 'en' | 'pt';
type Theme = 'light' | 'dark';

const translations = {
  en: {
    title: 'Financial Panel - AI Powered',
    login: 'Login',
    register: 'Register',
    username: 'Username',
    password: 'Password',
    enter: 'Enter',
    signUp: 'Sign Up',
    logout: 'Logout',
    logged: 'Logged in (JWT active)',
    recording: 'Audio Recording',
    recordingDesc: 'Record audio and AI will automatically determine what you want to do - create an expense or query your data.',
    startRecording: 'Start Recording',
    stopRecording: 'Stop Recording',
    recorded: 'Recorded audio:',
    sendToAI: 'Send to AI',
    discard: 'Discard',
    yourExpenses: 'Your Expenses',
    description: 'Description',
    local: 'Location',
    merchant: 'Merchant',
    amount: 'Amount',
    createdAt: 'Date',
    total: 'Total',
    close: 'Close',
    noExpenses: 'No expenses found.',
    loginSuccess: 'Login successful!',
    loginFailed: 'Login failed. Check your credentials.',
    registerSuccess: 'Registration successful! Please login.',
    registerFailed: 'Registration failed. Username may already exist.',
    connectionError: 'Connection error with server.',
    recordingNow: 'Recording... Speak your expense or query.',
    recordingFinished: 'Recording finished. Ready to send.',
    sendingAI: 'Sending to backend and processing with AI...',
    expenseCreated: 'Success! Expense registered: ',
 querySent: 'Sending query to backend...',
    querySuccess: 'Query completed! ',
    expenseFound: ' expense(s) found.',
    queryFailed: 'Error processing query. Check if your request is valid.',
    audioError: 'Error accessing microphone.',
    sendError: 'Connection error sending audio.',
    logoutSuccess: 'Logout successful.',
    audioDiscarded: 'Audio discarded. Record again.',
    haveAccount: 'Already have an account?',
    noAccount: "Don't have an account?",
    processing: 'AI is determining your intent...',
    intentCreate: 'AI detected: Creating expense',
    intentQuery: 'AI detected: Querying expenses',
    aiProcessing: 'Processing with AI...',
    welcome: 'Welcome to your financial assistant',
    profile: 'User Profile',
    profileDesc: 'View and manage your account information.',
    currentUsername: 'Current Username',
    memberSince: 'Member Since',
    editProfile: 'Edit Profile',
    deleteAccount: 'Delete Account',
    newUsername: 'New Username',
    newPassword: 'New Password',
    updateProfile: 'Update Profile',
    cancel: 'Cancel',
    profileUpdated: 'Profile updated successfully!',
    profileUpdateFailed: 'Failed to update profile.',
    deleteAccountConfirm: 'Are you sure you want to delete your account? This action cannot be undone.',
    accountDeleted: 'Account deleted successfully.',
    accountDeleteFailed: 'Failed to delete account.',
  },
  pt: {
    title: 'Painel Financeiro - API com IA',
    login: 'Login',
    register: 'Cadastro',
    username: 'Usuário',
    password: 'Senha',
    enter: 'Entrar',
    signUp: 'Cadastrar',
    logout: 'Sair',
    logged: 'Logado (JWT ativo)',
    recording: 'Gravação de Áudio',
    recordingDesc: 'Grave um áudio e a IA determinará automaticamente o que você quer fazer - criar uma despesa ou consultar seus dados.',
    startRecording: 'Iniciar Gravação',
    stopRecording: 'Parar Gravação',
    recorded: 'Áudio gravado:',
    sendToAI: 'Enviar para IA',
    discard: 'Descartar',
    yourExpenses: 'Suas Despesas',
    description: 'Descrição',
    local: 'Local',
    merchant: 'Comerciante',
    amount: 'Valor',
    createdAt: 'Data',
    total: 'Total',
    close: 'Fechar',
    noExpenses: 'Nenhuma despesa encontrada.',
    loginSuccess: 'Login realizado com sucesso!',
    loginFailed: 'Falha no login. Verifique suas credenciais.',
    registerSuccess: 'Cadastro realizado com sucesso! Faça login.',
    registerFailed: 'Falha no cadastro. Usuário já pode existir.',
    connectionError: 'Erro de conexão com o servidor.',
    recordingNow: 'Gravando... Fale a sua despesa ou consulta.',
    recordingFinished: 'Gravação finalizada. Pronto para enviar.',
    sendingAI: 'Enviando para o backend e processando IA...',
    expenseCreated: 'Sucesso! Despesa registrada: ',
    querySent: 'Enviando consulta para o backend...',
    querySuccess: 'Consulta realizada! ',
    expenseFound: ' despesa(s) encontrada(s).',
    queryFailed: 'Erro ao processar a consulta. Verifique se sua solicitação é válida.',
    audioError: 'Erro ao acessar o microfone.',
    sendError: 'Erro de conexão ao enviar o áudio.',
    logoutSuccess: 'Logout realizado.',
    audioDiscarded: 'Áudio descartado. Grave novamente.',
    haveAccount: 'Já tem uma conta?',
    noAccount: 'Não tem uma conta?',
    processing: 'A IA está determinando sua intenção...',
    intentCreate: 'IA detectou: Criando despesa',
    intentQuery: 'IA detectou: Consultando despesas',
    aiProcessing: 'Processando com IA...',
    welcome: 'Bem-vindo ao seu assistente financeiro',
    profile: 'Perfil do Usuário',
    profileDesc: 'Visualize e gerencie suas informações de conta.',
    currentUsername: 'Usuário Atual',
    memberSince: 'Membro Desde',
    editProfile: 'Editar Perfil',
    deleteAccount: 'Excluir Conta',
    newUsername: 'Novo Usuário',
    newPassword: 'Nova Senha',
    updateProfile: 'Atualizar Perfil',
    cancel: 'Cancelar',
    profileUpdated: 'Perfil atualizado com sucesso!',
    profileUpdateFailed: 'Falha ao atualizar perfil.',
    deleteAccountConfirm: 'Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.',
    accountDeleted: 'Conta excluída com sucesso.',
    accountDeleteFailed: 'Falha ao excluir conta.',
  }
};

function App() {
  // Authentication state
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showLogin, setShowLogin] = useState(true);
  
  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mensagem, setMensagem] = useState('');
  
  // Expenses state
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showExpenses, setShowExpenses] = useState(false);
  
  // User profile state
  const [currentUser, setCurrentUser] = useState<UserEntity | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // UI state
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('light');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const t = translations[language];

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'pt' : 'en');
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // --- AUTHENTICATION LOGIC ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const jwt = await response.text();
        setToken(jwt);
        setMensagem(t.loginSuccess);
        // Fetch current user data after login
        fetchCurrentUser(jwt);
      } else {
        setMensagem(t.loginFailed);
      }
    } catch (error) {
      setMensagem(t.connectionError);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/v1/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        setMensagem(t.registerSuccess);
        setShowLogin(true);
      } else {
        setMensagem(t.registerFailed);
      }
    } catch (error) {
      setMensagem(t.connectionError);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUsername('');
    setPassword('');
    setExpenses([]);
    setShowExpenses(false);
    setAudioBlob(null);
    setCurrentUser(null);
    setShowProfile(false);
    setMensagem(t.logoutSuccess);
  };

  // --- AUDIO RECORDING LOGIC ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setMensagem(t.recordingNow);
    } catch (error) {
      setMensagem(t.audioError);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setMensagem(t.recordingFinished);
    }
  };

  // --- AI-POWERED AUDIO PROCESSING ---
  const sendAudioToAI = async () => {
    if (!audioBlob || !token) return;

    setIsProcessing(true);
    setMensagem(t.processing);
    
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');

    try {
      // Send to unified endpoint that determines intent automatically
      const response = await fetch('http://localhost:8080/api/v1/expense/process', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Processing failed');
      }

      const data = await response.json();
      console.log('Response from unified endpoint:', data);

      // Check if response is an array (query result) or single object (create result)
      if (Array.isArray(data)) {
        // Query result - array of expenses
        setExpenses(data);
        setShowExpenses(true);
        setMensagem(`${t.querySuccess}${data.length}${t.expenseFound}`);
      } else if (data && data.description && data.amount) {
        // Create result - single expense
        setMensagem(`${t.expenseCreated}${data.description} - R$ ${data.amount}`);
      } else {
        setMensagem('Unexpected response format');
      }

      setAudioBlob(null);
    } catch (error) {
      console.error('Error processing audio:', error);
      setMensagem(t.sendError);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAudio = () => {
    setAudioBlob(null);
    setMensagem(t.audioDiscarded);
  };

  // --- USER PROFILE LOGIC ---
  const fetchCurrentUser = async (authToken: string) => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/users/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleEditProfile = () => {
    if (currentUser) {
      setEditUsername(currentUser.username);
      setEditPassword('');
      setIsEditingProfile(true);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const response = await fetch('http://localhost:8080/api/v1/users/me', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: editUsername, password: editPassword })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setCurrentUser(updatedUser);
        setIsEditingProfile(false);
        setMensagem(t.profileUpdated);
        fetchCurrentUser(token);
      } else {
        setMensagem(t.profileUpdateFailed);
      }
    } catch (error) {
      setMensagem(t.profileUpdateFailed);
    }
  };

  const handleDeleteAccount = async () => {
    if (!token) return;

    try {
      const response = await fetch('http://localhost:8080/api/v1/users/me', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMensagem(t.accountDeleted);
        handleLogout();
      } else {
        setMensagem(t.accountDeleteFailed);
      }
    } catch (error) {
      setMensagem(t.accountDeleteFailed);
    }
  };

  // Styles based on theme
  const styles = {
    container: {
      padding: '2rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      maxWidth: '900px',
      margin: '0 auto',
      backgroundColor: theme === 'dark' ? '#1a1a2e' : '#f8fafc',
      minHeight: '100vh',
      color: theme === 'dark' ? '#e2e8f0' : '#1e293b',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      paddingBottom: '1rem',
      borderBottom: `2px solid ${theme === 'dark' ? '#4f46e5' : '#4f46e5'}`,
    },
    title: {
      margin: 0,
      fontSize: '2rem',
      fontWeight: '700',
      color: theme === 'dark' ? '#818cf8' : '#4f46e5',
    },
    controls: {
      display: 'flex',
      gap: '0.5rem',
    },
    controlButton: {
      padding: '0.5rem 1rem',
      border: `1px solid ${theme === 'dark' ? '#475569' : '#cbd5e1'}`,
      borderRadius: '8px',
      backgroundColor: theme === 'dark' ? '#334155' : 'white',
      color: theme === 'dark' ? '#e2e8f0' : '#1e293b',
      cursor: 'pointer',
      fontSize: '0.875rem',
      transition: 'all 0.2s',
    },
    card: {
      backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
      padding: '2rem',
      borderRadius: '16px',
      boxShadow: theme === 'dark' ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      marginBottom: '1.5rem',
    },
    cardTitle: {
      marginTop: 0,
      marginBottom: '1.5rem',
      fontSize: '1.5rem',
      fontWeight: '600',
      color: theme === 'dark' ? '#f1f5f9' : '#1e293b',
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: `1px solid ${theme === 'dark' ? '#475569' : '#cbd5e1'}`,
      borderRadius: '8px',
      fontSize: '1rem',
      backgroundColor: theme === 'dark' ? '#334155' : 'white',
      color: theme === 'dark' ? '#e2e8f0' : '#1e293b',
      transition: 'border-color 0.2s',
    },
    button: {
      width: '100%',
      padding: '0.875rem',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    primaryButton: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
    },
    secondaryButton: {
      background: theme === 'dark' ? '#475569' : '#64748b',
      color: 'white',
    },
    dangerButton: {
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      color: 'white',
    },
    successButton: {
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      color: 'white',
    },
    message: {
      padding: '1rem',
      marginBottom: '1rem',
      borderRadius: '8px',
      borderLeft: '4px solid',
    },
    errorMessage: {
      backgroundColor: theme === 'dark' ? '#7f1d1d' : '#fef2f2',
      borderColor: '#ef4444',
      color: theme === 'dark' ? '#fca5a5' : '#991b1b',
    },
    successMessage: {
      backgroundColor: theme === 'dark' ? '#14532d' : '#f0fdf4',
      borderColor: '#22c55e',
      color: theme === 'dark' ? '#86efac' : '#166534',
    },
    table: {
      width: '100%',
      marginTop: '1rem',
    },
    tableHeader: {
      backgroundColor: theme === 'dark' ? '#4f46e5' : '#4f46e5',
      color: 'white',
    },
    tableCell: {
      padding: '0.75rem',
      borderBottom: `1px solid ${theme === 'dark' ? '#475569' : '#e2e8f0'}`,
    },
    tableRow: (index: number) => ({
      backgroundColor: index % 2 === 0 ? (theme === 'dark' ? '#334155' : '#f8fafc') : (theme === 'dark' ? '#1e293b' : 'white'),
    }),
  };

  return (
    <div style={styles.container}>
      {/* Header with title and controls */}
      <div style={styles.header}>
        <h1 style={styles.title}>{t.title}</h1>
        <div style={styles.controls}>
          <button onClick={toggleLanguage} style={styles.controlButton}>
            {language === 'en' ? '🇧🇷 PT' : '🇺🇸 EN'}
          </button>
          <button onClick={toggleTheme} style={styles.controlButton}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>

      {/* Message display */}
      {mensagem && (
        <div style={{
          ...styles.message,
          ...(mensagem.includes('Erro') || mensagem.includes('Falha') || mensagem.includes('Error') || mensagem.includes('Failed') ? styles.errorMessage : styles.successMessage)
        }}>
          {mensagem}
        </div>
      )}

      {/* Authentication Screen */}
      {!token ? (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>{showLogin ? t.login : t.register}</h2>
          <form onSubmit={showLogin ? handleLogin : handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t.username}</label>
              <input
                type="text"
                placeholder={t.username}
                value={username}
                onChange={e => setUsername(e.target.value)}
                style={styles.input}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t.password}</label>
              <input
                type="password"
                placeholder={t.password}
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={styles.input}
                required
              />
            </div>
            <button type="submit" style={{ ...styles.button, ...styles.primaryButton }}>
              {showLogin ? t.enter : t.signUp}
            </button>
          </form>
          <p style={{ marginTop: '1rem', textAlign: 'center', color: theme === 'dark' ? '#94a3b8' : '#64748b' }}>
            {showLogin ? t.noAccount : t.haveAccount}
            <button
              type="button"
              onClick={() => { setShowLogin(!showLogin); setMensagem(''); }}
              style={{
                background: 'none',
                border: 'none',
                color: theme === 'dark' ? '#818cf8' : '#4f46e5',
                cursor: 'pointer',
                fontWeight: '600',
                marginLeft: '0.5rem'
              }}
            >
              {showLogin ? t.register : t.login}
            </button>
          </p>
        </div>
      ) : (
        /* Main Dashboard */
        <>
          {/* Status header */}
          <div style={{ ...styles.card, padding: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 0, color: theme === 'dark' ? '#4ade80' : '#16a34a', fontWeight: '600' }}>
                ✓ {t.logged}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  style={{ ...styles.button, ...styles.secondaryButton, width: 'auto', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  {t.profile}
                </button>
                <button
                  onClick={handleLogout}
                  style={{ ...styles.button, ...styles.dangerButton, width: 'auto', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  {t.logout}
                </button>
              </div>
            </div>
          </div>

          {/* User Profile Section */}
          {showProfile && (
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>{t.profile}</h2>
              <p style={{ color: theme === 'dark' ? '#94a3b8' : '#64748b', lineHeight: '1.6' }}>
                {t.profileDesc}
              </p>

              {!isEditingProfile ? (
                <>
                  {currentUser && (
                    <div style={{ marginTop: '1.5rem', padding: '1.5rem', backgroundColor: theme === 'dark' ? '#334155' : '#f1f5f9', borderRadius: '12px' }}>
                      <div style={{ marginBottom: '1rem' }}>
                        <p style={{ margin: 0, color: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                          {t.currentUsername}
                        </p>
                        <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>
                          {currentUser.username}
                        </p>
                      </div>
                      {currentUser.createdAt && (
                        <div>
                          <p style={{ margin: 0, color: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                            {t.memberSince}
                          </p>
                          <p style={{ margin: 0, fontSize: '1rem' }}>
                            {new Date(currentUser.createdAt).toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US')}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                    <button
                      onClick={handleEditProfile}
                      style={{ ...styles.button, ...styles.primaryButton, width: 'auto', padding: '0.875rem 1.5rem' }}
                    >
                      {t.editProfile}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      style={{ ...styles.button, ...styles.dangerButton, width: 'auto', padding: '0.875rem 1.5rem' }}
                    >
                      {t.deleteAccount}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t.newUsername}</label>
                      <input
                        type="text"
                        value={editUsername}
                        onChange={e => setEditUsername(e.target.value)}
                        style={styles.input}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{t.newPassword}</label>
                      <input
                        type="password"
                        value={editPassword}
                        onChange={e => setEditPassword(e.target.value)}
                        style={styles.input}
                        required
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button
                        type="submit"
                        style={{ ...styles.button, ...styles.primaryButton, width: 'auto', padding: '0.875rem 1.5rem' }}
                      >
                        {t.updateProfile}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        style={{ ...styles.button, ...styles.secondaryButton, width: 'auto', padding: '0.875rem 1.5rem' }}
                      >
                        {t.cancel}
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* Delete Account Confirmation Modal */}
              {showDeleteConfirm && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000
                }}>
                  <div style={{
                    ...styles.card,
                    maxWidth: '400px',
                    width: '90%'
                  }}>
                    <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600' }}>
                      {t.deleteAccount}
                    </h3>
                    <p style={{ color: theme === 'dark' ? '#94a3b8' : '#64748b', marginBottom: '1.5rem' }}>
                      {t.deleteAccountConfirm}
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        style={{ ...styles.button, ...styles.secondaryButton, width: 'auto', padding: '0.875rem 1.5rem' }}
                      >
                        {t.cancel}
                      </button>
                      <button
                        onClick={handleDeleteAccount}
                        style={{ ...styles.button, ...styles.dangerButton, width: 'auto', padding: '0.875rem 1.5rem' }}
                      >
                        {t.deleteAccount}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Audio Recording Section */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>{t.recording}</h2>
            <p style={{ color: theme === 'dark' ? '#94a3b8' : '#64748b', lineHeight: '1.6' }}>
              {t.recordingDesc}
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  style={{ ...styles.button, ...styles.dangerButton, width: 'auto', padding: '0.875rem 1.5rem' }}
                  disabled={isProcessing}
                >
                  🎙️ {t.startRecording}
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  style={{ ...styles.button, ...styles.secondaryButton, width: 'auto', padding: '0.875rem 1.5rem' }}
                >
                  ⏹️ {t.stopRecording}
                </button>
              )}
            </div>

            {audioBlob && (
              <div style={{ marginTop: '1.5rem', padding: '1.5rem', backgroundColor: theme === 'dark' ? '#334155' : '#f1f5f9', borderRadius: '12px' }}>
                <p style={{ margin: '0 0 1rem 0', fontWeight: '600' }}>{t.recorded}</p>
                <audio controls src={URL.createObjectURL(audioBlob)} style={{ width: '100%', marginBottom: '1rem' }}></audio>

                <button
                  onClick={sendAudioToAI}
                  disabled={isProcessing}
                  style={{ ...styles.button, ...styles.successButton, width: '100%' }}
                >
                  {isProcessing ? '⏳ Processing...' : '🤖 ' + t.sendToAI}
                </button>
              </div>
            )}
          </div>

          {/* Expenses List Section */}
          {showExpenses && (
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>{t.yourExpenses}</h2>
              {expenses.length > 0 ? (
                <>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={styles.table}>
                      <thead>
                        <tr style={styles.tableHeader}>
                          <th style={styles.tableCell}>{t.description}</th>
                          <th style={styles.tableCell}>{t.local}</th>
                          <th style={styles.tableCell}>{t.merchant}</th>
                          <th style={{ ...styles.tableCell, textAlign: 'right' as const }}>{t.amount}</th>
                          <th style={styles.tableCell}>{t.createdAt}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expenses.map((expense, index) => (
                          <tr key={index} style={styles.tableRow(index)}>
                            <td style={styles.tableCell}>{expense.description}</td>
                            <td style={styles.tableCell}>{expense.local}</td>
                            <td style={styles.tableCell}>{expense.merchant}</td>
                            <td style={{ ...styles.tableCell, textAlign: 'right' as const, fontWeight: '600' }}>
                              R$ {expense.amount.toFixed(2)}
                            </td>
                            <td style={styles.tableCell}>
                              {expense.createdAt ? new Date(expense.createdAt).toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US') : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p style={{ marginTop: '1rem', fontWeight: '700', textAlign: 'right' as const, fontSize: '1.125rem' }}>
                    {t.total}: R$ {expenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}
                  </p>
                </>
              ) : (
                <p style={{ color: theme === 'dark' ? '#94a3b8' : '#64748b', fontStyle: 'italic', textAlign: 'center' as const, padding: '2rem' }}>
                  {t.noExpenses}
                </p>
              )}
              <button
                onClick={() => setShowExpenses(false)}
                style={{ ...styles.button, ...styles.secondaryButton, marginTop: '1rem', width: 'auto', padding: '0.5rem 1.5rem' }}
              >
                {t.close}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
