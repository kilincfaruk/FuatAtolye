import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import App from './App.jsx';

vi.mock('./supabaseClient', () => {
  const query = {
    select: vi.fn(async () => ({ data: [], error: null })),
    insert: vi.fn(async () => ({ data: [], error: null })),
    update: vi.fn(() => ({ eq: vi.fn(async () => ({ data: [], error: null })) })),
    upsert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(async () => ({ data: { id: 'cust-1', name: 'Test' }, error: null }))
      }))
    })),
    eq: vi.fn(async () => ({ data: [], error: null }))
  };

  return {
    supabase: {
      auth: {
        signInWithPassword: vi.fn(async () => ({
          data: { user: { email: 'test@example.com' } },
          error: null
        })),
        signOut: vi.fn(async () => ({ error: null })),
        getSession: vi.fn(async () => ({ data: { session: null }, error: null })),
        onAuthStateChange: vi.fn(() => ({
          data: { subscription: { unsubscribe: vi.fn() } }
        }))
      },
      from: vi.fn(() => query)
    }
  };
});

const mockGoldResponse = { status: 'success', price: '1234.56' };

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('fetch', vi.fn(async () => ({
      json: async () => mockGoldResponse
    })));
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('renders login screen by default', async () => {
    render(<App />);
    expect(await screen.findByText('KUYUMCU ATÖLYESİ')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /giriş yap/i })).toBeInTheDocument();
  });

  it('logs in with valid credentials and shows dashboard', async () => {
    render(<App />);
    fireEvent.change(await screen.findByLabelText(/e-posta/i), { target: { value: 'admin@example.com' } });
    fireEvent.change(screen.getByLabelText(/şifre/i), { target: { value: 'admin123' } });
    fireEvent.click(screen.getAllByRole('button', { name: /giriş yap/i })[0]);

    expect(await screen.findByText('Genel Bakış')).toBeInTheDocument();
  });
});
