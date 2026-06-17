import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Check } from 'lucide-react';
import type { RegisterFormData } from '@/lib/validations/register.schema';

interface Step2Props {
  register: UseFormRegister<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
}

const plans = [
  {
    id: 'starter' as const,
    name: 'Starter',
    price: 'R$ 97/mês',
    features: ['1 artista', 'Agenda básica', 'Clientes ilimitados'],
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    price: 'R$ 197/mês',
    features: ['Até 5 artistas', 'Agenda avançada', 'Financeiro', 'Estoque'],
    recommended: true,
  },
  {
    id: 'enterprise' as const,
    name: 'Enterprise',
    price: 'R$ 397/mês',
    features: ['Artistas ilimitados', 'Multi-unidades', 'API', 'Suporte prioritário'],
  },
];

export function Step2Plan({ register, errors }: Step2Props) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Escolha seu Plano</h2>
        <p className="text-slate-500 text-sm mt-1">
          Você pode mudar de plano a qualquer momento.
        </p>
      </div>

      <div className="space-y-3">
        {plans.map((plan) => (
          <label
            key={plan.id}
            className="flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer has-[:checked]:border-amber-500 has-[:checked]:bg-amber-50 border-slate-200 hover:border-slate-300 transition-colors"
          >
            <input
              type="radio"
              value={plan.id}
              {...register('plan')}
              className="mt-0.5 accent-amber-500"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">
                  {plan.name}
                  {plan.recommended && (
                    <span className="ml-2 text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">
                      Recomendado
                    </span>
                  )}
                </span>
                <span className="text-sm font-bold text-slate-700">{plan.price}</span>
              </div>
              <ul className="mt-2 space-y-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                    <Check size={13} className="text-amber-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </label>
        ))}
      </div>

      {errors.plan && (
        <p className="text-red-600 text-xs">{errors.plan.message}</p>
      )}
    </div>
  );
}
