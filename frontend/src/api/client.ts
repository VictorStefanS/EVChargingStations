// Consolidated client: re-export the canonical fetchClient implementation
// This file exists so imports of './api/client' continue to work while
// the single implementation lives in fetchClient.ts
export * from './fetchClient';
export { default } from './fetchClient';
