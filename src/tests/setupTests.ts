import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// jsdom has no pointer capture; clicks only need this browser method to exist.
// Real drag geometry and capture behavior still need browser testing.
if (!HTMLElement.prototype.setPointerCapture) {
  Object.defineProperty(HTMLElement.prototype, 'setPointerCapture', {
    configurable: true,
    value: () => {},
  });
}

afterEach(() => {
  cleanup();
});
