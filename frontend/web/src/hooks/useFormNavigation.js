/**
 * useFormNavigation Hook
 * Manages keyboard navigation between form fields using Enter key
 * Automatically focuses next field or moves to next step
 */

import { useEffect } from 'react';

export const useFormNavigation = (formRef, options = {}) => {
  const {
    onNextField = null,
    onNextStep = null,
    skipFields = [],
  } = options;

  useEffect(() => {
    if (!formRef?.current) return;

    const handleKeyDown = (e) => {
      // Only handle Enter key
      if (e.key !== 'Enter') return;

      // Don't intercept Enter in textareas
      if (e.target.tagName === 'TEXTAREA') return;

      e.preventDefault();

      // Get all focusable form elements in order
      const focusableElements = Array.from(
        formRef.current.querySelectorAll(
          'input:not([type="hidden"]), select, textarea, button:not([type="submit"])'
        )
      ).filter(el => {
        // Filter out disabled elements and elements in skipFields
        return !el.disabled && !skipFields.some(skip => el === skip);
      });

      const currentIndex = focusableElements.indexOf(e.target);

      if (currentIndex === -1) return;

      // If there's a next field, focus it
      if (currentIndex < focusableElements.length - 1) {
        focusableElements[currentIndex + 1].focus();
        // For text inputs, select all text
        if (focusableElements[currentIndex + 1].tagName === 'INPUT') {
          focusableElements[currentIndex + 1].select?.();
        }
        if (onNextField) onNextField();
      } else {
        // Last field reached
        if (onNextStep) {
          onNextStep();
        }
      }
    };

    const form = formRef.current;
    form.addEventListener('keydown', handleKeyDown);

    return () => {
      form.removeEventListener('keydown', handleKeyDown);
    };
  }, [formRef, onNextField, onNextStep, skipFields]);
};

export default useFormNavigation;
