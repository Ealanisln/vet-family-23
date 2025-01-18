import '@testing-library/jest-dom'
import { jest } from '@jest/globals'

const mockMatchMedia = () => ({
  matches: false,
  media: '',
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(() => true),
}) as unknown as MediaQueryList;

(window as Window & typeof globalThis).matchMedia = jest.fn(mockMatchMedia);