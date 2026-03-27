import '@testing-library/jest-dom';
import { afterEach, beforeAll, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';


import './i18n.mock';


afterEach(() => {
  cleanup();
});


const localStorageMock = (() => {
  let store = {};
  let itemCount = 0;
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      if (!(key in store)) itemCount++;
      store[key] = value.toString();
    },
    removeItem: (key) => {
      if (key in store) itemCount--;
      delete store[key];
    },
    clear: () => {
      store = {};
      itemCount = 0;
    },
    get length() {
      return itemCount;
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });


Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});


const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning:') ||
        args[0].includes('ReactDOM.render') ||
        args[0].includes('useLayoutEffect'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

