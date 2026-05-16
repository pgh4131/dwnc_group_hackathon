import { useState } from 'react';
import { signInWithEmail, signUpWithEmail } from '../services/auth.js';

export default function AuthModal({ copy, isOpen, onClose }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) {
    return null;
  }

  const submitLabel = mode === 'login' ? copy.loginButton : copy.signupButton;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setStatus('');
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await signInWithEmail({ email, password });
        setStatus(copy.loginSuccess);
        onClose();
      } else {
        await signUpWithEmail({ email, password });
        setStatus(copy.signupSuccess);
      }
    } catch (authError) {
      setError(authError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-backdrop" role="presentation">
      <section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <div className="auth-modal-top">
          <div>
            <h2 id="auth-title">{copy.title}</h2>
            <p>{copy.description}</p>
          </div>
          <button className="auth-close" type="button" onClick={onClose} aria-label={copy.closeLabel}>
            ×
          </button>
        </div>

        <div className="auth-tabs" role="tablist" aria-label="인증 방식">
          <button
            className={mode === 'login' ? 'is-active' : ''}
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
              setStatus('');
            }}
          >
            {copy.loginTab}
          </button>
          <button
            className={mode === 'signup' ? 'is-active' : ''}
            type="button"
            onClick={() => {
              setMode('signup');
              setError('');
              setStatus('');
            }}
          >
            {copy.signupTab}
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>{copy.emailLabel}</span>
            <input
              type="email"
              value={email}
              placeholder={copy.emailPlaceholder}
              autoComplete="email"
              required
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label>
            <span>{copy.passwordLabel}</span>
            <input
              type="password"
              value={password}
              placeholder={copy.passwordPlaceholder}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={6}
              required
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error ? <p className="auth-message auth-error">{error}</p> : null}
          {status ? <p className="auth-message auth-success">{status}</p> : null}

          <button className="button button-primary button-large" type="submit" disabled={isSubmitting}>
            {isSubmitting ? copy.loadingLabel : submitLabel}
          </button>
        </form>
      </section>
    </div>
  );
}
