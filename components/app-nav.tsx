import Link from 'next/link';
import { SignOutButton } from './sign-out-button';

interface AppNavProps {
  email?: string | null;
  activePath?: string;
}

export function AppNav({ email, activePath }: AppNavProps) {
  const navLink = (href: string, label: string, disabled = false) => {
    const isActive = activePath === href;
    if (disabled) {
      return (
        <span className="cursor-not-allowed text-sm font-medium text-ink-muted/40">
          {label}
        </span>
      );
    }
    return (
      <Link
        href={href}
        className={`text-sm font-medium transition-colors hover:text-ink ${
          isActive ? 'text-brand' : 'text-ink-muted'
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/app" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white shadow-sm">
              A
            </span>
            <span className="text-base font-semibold tracking-tight">Avista</span>
          </Link>
          <nav className="hidden items-center gap-5 sm:flex">
            {navLink('/generate', 'Generate')}
            {navLink('/proposals', 'Proposals')}
            {navLink('/profile', 'Profile')}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {email && (
            <span className="hidden max-w-[160px] truncate text-xs text-ink-muted sm:block">
              {email}
            </span>
          )}
          <SignOutButton />
        </div>
      </div>

      {/* Mobile nav row */}
      <nav className="flex items-center gap-5 border-t border-slate-100 px-4 py-2 sm:hidden">
        {navLink('/generate', 'Generate')}
        {navLink('/proposals', 'Proposals')}
        {navLink('/profile', 'Profile')}
      </nav>
    </header>
  );
}
