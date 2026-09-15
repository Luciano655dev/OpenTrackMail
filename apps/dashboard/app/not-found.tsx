import Link from "next/link";
export default function NotFound() { return <main className="not-found"><h1>Not found</h1><p>The page you requested does not exist or is not available.</p><Link className="primary-button" href="/">Back home</Link></main>; }
