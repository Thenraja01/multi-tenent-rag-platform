'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Network, FolderGit2 } from 'lucide-react';
import { FormProvider } from './FormProvider';
import { FormField } from './FormField';
import { FormInput, FormTextarea } from './FormControls';
import { FormSubmitButton, FormCancelButton, FormActionGroup } from './FormActions';
import { superadminApi } from '@/lib/api/superadmin';

const createDepartmentSchema = z.object({
  name: z.string().min(2, 'Department name is required'),
  slug: z.string().min(2, 'Slug identifier is required'),
  description: z.string().optional(),
});

export type CreateDepartmentFormValues = z.infer<typeof createDepartmentSchema>;

export interface CreateDepartmentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialDept?: any;
}

export function CreateDepartmentForm({ onSuccess, onCancel, initialDept }: CreateDepartmentFormProps) {
  const form = useForm<CreateDepartmentFormValues>({
    resolver: zodResolver(createDepartmentSchema),
    defaultValues: {
      name: initialDept?.name || '',
      slug: initialDept?.slug || '',
      description: initialDept?.description || '',
    },
  });

  const onSubmit = async (values: CreateDepartmentFormValues) => {
    if (initialDept?.id) {
      await superadminApi.updateCatalogDepartment(initialDept.id, values);
    } else {
      await superadminApi.createCatalogDepartment(values);
    }
    if (onSuccess) onSuccess();
  };

  return (
    <FormProvider form={form} onSubmit={onSubmit} className="space-y-4 text-xs">
      <FormField label="Department Name" required error={form.formState.errors.name?.message}>
        <FormInput
          {...form.register('name')}
          onChange={(e) => {
            form.setValue('name', e.target.value);
            if (!initialDept) {
              const autoSlug = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_');
              form.setValue('slug', autoSlug);
            }
          }}
          placeholder="e.g. Engineering & Platform"
          icon={Network}
          hasError={Boolean(form.formState.errors.name)}
        />
      </FormField>

      <FormField
        label="Department Slug"
        required
        hint="Unique catalog slug"
        error={form.formState.errors.slug?.message}
      >
        <FormInput
          {...form.register('slug')}
          placeholder="engineering_platform"
          icon={FolderGit2}
          hasError={Boolean(form.formState.errors.slug)}
        />
      </FormField>

      <FormField label="Description" optional>
        <FormTextarea
          {...form.register('description')}
          placeholder="Scope and purpose of this department workspace..."
          rows={3}
        />
      </FormField>

      <FormActionGroup>
        {onCancel && <FormCancelButton onClick={onCancel} />}
        <FormSubmitButton
          label={initialDept ? 'Update Department' : 'Create Department'}
          submittingLabel="Saving..."
        />
      </FormActionGroup>
    </FormProvider>
  );
}
