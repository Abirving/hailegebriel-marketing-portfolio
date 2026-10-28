import { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Copy,
  LoaderCircle,
  Mail,
} from 'lucide-react';
import {
  buildContactDraft,
  normalizeContact,
  validateContact,
} from '../lib/contact.mjs';

// Default: a real, prefilled email draft; no credentials required.
// Set VITE_CONTACT_MODE=api to use the included Vercel endpoint instead.
const apiMode = import.meta.env.VITE_CONTACT_MODE === 'api';

export default function ContactForm() {
  const formRef = useRef(null);
  const abortRef = useRef(null);
  const busy = useRef(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [feedback, setFeedback] = useState('');
  const [draft, setDraft] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => () => abortRef.current?.abort(), []);

  async function handleSubmit(event) {
    event.preventDefault();
    if (busy.current) return;
    const values = normalizeContact(
      Object.fromEntries(new FormData(event.currentTarget)),
    );
    // Honeypot field is never part of the visitor-facing flow.
    if (values.website) return;
    const validation = validateContact(values);
    setErrors(validation);
    setCopied(false);
    if (Object.keys(validation).length) {
      setStatus('error');
      setFeedback('Please check the highlighted fields.');
      formRef.current.elements.namedItem(Object.keys(validation)[0])?.focus();
      return;
    }

    const emailDraft = buildContactDraft(values);
    setDraft(emailDraft);
    if (!apiMode) {
      window.location.href = emailDraft.href;
      setStatus('draft');
      setFeedback(
        'Your email draft is ready. Finish sending it in your email app. If it didn’t open, use the links below.',
      );
      return;
    }

    busy.current = true;
    setStatus('sending');
    setFeedback('Sending your message…');
    const controller = new AbortController();
    abortRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        signal: controller.signal,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.ok !== true)
        throw new Error('Delivery was not confirmed.');
      setStatus('sent');
      setFeedback('Your message has been sent. Thank you for reaching out.');
      setDraft(null);
      formRef.current.reset();
    } catch {
      setStatus('error');
      setFeedback(
        'Delivery wasn’t confirmed. Your message is still here — open an email draft or copy it below.',
      );
    } finally {
      window.clearTimeout(timeout);
      busy.current = false;
      abortRef.current = null;
    }
  }

  async function copyDraft() {
    try {
      await navigator.clipboard.writeText(
        `Subject: ${draft.subject}\n\n${draft.body}`,
      );
      setCopied(true);
    } catch {
      setFeedback(
        'Copy isn’t available in this browser. Open the email draft or select your message in the form.',
      );
    }
  }

  function fieldError(name) {
    return errors[name] ? (
      <span className="field-error" id={`${name}-error`}>
        {errors[name]}
      </span>
    ) : null;
  }

  return (
    <form
      className="contact-form reveal"
      style={{ '--reveal-delay': '110ms' }}
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      aria-label="Project inquiry"
      aria-busy={status === 'sending'}
    >
      <div className="form-heading">
        <span>Tell me about your project</span>
        <ArrowUpRight size={19} aria-hidden="true" />
      </div>
      <div className="form-row">
        <label>
          Your name <span>*</span>
          <input
            name="name"
            type="text"
            autoComplete="name"
            placeholder="How should I call you?"
            required
            minLength={2}
            maxLength={100}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {fieldError('name')}
        </label>
        <label>
          Email address <span>*</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            required
            maxLength={254}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {fieldError('email')}
        </label>
      </div>
      <label>
        What can I help with?
        <div className="select-wrapper">
          <select name="service" defaultValue="">
            <option value="">Let’s explore the possibilities</option>
            <option>Social Media Marketing</option>
            <option>AI Content Creation</option>
             <option>Video Editing</option> 
            <option>Content Strategy</option>
            <option>Email &amp; Retention Marketing</option>
            <option>Algorithmic SEO &amp; Discovery</option>
            <option>Performance Analytics</option>
            <option>Something else</option>
          </select>
          <ChevronDown size={16} aria-hidden="true" />
        </div>
        {fieldError('service')}
      </label>
      <label>
        A little about your project <span>*</span>
        <textarea
          name="message"
          placeholder="Your brand, your goals, your big idea…"
          rows={4}
          required
          minLength={20}
          maxLength={5000}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'message-error' : undefined}
        />
        {fieldError('message')}
      </label>
      <div className="honeypot" aria-hidden="true">
        <label>
          Leave this field empty
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="form-bottom">
        <span>
          {apiMode
            ? 'Sent directly. Only used to reply.'
            : 'Opens a draft in your email app.'}
        </span>
        <button
          className="button button-primary"
          type="submit"
          disabled={status === 'sending'}
        >
          {status === 'sending' ? (
            <>
              Sending{' '}
              <LoaderCircle size={16} className="spin" aria-hidden="true" />
            </>
          ) : (
            <>
              {apiMode ? 'Send message' : 'Open email draft'}
              <ArrowUpRight size={17} aria-hidden="true" />
            </>
          )}
        </button>
      </div>
      <div
        className={`form-feedback ${status === 'error' ? 'is-error' : ''}`}
        role="status"
        aria-live="polite"
      >
        {feedback && (
          <p>
            {status === 'sent' && <Check size={16} aria-hidden="true" />}
            {feedback}
          </p>
        )}
        {draft && status !== 'sent' && status !== 'sending' && (
          <div className="draft-actions">
            <a href={draft.href}>
              <Mail size={14} aria-hidden="true" />
              Open email draft
            </a>
            <button type="button" onClick={copyDraft}>
              {copied ? (
                <Check size={14} aria-hidden="true" />
              ) : (
                <Copy size={14} aria-hidden="true" />
              )}
              {copied ? 'Copied' : 'Copy message'}
            </button>
          </div>
        )}
      </div>
    </form>
  );
}
