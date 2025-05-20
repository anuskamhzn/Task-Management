import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock react-router-dom to avoid runtime routing issues
jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    ...originalModule,
    Routes: ({ children }) => <div>{children}</div>,
    Route: ({ element }) => <div>{element}</div>,
    NavLink: () => <div>Mocked NavLink</div>,
  };
});

// Mock all lazy-loaded components used in App.jsx
jest.mock('./Pages/Homepage', () => () => <div>Homepage</div>);
jest.mock('./Pages/Auth/Login', () => () => <div>Login Page</div>);
jest.mock('./Pages/Auth/Registration', () => () => <div>Register Page</div>);

import App from './App';

test('renders homepage route', () => {
  render(<App />);
  const homepageText = screen.getByText(/homepage/i);
  expect(homepageText).toBeInTheDocument();
});
