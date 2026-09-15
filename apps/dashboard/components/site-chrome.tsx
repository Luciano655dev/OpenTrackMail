import Link from "next/link";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Logo />
        <nav className="desktop-nav" aria-label="Primary navigation">
          <Link href="/#features">Features</Link>
          <Link href="/#how-it-works">How it works</Link>
          <Link href="/#open-source">Open source</Link>
          <Link href="/status">Status</Link>
          <Link href="/privacy">Privacy</Link>
        </nav>
        <div className="header-actions">
          <ThemeToggle />
          <Link className="text-link" href="/app/login">Sign in</Link>
          <Link className="button button-small" href="/#install">Get extension</Link>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <Logo />
        <nav aria-label="Footer navigation">
          <Link href="/status">Status</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <a href="https://github.com/luciano655dev/OpenTrackMail" target="_blank" rel="noreferrer">GitHub</a>
          <a href="mailto:hello@opentrackmail.com">Contact</a>
        </nav>
        <p>© {new Date().getFullYear()} OpenTrackMail</p>
      </div>
    </footer>
  );
}
