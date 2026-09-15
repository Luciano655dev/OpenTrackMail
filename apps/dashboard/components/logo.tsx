import Image from "next/image";
import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return <Link href={href} className="brand" aria-label="OpenTrackMail home"><Image className="brand-logo" src="/icon.png" width={32} height={32} alt="" priority/><span>OpenTrackMail</span></Link>;
}
