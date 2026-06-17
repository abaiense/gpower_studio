import { z } from 'zod';

export const depositSchema = z
  .object({
    depositEnabled: z.boolean(),
    depositType: z.enum(['PERCENTAGE', 'FIXED']),
    depositValue: z.number().min(0),
    depositExpiryHours: z.number().int().min(1).max(168),
  })
  .superRefine((data, ctx) => {
    if (data.depositEnabled && data.depositType === 'PERCENTAGE' && data.depositValue > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_big,
        maximum: 100,
        type: 'number',
        inclusive: true,
        origin: 'number',
        path: ['depositValue'],
        message: 'Percentual não pode ultrapassar 100%',
      });
    }
  });

export type DepositFormData = z.infer<typeof depositSchema>;

export const communicationSchema = z.object({
  whatsappEnabled: z.boolean(),
  whatsappPhoneNumberId: z.string().optional(),
  whatsappAccessToken: z.string().optional(),
  emailEnabled: z.boolean(),
  emailFromName: z.string().optional(),
  emailFromAddress: z.string().email('E-mail inválido').optional().or(z.literal('')),
});

export type CommunicationFormData = z.infer<typeof communicationSchema>;
