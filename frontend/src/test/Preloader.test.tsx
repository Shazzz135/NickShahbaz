import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Preloader } from '../components/layout/Preloader';

describe('Preloader', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders monogram, telemetry indicator and progress initially for a new visitor', () => {
    render(<Preloader />);

    expect(screen.getByLabelText(/Nick Shahbaz Monogram/i)).toBeDefined();
    expect(screen.getByText(/System Loading/i)).toBeDefined();
  });

  it('bypasses immediately when bypass prop is true', () => {
    const onComplete = vi.fn();
    render(<Preloader bypass onComplete={onComplete} />);

    expect(onComplete).toHaveBeenCalled();
    expect(screen.queryByLabelText(/Nick Shahbaz Monogram/i)).toBeNull();
  });

  it('bypasses immediately on refresh if visited within the last 24 hours', () => {
    const onComplete = vi.fn();
    // Simulate visit 2 hours ago
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    localStorage.setItem('last_visited_ns_portfolio', twoHoursAgo.toString());

    render(<Preloader onComplete={onComplete} />);

    expect(onComplete).toHaveBeenCalled();
    expect(screen.queryByLabelText(/Nick Shahbaz Monogram/i)).toBeNull();
  });

  it('displays preloader if last visit was more than 24 hours ago', () => {
    const onComplete = vi.fn();
    // Simulate visit 25 hours ago
    const twentyFiveHoursAgo = Date.now() - 25 * 60 * 60 * 1000;
    localStorage.setItem('last_visited_ns_portfolio', twentyFiveHoursAgo.toString());

    render(<Preloader onComplete={onComplete} />);

    expect(screen.getByLabelText(/Nick Shahbaz Monogram/i)).toBeDefined();
    expect(screen.getByText(/System Loading/i)).toBeDefined();
  });

  it('progresses to 100% and stores visit timestamp in localStorage', () => {
    render(<Preloader />);

    for (let i = 0; i < 50; i++) {
      act(() => {
        vi.advanceTimersByTime(40);
      });
    }

    act(() => {
      vi.advanceTimersByTime(300);
    });

    const storedTime = localStorage.getItem('last_visited_ns_portfolio');
    expect(storedTime).not.toBeNull();
    expect(Number(storedTime)).toBeGreaterThan(0);
  });
});
