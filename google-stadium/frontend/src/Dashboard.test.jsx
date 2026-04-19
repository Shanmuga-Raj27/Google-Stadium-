import { render, screen, waitFor } from '@testing-library/react';
import FanDashboard from './pages/FanDashboard';
import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';

// Mock dependencies
vi.mock('axios');
vi.mock('./store/authStore', () => ({
  useAuthStore: () => ({
    token: 'fake-token',
    user: { id: 1, username: 'testuser' }
  })
}));

describe('FanDashboard Component Integration', () => {
  it('renders "Available Vendors" header and fetched store name', async () => {
    const mockVendors = [
      { 
        id: 1, 
        username: 'testvendor', 
        vendor_profile: { 
          store_name: 'Stadium Snacks', 
          menu_items: [] 
        } 
      }
    ];
    
    // Mock sequential or specific GET calls
    axios.get.mockImplementation((url) => {
      if (url.includes('/vendors/')) return Promise.resolve({ data: mockVendors });
      if (url.includes('/map/config')) return Promise.resolve({ data: { overrides: {} } });
      if (url.includes('/gates/status')) return Promise.resolve({ data: {} });
      if (url.includes('/orders/me/active')) return Promise.resolve({ data: null });
      if (url.includes('/auth/me')) return Promise.resolve({ data: {} });
      return Promise.reject(new Error('not found'));
    });

    render(
      <BrowserRouter>
        <FanDashboard />
      </BrowserRouter>
    );

    // Assert Header
    expect(screen.getByText(/Available Vendors/i)).toBeInTheDocument();

    // Assert fetched Vendor name appears after async load
    await waitFor(() => {
      expect(screen.getByText(/Stadium Snacks/i)).toBeInTheDocument();
    });
  });
});
