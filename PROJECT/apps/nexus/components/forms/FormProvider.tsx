'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { FieldValues, UseFormReturn, FormProvider as RHFFormProvider } from 'react-hook-form';

export interface FormContextValue<TFieldValues extends FieldValues = any> {
  form?: UseFormReturn<TFieldValues, any, any>;
  isSubmitting: boolean;
  isSuccess: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  setSuccess: (success: boolean) => void;
  resetStatus: () => void;
}

const FormContext = createContext<FormContextValue | undefined>(undefined);

export interface FormProviderProps<TFieldValues extends FieldValues = any> {
  children: React.ReactNode;
  form?: UseFormReturn<TFieldValues, any, any> | UseFormReturn<any, any, any>;
  onSubmit?: (data: TFieldValues) => Promise<void> | void;
  className?: string;
  id?: string;
}

export function FormProvider<TFieldValues extends FieldValues = any>({
  children,
  form,
  onSubmit,
  className,
  id,
}: FormProviderProps<TFieldValues>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetStatus = useCallback(() => {
    setIsSubmitting(false);
    setIsSuccess(false);
    setError(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmit) return;

    if (form) {
      return (form.handleSubmit as any)(async (data: TFieldValues) => {
        setIsSubmitting(true);
        setError(null);
        setIsSuccess(false);
        try {
          await onSubmit(data);
          setIsSuccess(true);
        } catch (err: any) {
          const message =
            err?.response?.data?.detail ||
            err?.response?.data?.message ||
            err?.message ||
            'An unexpected error occurred. Please try again.';
          setError(message);
        } finally {
          setIsSubmitting(false);
        }
      })(e);
    } else {
      setIsSubmitting(true);
      setError(null);
      setIsSuccess(false);
      try {
        await onSubmit({} as TFieldValues);
        setIsSuccess(true);
      } catch (err: any) {
        const message =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          'An unexpected error occurred. Please try again.';
        setError(message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const contextValue: FormContextValue<TFieldValues> = {
    form,
    isSubmitting: form ? form.formState.isSubmitting || isSubmitting : isSubmitting,
    isSuccess,
    error,
    setError,
    setSuccess: setIsSuccess,
    resetStatus,
  };

  const formElement = (
    <FormContext.Provider value={contextValue as FormContextValue}>
      <form id={id} onSubmit={handleSubmit} className={className} noValidate>
        {children}
      </form>
    </FormContext.Provider>
  );

  if (form) {
    return <RHFFormProvider {...(form as any)}>{formElement}</RHFFormProvider>;
  }

  return formElement;
}

export function useFormStateContext<TFieldValues extends FieldValues = any>() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormStateContext must be used within a <FormProvider />');
  }
  return context as FormContextValue<TFieldValues>;
}
