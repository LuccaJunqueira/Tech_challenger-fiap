"use client";

import { Button, Card, cn, Input, Logo, useFormValidation } from '@bytebank/ui';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useRegisterMutation } from '@/store/apiSlice';
import { selectIsAuthenticated } from '@/store/authSlice';
import { useAppSelector } from '@/store/hooks';

function getPasswordStrength(p: string) {
  let strength = 0;
  if (p.length > 5) strength++;
  if (p.length > 8) strength++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) strength++;
  if (/\d/.test(p)) strength++;
  if (/[^A-Za-z0-9]/.test(p)) strength++;
  return strength;
}

export default function RegisterPage() {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [register, { isLoading, error }] = useRegisterMutation();

  const { formData, errors, hasSubmitted, handleChange, handleSubmit, getFieldError } =
    useFormValidation({
      username: (value) => {
        if (!value.trim()) return 'O nome de usuário é obrigatório.';
        if (value.length < 3) return 'O nome de usuário deve ter no mínimo 3 caracteres.';
        const usernameRegex = /^[a-zA-Z0-9\s]+$/;
        if (!usernameRegex.test(value)) return 'O nome de usuário deve conter apenas letras, números e espaços.';
      },
      email: (value) => {
        if (!value.trim()) return 'O e-mail é obrigatório.';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'O e-mail inserido é inválido.';
      },
      password: (value) => {
        if (!value.trim()) return 'A senha é obrigatória.';
        if (value.length < 6) return 'A senha deve ter no mínimo 6 caracteres.';
      },
      confirmPassword: (value, allData) => {
        if (!value.trim()) return 'A confirmação de senha é obrigatória.';
        if (value !== allData.password) return 'As senhas não coincidem.';
      },
    });

  useEffect(() => {
    if (isAuthenticated) {
      window.location.replace("/transactions");
    }
  }, [isAuthenticated]);

  const passwordStrength = getPasswordStrength(formData.password || '');
  const passwordStrengthColor =
    passwordStrength === 0
      ? 'bg-transparent'
      : passwordStrength <= 2
        ? 'bg-neon-red'
        : passwordStrength <= 4
          ? 'bg-neon-yellow'
          : 'bg-neon-green';

  const onRegisterSubmit = async () => {
    try {
      await register({
        username: formData.username ?? '',
        email: formData.email ?? '',
        password: formData.password ?? '',
      }).unwrap();
      router.push('/login');
    } catch {
      // erro exibido via variável error do hook
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4">
      <Card className="w-full max-w-md p-8 space-y-6 bg-bg-panel border border-white/8 rounded-r16 shadow-lg">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>

        <h2 className="text-3xl font-bold text-center text-primary">Crie sua conta</h2>
        <p className="text-center text-muted-foreground">
          Junte-se ao ByteBank e comece a controlar suas finanças.
        </p>

        <form onSubmit={handleSubmit(onRegisterSubmit)} className="space-y-4">
          <Input
            id="username"
            label="Nome de Usuário"
            type="text"
            placeholder="seu_nome_usuario"
            value={formData.username || ''}
            onChange={handleChange}
            autoComplete="username"
            error={getFieldError('username')}
            aria-invalid={hasSubmitted && errors.username ? 'true' : 'false'}
          />

          <Input
            id="email"
            label="E-mail"
            type="email"
            placeholder="seu.email@bytebank.com"
            value={formData.email || ''}
            onChange={handleChange}
            autoComplete="email"
            error={getFieldError('email')}
            aria-invalid={hasSubmitted && errors.email ? 'true' : 'false'}
          />

          <div>
            <label
              htmlFor="password"
              className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Senha
            </label>
            <div className="relative mt-1.5">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password || ''}
                onChange={handleChange}
                autoComplete="new-password"
                className={cn(
                  'w-full px-4 py-3 rounded-[var(--radius-input)]',
                  'bg-bg-surface border border-border',
                  'text-foreground placeholder:text-muted-foreground text-sm',
                  'focus:outline-none focus:border-neon-cyan/50 focus:ring-2 focus:ring-neon-cyan/30',
                  'transition-all duration-200',
                  getFieldError('password') && 'border-destructive focus:border-destructive focus:ring-destructive/20',
                )}
                aria-invalid={hasSubmitted && errors.password ? 'true' : 'false'}
                aria-describedby={
                  (hasSubmitted && errors.password) || (formData.password && passwordStrength < 5)
                    ? 'password-error'
                    : undefined
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground"
                aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>

            {formData.password && (
              <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2" role="progressbar" aria-valuenow={passwordStrength} aria-valuemin={0} aria-valuemax={5} aria-label={`Força da senha: ${passwordStrength} de 5`}>
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${passwordStrengthColor}`}
                  style={{ width: `${(passwordStrength / 5) * 100}%` }}
                />
              </div>
            )}

            {hasSubmitted && errors.password && (
              <p id="password-error" className="text-destructive text-sm mt-1" role="alert" aria-live="polite">
                {errors.password}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Confirmar Senha
            </label>
            <div className="relative mt-1.5">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.confirmPassword || ''}
                onChange={handleChange}
                autoComplete="new-password"
                className={cn(
                  'w-full px-4 py-3 rounded-[var(--radius-input)]',
                  'bg-bg-surface border border-border',
                  'text-foreground placeholder:text-muted-foreground text-sm',
                  'focus:outline-none focus:border-neon-cyan/50 focus:ring-2 focus:ring-neon-cyan/30',
                  'transition-all duration-200',
                  getFieldError('confirmPassword') && 'border-destructive focus:border-destructive focus:ring-destructive/20',
                )}
                aria-invalid={hasSubmitted && errors.confirmPassword ? 'true' : 'false'}
                aria-describedby={hasSubmitted && errors.confirmPassword ? 'confirm-password-error' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground"
                aria-label={showConfirmPassword ? 'Esconder confirmação de senha' : 'Mostrar confirmação de senha'}
              >
                {showConfirmPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>
            {hasSubmitted && errors.confirmPassword && (
              <p id="confirm-password-error" className="text-destructive text-sm mt-1" role="alert" aria-live="polite">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {error && (
            <p className="text-destructive text-sm" role="alert" aria-live="assertive">
              {(error as { data?: { message?: string } })?.data?.message ??
               (error as { error?: string })?.error ??
               'Erro ao criar conta. Tente novamente.'}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Cadastrando...' : 'Criar conta'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Já tem conta?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Entrar
          </Link>
        </p>
      </Card>
    </div>
  );
}
