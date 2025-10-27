import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Splitease application', () => {
  render(<App />);
  // Verifica que la aplicación se renderice correctamente buscando el título principal
  const titleElement = screen.getByText(/Divide tus/i);
  expect(titleElement).toBeInTheDocument();
});
