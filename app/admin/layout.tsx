import Link from "next/link";
import { requireAdmin } from "@/lib/admin";



export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();


    
  const menus = [
    { href: "/admin", label: "대시보드" },
    { href: "/admin/points", label: "포인트 관리" },
    { href: "/admin/shop", label: "상점 관리" },
    { href: "/admin/predictions", label: "승부예측" },
    { href: "/admin/settings", label: "설정" },
    { href: "/admin/logs", label: "활동 로그" },
    { href: "/admin/users", label: "유저 관리" },
  ];

  return (
    <main className="min-h-screen bg-[#f8f9fc]">
      <div className="flex">
        <aside className="hidden min-h-screen w-[240px] border-r bg-white xl:flex xl:flex-col">
          <div className="flex h-20 items-center border-b px-7">
            <h1 className="text-2xl font-black">치지직 포인트</h1>
          </div>

          <nav className="flex-1 space-y-2 p-4">
            {menus.map((menu) => (
              <Link
                key={menu.href}
                href={menu.href}
                className="block rounded-2xl px-4 py-4 text-sm font-bold text-gray-600 transition hover:bg-violet-50 hover:text-violet-600"
              >
                {menu.label}
              </Link>
            ))}
          </nav>

          <div className="border-t p-4">
            <Link
              href="/me"
              className="block rounded-2xl bg-black px-4 py-3 text-center text-sm font-bold text-white"
            >
              내 정보
            </Link>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="border-b bg-white">
            <div className="flex h-20 items-center justify-between px-6">
              <p className="text-sm font-bold text-violet-600">
                ADMIN DASHBOARD
              </p>

              <Link
                href="/"
                className="rounded-full bg-violet-600 px-5 py-3 text-sm font-bold text-white"
              >
                사이트로 이동
              </Link>
            </div>
          </header>

          <div className="p-6">{children}</div>
        </section>
      </div>
    </main>
  );
}