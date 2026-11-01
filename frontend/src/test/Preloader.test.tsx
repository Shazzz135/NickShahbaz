import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Preloader } from '../components/layout/Preloader';

describe('Preloader', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders monogram, telemetry indicator and progress initially', () => {
    render(<Preloader />);

    expect(screen.getByLabelText(/Nick Shahbaz Monogram/i)).toBeDefined();
    expect(screen.getByText(/System Loading/i)).toBeDefined();
    expect(screen.getByText(/Press or Click to Skip/i)).toBeDefined();
  });

  it('bypasses immediately when bypass prop is true', () => {
    const onComplete = vi.fn();
    render(<Preloader bypass onComplete={onComplete} />);

    expect(onComplete).toHaveBeenCalled();
    expect(screen.queryByLabelText(/Nick Shahbaz Monogram/i)).toBeNull();
  });

  it('allows user to skip and trigger completion', () => {
    const onComplete = vi.fn();
    render(<Preloader onComplete={onComplete} />);

    const skipButton = screen.getByText(/Press or Click to Skip/i);
    fireEvent.click(skipButton);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(sessionStorage.getItem('visited_ns_portfolio')).toBe('true');
  });

  it('progresses to 100% and marks session as visited', () => {
    render(<Preloader />);

    for (let i = 0; i < 50; i++) {
      act(() => {
        vi.advanceTimersByTime(40);
      });
    }

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(sessionStorage.getItem('visited_ns_portfolio')).toBe('true');
  });
});
