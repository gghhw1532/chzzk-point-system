import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function AdminUsersPage() {
  const { data: users } = await supabase
    .from("users")
    .select("*")
    .order("points", { ascending: false });

  return (
    <>
      <section className="rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 p-8 text-white shadow-sm">
        <p className="text-sm font-bold text-violet-100">USER MANAGEMENT</p>

        <h1 className="mt-2 text-4xl font-black">유저 관리</h1>

        <p className="mt-2 text-sm text-violet-100">
          유저 포인트와 활동 상태를 관리합니다.
        </p>
      </section>

      <section className="mt-6 rounded-3xl border bg-white p-6 shadow-sm">
        <div className="grid grid-cols-[1.2fr_140px_140px_140px] bg-gray-50 p-4 text-sm font-bold text-gray-500 rounded-2xl">
          <span>유저</span>
          <span>포인트</span>
          <span>구독 티어</span>
          <span>상세</span>
        </div>

        <div className="mt-3 space-y-3">
          {users?.map((user) => (
            <div
              key={user.id}
              className="grid grid-cols-[1.2fr_140px_140px_140px] items-center rounded-2xl border p-4"
            >
              <div>
                <p className="font-bold">{user.nickname}</p>

                <p className="mt-1 text-sm text-gray-400">
                {user.discord_user_id
                    ? "디스코드 연동됨"
                    : "디스코드 미연동"}
                </p>
              </div>

              <p className="font-black">
                {(user.points ?? 0).toLocaleString()}P
              </p>

              <p>
                {user.subscription_tier
                  ? `티어 ${user.subscription_tier}`
                  : "-"}
              </p>

              <Link
                href={`/admin/users/${user.id}`}
                className="rounded-xl bg-violet-600 px-4 py-2 text-center text-sm font-bold text-white"
              >
                상세 보기
              </Link>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}