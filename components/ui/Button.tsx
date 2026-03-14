import Link from "next/link";

type Props = {
  className?: string;
  children: React.ReactNode;
  href: string;
};

export default function Button({ className, children, href }: Props) {
  return (
    <Link
      href={href}
      className={className}
    >
      {children}
    </Link>
  );
}