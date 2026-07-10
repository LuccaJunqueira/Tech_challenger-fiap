import Link from 'next/link';

import { Button } from './button';
import { Logo } from './logo';

interface HeaderProps {
  showLogin?: boolean;
}

export function Header({ showLogin = true }: HeaderProps) {
  return (
    <header
      role="banner"
      className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          <div className="flex items-center">
            <Logo />
          </div>
          {showLogin && (
            <nav aria-label="Ações do usuário">
              <Link href="/login">
                <Button variant="primary" size="sm" className="sm:size-md">
                  Login
                </Button>
              </Link>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
