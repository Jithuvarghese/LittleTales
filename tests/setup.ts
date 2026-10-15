import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';

// Workers are reused across files (isolate: false), so unmount after every test.
afterEach(() => cleanup());
