"use client";

import { Button, Card, cn, Input, Logo, useFormValidation } from "@bytebank/ui";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useLoginMutation } from "@/store/apiSlice";
import { selectIsAuthenticated } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [showPassword, setShowPassword] = useState(false);

  const [login, { isLoading, error }] = useLoginMutation();

  const {
    formData,
    errors,
    hasSubmitted,
    handleChange,
    handleSubmit,
    getFieldError,
  } = useFormValidation({
    email: (value) => {
      if (!value.trim()) return "O e-mail é obrigatório.";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return "O e-mail inserido é inválido.";
    },
    password: (value) => {
      if (!value.trim()) return "A senha é obrigatória.";
      if (value.length < 6) return "A senha deve ter no mínimo 6 caracteres.";
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      window.location.replace("/transactions");
    }
  }, [isAuthenticated]);

  const onLoginSubmit = async () => {
    try {
      const result = await login({
        email: formData.email ?? "",
        password: formData.password ?? "",
      }).unwrap();
      dispatch({
        type: "auth/setCredentials",
        payload: { token: result.token },
      });
      // useEffect([isAuthenticated]) cuida da navegação
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

        <h2 className="text-3xl font-bold text-center text-primary">
          Bem-vindo(a) de volta!
        </h2>
        <p className="text-center text-muted-foreground">
          Entre na sua conta ByteBank.
        </p>

        <form onSubmit={handleSubmit(onLoginSubmit)} className="space-y-4">
          <Input
            id="email"
            label="E-mail"
            type="email"
            placeholder="seu.email@bytebank.com"
            value={formData.email || ""}
            onChange={handleChange}
            autoComplete="email"
            error={getFieldError("email")}
            aria-invalid={hasSubmitted && errors.email ? "true" : "false"}
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
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password || ""}
                onChange={handleChange}
                autoComplete="current-password"
                className={cn(
                  "w-full px-4 py-3 rounded-[var(--radius-input)]",
                  "bg-bg-surface border border-border",
                  "text-foreground placeholder:text-muted-foreground text-sm",
                  "focus:outline-none focus:border-neon-cyan/50 focus:ring-2 focus:ring-neon-cyan/30",
                  "transition-all duration-200",
                  getFieldError("password") &&
                    "border-destructive focus:border-destructive focus:ring-destructive/20",
                )}
                aria-invalid={
                  hasSubmitted && errors.password ? "true" : "false"
                }
                aria-describedby={
                  hasSubmitted && errors.password ? "password-error" : undefined
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground"
                aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>
            {hasSubmitted && errors.password && (
              <p
                id="password-error"
                className="text-destructive text-sm mt-1"
                role="alert"
                aria-live="polite"
              >
                {errors.password}
              </p>
            )}
          </div>

          {error && (
            <p className="text-destructive text-sm" role="alert" aria-live="assertive">
              {(error as { data?: { message?: string } })?.data?.message ??
                (error as { error?: string })?.error ??
                "Erro ao fazer login. Verifique suas credenciais."}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Ainda não tem conta?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Criar conta
          </Link>
        </p>
      </Card>
    </div>
  );
}
