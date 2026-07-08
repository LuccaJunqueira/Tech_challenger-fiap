"use client";
import { Menu, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { Logo } from "@/components/ui/logo";
import { logout } from "@/store/authSlice";
import { useAppDispatch } from "@/store/hooks";

import { SidebarItem } from "./sidebaritem";

const navGroups = [
  {
    label: "PRINCIPAL",
    items: [
      { label: "Home", href: "/" },
      { label: "Transações", href: "/transactions" },
    ],
  },
  {
    label: "AÇÕES",
    items: [{ label: "Nova transação", href: "/transactions/new" }],
  },
  {
    label: "SISTEMA",
    items: [
      { label: "Configurações", href: "/settings" },
      { label: "Sair" },
    ],
  },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const isActive = (href: string) => {
    if (href === "/transactions/new") return pathname === "/transactions/new";
    if (href === "/transactions")
      return (
        pathname === "/transactions" || pathname.startsWith("/transactions/")
      );
    return pathname === href;
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  return (
    <>
      {/* Botão hamburguer — só aparece no mobile */}
      <button
        className="lg:hidden fixed top-2 z-50 p-2 rounded-input bg-card border border-white/10 text-foreground"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={isOpen}
        aria-controls="sidebar-nav"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay — só no mobile quando aberto */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-card z-30"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        id="sidebar-nav"
        aria-label="Menu de navegação principal"
        className={`
          fixed lg:static
          inset-y-0 left-0
          z-40 lg:z-auto
          w-64 h-screen
          flex flex-col
          bg-bg-deep border-r border-white/8
          shrink-0
          transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-white/8">
          <Logo />
        </div>

        {/* Navegação */}
        <nav
          aria-label="Menu principal"
          className="flex-1 px-4 py-6 flex flex-col gap-6 overflow-y-auto"
        >
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-mono font-semibold tracking-widest text-muted-foreground mb-2 px-3">
                {group.label}
              </p>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) =>
                  item.href ? (
                    <SidebarItem
                      key={item.label}
                      label={item.label}
                      href={item.href}
                      active={isActive(item.href)}
                      onClick={() => setIsOpen(false)}
                    />
                  ) : (
                    <SidebarItem
                      key={item.label}
                      label={item.label}
                      active={false}
                      onClick={() => {
                        setIsOpen(false);
                        handleLogout();
                      }}
                    />
                  ),
                )}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer — usuário */}
        <div className="px-4 py-4 border-t border-white/8 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold shrink-0">
            LJ
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              Lucca J.
            </p>
            <p className="text-xs text-muted-foreground">Conta corrente</p>
          </div>
        </div>
      </aside>
    </>
  );
}
