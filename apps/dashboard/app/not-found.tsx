import Link from "next/link";
export const metadata = { title: "Page not found", robots: { index: false, follow: false } };
export default function NotFound() { return <main className="not-found"><h1>Not found</h1><p>The page you requested does not exist or is not available.</p><Link className="primary-button" href="/">Back home</Link></main>; }
