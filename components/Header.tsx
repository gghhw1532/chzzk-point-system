import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-bold">
          치지직 포인트
        </Link>

        <Link
          href="/me"
          className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white"
        >
          내 정보
        </Link>
      </div>
    </header>
  );
}