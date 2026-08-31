import * as Sentry from '@sentry/react';

export type ToastType = 'success' | 'error' | 'info';

const EVENT_NAME = 'app:toast';

export type ToastMessage = {
  id: number;
  message: string;
  type: ToastType;
};

export function notify(message: string, type: ToastType = 'info') {
  const detail: ToastMessage = {
    id: Date.now() + Math.random(),
    message,
    type,
  };

  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail }));
}

export function logError(context: string, error: unknown) {
  console.error(`[${context}]`, error);

  if (error instanceof Error) {
    Sentry.captureException(error, {
      tags: { context },
    });
    notify(error.message, 'error');
    return;
  }

  Sentry.captureMessage(`Error in ${context}`, {
    level: 'error',
    tags: { context },
  });
  notify('Something went wrong. Please try again.', 'error');
}
