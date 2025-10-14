// ============================================
// 📚 GUÍA DE PRUEBAS UNITARIAS EXPLICADA
// ============================================

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Hero from '../Hero';
import '@testing-library/jest-dom';

// Mock de useNavigate (simula la función de navegación)
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

// ============================================
// DESCRIBE: Agrupa pruebas relacionadas
// Es como una "carpeta" que contiene tests similares
// ============================================
describe('Hero Component', () => {
  
  // Mock (simulación) de la función onOpenModal
  const mockOnOpenModal = jest.fn();

  // beforeEach: Se ejecuta ANTES de cada test
  beforeEach(() => {
    jest.clearAllMocks(); // Limpia los mocks para cada prueba
  });

  // Función auxiliar para renderizar el componente
  const renderHero = () => {
    return render(
      <BrowserRouter>
        <Hero onOpenModal={mockOnOpenModal} />
      </BrowserRouter>
    );
  };

  // ============================================
  // TEST 1: Verifica que el texto aparezca
  // ============================================
  test('renderiza el título principal correctamente', () => {
    // 1. ARRANGE (Preparar): Renderiza el componente
    renderHero();
    
    // 2. ACT (Actuar): Ya está renderizado, no hay acción extra
    
    // 3. ASSERT (Verificar): Comprueba que el texto existe
    expect(screen.getByText(/Divide tus/i)).toBeInTheDocument();
    expect(screen.getByText(/gastos/i)).toBeInTheDocument();
    expect(screen.getByText(/entre amigos/i)).toBeInTheDocument();
  });

  // ============================================
  // TEST 2: Prueba más simple - solo verifica un texto
  // ============================================
  test('el subtítulo se muestra en pantalla', () => {
    // Renderiza
    renderHero();
    
    // Busca el texto y verifica que exista
    const subtitulo = screen.getByText(/Convierte tus gastos más grandes/i);
    expect(subtitulo).toBeInTheDocument();
  });

  // ============================================
  // TEST 3: Verifica que los botones existen
  // ============================================
  test('renderiza ambos botones', () => {
    renderHero();
    
    // Busca los botones por su texto
    const botonComenzar = screen.getByText('Comenzar Gratis');
    const botonComoFunciona = screen.getByText('Ver Cómo Funciona');
    
    // Verifica que ambos existen en el documento
    expect(botonComenzar).toBeInTheDocument();
    expect(botonComoFunciona).toBeInTheDocument();
  });

  // ============================================
  // TEST 4: Simula un clic y verifica la acción
  // ============================================
  test('al hacer clic en "Comenzar Gratis", llama a onOpenModal', () => {
    // 1. Renderiza
    renderHero();
    
    // 2. Encuentra el botón
    const btnComenzar = screen.getByText('Comenzar Gratis');
    
    // 3. Simula un clic
    fireEvent.click(btnComenzar);
    
    // 4. Verifica que la función se llamó con el parámetro correcto
    expect(mockOnOpenModal).toHaveBeenCalledWith('register');
    expect(mockOnOpenModal).toHaveBeenCalledTimes(1);
  });

  // ============================================
  // TEST 5: Verifica la navegación
  // ============================================
  test('navega a la página correcta al hacer clic', () => {
    renderHero();
    
    const btnComoFunciona = screen.getByText('Ver Cómo Funciona');
    fireEvent.click(btnComoFunciona);
    
    // Verifica que navigate se llamó con la ruta correcta
    expect(mockedNavigate).toHaveBeenCalledWith('/como-funciona');
  });

  // ============================================
  // TEST 6: Verifica que la imagen se renderiza
  // ============================================
  test('muestra la imagen decorativa', () => {
    renderHero();
    
    // Busca la imagen por su texto alternativo (alt)
    const imagen = screen.getByAltText('SplitEase Illustration');
    
    expect(imagen).toBeInTheDocument();
    expect(imagen).toHaveAttribute('src'); // Verifica que tenga un src
  });

  // ============================================
  // TEST 7: Prueba interacción de hover
  // ============================================
  test('cambia el estilo al pasar el mouse sobre el botón', () => {
    renderHero();
    const btnPrimary = screen.getByText('Comenzar Gratis');
    
    // Simula pasar el mouse sobre el botón
    fireEvent.mouseEnter(btnPrimary);
    expect(btnPrimary).toHaveClass('hero-btn-primary-hover');
    
    // Simula quitar el mouse del botón
    fireEvent.mouseLeave(btnPrimary);
    expect(btnPrimary).not.toHaveClass('hero-btn-primary-hover');
  });
});