import { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { RegisterFormData } from '@/lib/validations/register.schema';

interface Step1Props {
  register: UseFormRegister<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
}

export function Step1Studio({ register, errors }: Step1Props) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Dados do Estúdio</h2>
        <p className="text-slate-500 text-sm mt-1">Como seu estúdio é chamado?</p>
      </div>

      <div className="space-y-1">
        <label htmlFor="studioName" className="block text-sm font-medium text-slate-700">
          Nome do Estúdio
        </label>
        <input
          id="studioName"
          type="text"
          placeholder="Ex: Black Ink Studio"
          {...register('studioName')}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
        {errors.studioName && (
          <p className="text-red-600 text-xs mt-1">{errors.studioName.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="city" className="block text-sm font-medium text-slate-700">
            Cidade
          </label>
          <input
            id="city"
            type="text"
            placeholder="São Paulo"
            {...register('city')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          {errors.city && (
            <p className="text-red-600 text-xs mt-1">{errors.city.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="state" className="block text-sm font-medium text-slate-700">
            Estado
          </label>
          <input
            id="state"
            type="text"
            placeholder="SP"
            maxLength={2}
            {...register('state')}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent uppercase"
          />
          {errors.state && (
            <p className="text-red-600 text-xs mt-1">{errors.state.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
