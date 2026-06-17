import { z } from 'zod';

export const clientSchema = z.object({
  firstName: z.string().min(1, 'Nome obrigatório'),
  lastName: z.string().min(1, 'Sobrenome obrigatório'),
  phone: z
    .string()
    .min(1, 'Telefone obrigatório')
    .regex(/^\+?[\d\s\-\(\)]{8,}$/, 'Telefone inválido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  birthDate: z.string().optional(),
  notes: z.string().optional(),
  allergies: z.string().optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;
