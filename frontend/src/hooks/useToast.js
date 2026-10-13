import { useState, useCallback } from 'react';

let _id = 0;
const nextId = () => `toast-${++_id}`;

/**
 * useToast — lightweight toast manager.
 *
 * Returns:
 *   toasts  — current toast list (pass to <ToastContainer />)
 *   toast   — { success, error, warning, info } helper fns
 *   dismiss — remove a toast by id
 *
 * Usage:
 *   const { toast } = useToast();
 *   toast.success('Saved!');
 *   toast.error('Something went wrong.');
 */
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((message, type = 'info', duration = 4000) => {
    const id = nextId();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    return id;
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, duration)  => add(msg, 'success', duration),
    error:   (msg, duration)  => add(msg, 'error',   duration),
    warning: (msg, duration)  => add(msg, 'warning', duration),
    info:    (msg, duration)  => add(msg, 'info',    duration),
  };

  return { toasts, toast, dismiss };
};
