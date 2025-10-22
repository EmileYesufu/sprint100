// Client Component Tests
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from '../src/screens/Auth/LoginScreen';
import { formatElo } from '../src/utils/formatting';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
};

// Mock useAuth hook
jest.mock('../src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    token: null,
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
  }),
}));

// Mock useSocket hook
jest.mock('../src/hooks/useSocket', () => ({
  useSocket: () => ({
    socket: null,
    isConnected: false,
    joinQueue: jest.fn(),
    leaveQueue: jest.fn(),
  }),
}));

// Mock getServerUrl
jest.mock('../src/config', () => ({
  getServerUrl: () => 'http://localhost:4000',
}));

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SafeAreaProvider>
    <NavigationContainer>
      {children}
    </NavigationContainer>
  </SafeAreaProvider>
);

describe('Component Tests', () => {
  describe('LoginScreen', () => {
    it('should render login form', () => {
      render(
        <TestWrapper>
          <LoginScreen navigation={mockNavigation as any} route={{} as any} />
        </TestWrapper>
      );

      // Check if login form elements are present
      expect(screen.getByText('Login')).toBeTruthy();
      expect(screen.getByPlaceholderText('Email')).toBeTruthy();
      expect(screen.getByPlaceholderText('Password')).toBeTruthy();
      expect(screen.getByText('Login')).toBeTruthy();
    });

    it('should render register link', () => {
      render(
        <TestWrapper>
          <LoginScreen navigation={mockNavigation as any} route={{} as any} />
        </TestWrapper>
      );

      expect(screen.getByText('Register')).toBeTruthy();
    });
  });

  describe('Utility Functions', () => {
    it('should format ELO rating correctly', () => {
      expect(formatElo(1200)).toBe('1200');
      expect(formatElo(1500)).toBe('1500');
      expect(formatElo(999)).toBe('999');
    });
  });
});
