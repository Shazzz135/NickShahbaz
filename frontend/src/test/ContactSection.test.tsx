import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContactSection } from '../components/sections/ContactSection';
import * as contactService from '../lib/contactService';

// Mock smooth scroll hook
vi.mock('../hooks/useSmoothScroll', () => ({
  useSmoothScroll: () => ({
    scrollTo: vi.fn(),
  }),
}));

describe('ContactSection', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders section header and peripheral widgets', () => {
    render(<ContactSection />);

    expect(screen.getByText(/Architectural Partnership/i)).toBeDefined();
    expect(screen.getByRole('heading', { name: /Project Specification/i })).toBeDefined();
    expect(screen.getByText(/Direct Line/i)).toBeDefined();
    expect(screen.getByText(/nickshahbaz135@gmail.com/i)).toBeDefined();
    expect(screen.getByText(/Location & Timezone/i)).toBeDefined();
    expect(screen.getByText(/Toronto, CA • Eastern Time/i)).toBeDefined();
    expect(screen.getByText(/Verified Social Profiles/i)).toBeDefined();
    expect(screen.getByText(/GitHub/i)).toBeDefined();
    expect(screen.getByText(/X \(Twitter\)/i)).toBeDefined();
    expect(screen.getByText(/LinkedIn/i)).toBeDefined();
    expect(screen.getByText(/Version 4.0/i)).toBeDefined();
  });

  it('validates required fields on empty submit attempt', async () => {
    render(<ContactSection />);

    const submitBtn = screen.getByRole('button', { name: /Dispatch Technical Inquiry/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Full name must be at least 2 characters/i)).toBeDefined();
      expect(screen.getByText(/Email address is required/i)).toBeDefined();
      expect(screen.getByText(/Project message must be at least 10 characters/i)).toBeDefined();
    });
  });

  it('displays error if email format is invalid', async () => {
    render(<ContactSection />);

    const nameInput = screen.getByPlaceholderText(/Alex Mercer/i);
    const emailInput = screen.getByPlaceholderText(/alex@enterprise.com/i);
    const messageInput = screen.getByPlaceholderText(/Outline system goals/i);

    fireEvent.change(nameInput, { target: { value: 'Nick Developer' } });
    fireEvent.change(emailInput, { target: { value: 'not-an-email' } });
    fireEvent.change(messageInput, { target: { value: 'We need high performance 3D architecture' } });

    const submitBtn = screen.getByRole('button', { name: /Dispatch Technical Inquiry/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Please provide a valid email address/i)).toBeDefined();
    });
  });

  it('successfully submits inquiry and resets form inputs', async () => {
    vi.spyOn(contactService, 'submitContactInquiry').mockResolvedValue({
      success: true,
      message: 'Your inquiry has been received. Expect a response within 24 hours.',
    });

    render(<ContactSection />);

    const nameInput = screen.getByPlaceholderText(/Alex Mercer/i) as HTMLInputElement;
    const emailInput = screen.getByPlaceholderText(/alex@enterprise.com/i) as HTMLInputElement;
    const messageInput = screen.getByPlaceholderText(/Outline system goals/i) as HTMLTextAreaElement;

    fireEvent.change(nameInput, { target: { value: 'Elena Rostova' } });
    fireEvent.change(emailInput, { target: { value: 'elena@cybernetics.io' } });
    fireEvent.change(messageInput, { target: { value: 'Building an enterprise 3D spatial web interface.' } });

    const submitBtn = screen.getByRole('button', { name: /Dispatch Technical Inquiry/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Inquiry Dispatched Successfully/i)).toBeDefined();
      expect(screen.getByText(/Your inquiry has been received/i)).toBeDefined();
    });

    expect(nameInput.value).toBe('');
    expect(emailInput.value).toBe('');
    expect(messageInput.value).toBe('');
  });

  it('allows copying direct email address to clipboard', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<ContactSection />);

    const copyBtn = screen.getByRole('button', { name: /Copy/i });
    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith('nickshahbaz135@gmail.com');
      expect(screen.getByText(/Copied/i)).toBeDefined();
    });
  });
});