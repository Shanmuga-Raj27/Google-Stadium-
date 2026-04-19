import { render, screen } from '@testing-library/react';
import App from './App';
import { describe, it, expect } from 'vitest';

describe('App Component Baseline', () => {
  it('renders without crashing and shows the application title', () => {
    render(<App />);
    
    // The LandingPage or Login page should have 'Google Stadium'
    const titleElements = screen.getAllByText(/Google Stadium/i);
    expect(titleElements.length).toBeGreaterThan(0);
  });
});
