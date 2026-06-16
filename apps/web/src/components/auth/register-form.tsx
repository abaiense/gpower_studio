'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { registerSchema, type RegisterFormData } from '@/lib/validations/register.schema';
import { useAuthStore } from '@/store/auth.store';
import { Step1Studio } from './onboarding/step-1-studio';
import { Step2Plan } from './onboarding/step-2-plan';
import { Step3Artist } from './onboarding/step-3-artist';

const STEP_LABELS = ['Estúdio', 'Plano', 'Sua Conta'];
const TOTAL_STEPS = 3;

// Fields to validate per step before advancing
const STEP_FIELDS: Record<number, (keyof RegisterFormData)[]> = {
  1: ['studioName', 'city', 'state'],
  2: ['plan'],
  3: ['firstName', 'lastName', 'email', 'password', 'confirmPassword'],
};

export function RegisterForm() {
  const router = useRouter();
  const { register: storeRegister, isLoading } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { plan: 'pro' },
  });

  const handleNext = async () => {
    const valid = await trigger(STEP_FIELDS[currentStep]);
    if (valid) setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const handlePrev = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      await storeRegister(data);
      router.push('/dashboard');
    } catch {
      setServerError('Não foi possível criar a conta. Tente novamente.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between">
        {STEP_LABELS.map((label, i) => {
          const stepNum = i + 1;
          const isActive = stepNum === currentStep;
          const isDone = stepNum < currentStep;
          return (
            <div key={label} className="flex items-center">
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    isDone
                      ? 'bg-amber-500 text-white'
                      : isActive
                        ? 'bg-amber-500 text-white ring-2 ring-amber-200'
                        : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isDone ? '✓' : stepNum}
                </div>
                <span
                  className={`text-xs font-medium ${isActive ? 'text-amber-600' : isDone ? 'text-amber-500' : 'text-slate-400'}`}
                >
                  {label}
                </span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div
                  className={`h-px w-8 mx-2 ${isDone ? 'bg-amber-400' : 'bg-slate-200'}`}
                />
              )}
            </div>
          );
        })}
      </div>

      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {serverError}
        </div>
      )}

      {/* Step content */}
      {currentStep === 1 && <Step1Studio register={register} errors={errors} />}
      {currentStep === 2 && <Step2Plan register={register} errors={errors} />}
      {currentStep === 3 && <Step3Artist register={register} errors={errors} />}

      {/* Navigation */}
      <div className="flex gap-3">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            disabled={isLoading}
            className="flex-1 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-colors"
          >
            Anterior
          </button>
        )}

        {currentStep < TOTAL_STEPS ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
          >
            Próximo
          </button>
        ) : (
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            {isLoading ? 'Criando conta...' : 'Criar Conta'}
          </button>
        )}
      </div>

      <p className="text-center text-sm text-slate-500">
        Já tem uma conta?{' '}
        <Link href="/login" className="text-amber-600 hover:text-amber-700 font-medium">
          Entrar
        </Link>
      </p>
    </form>
  );
}
