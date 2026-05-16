import Link from "next/link";
import PageContainer from "@/components/PageContainer";
import StatCard from "@/components/StatCard";
import { supabase } from "@/lib/supabase";

export default async function HomePage() {
  const { data: users } = await supabase.from("users").select("*");

  const totalUsers = users?.length ?? 0;

  return (
    <PageContainer>
      <section className="rounded-3xl bg-black p-6 text-white shadow-sm">
        <p className="text-sm text-gray-300">CHZZK POINT SYSTEM</p>

        <h1 className="mt-3 text-3xl font-bold">
          방송 참여를 포인트로 더 재밌게
        </h1>

        <p className="mt-3 text-sm text-gray-300">
          출석, 상점, 승부예측, 랭킹까지 한 번에 관리하는 방송용 포인트 시스템입니다.
        </p>

        <div className="mt-6 flex gap-3">
          <Link
            href="/me"
            className="rounded-full bg-white px-5 py-3 text-sm font-bold text-black"
          >
            내 포인트 보기
          </Link>

          <Link
            href="/shop"
            className="rounded-full border border-white/30 px-5 py-3 text-sm font-bold"
          >
            상점 가기
          </Link>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <StatCard
          title="전체 유저"
          value={`${totalUsers}명`}
          description="현재 등록된 유저"
        />

        <StatCard title="오늘 출석" value="미완료" description="하루 1회 보상" />

        <StatCard title="진행 중 예측" value="0개" description="현재 참여 가능" />
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold">빠른 메뉴</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Link
            href="/attendance"
            className="rounded-2xl border bg-white p-5 shadow-sm"
          >
            <p className="font-bold">출석 체크</p>
            <p className="mt-1 text-sm text-gray-500">
              하루 한 번 출석하고 포인트를 받아요.
            </p>
          </Link>

          <Link
            href="/predictions"
            className="rounded-2xl border bg-white p-5 shadow-sm"
          >
            <p className="font-bold">승부 예측</p>
            <p className="mt-1 text-sm text-gray-500">
              포인트로 방송 결과를 예측해요.
            </p>
          </Link>

          <Link
            href="/shop"
            className="rounded-2xl border bg-white p-5 shadow-sm"
          >
            <p className="font-bold">포인트 상점</p>
            <p className="mt-1 text-sm text-gray-500">
              포인트로 방송 미션을 구매해요.
            </p>
          </Link>

          <Link
            href="/ranking"
            className="rounded-2xl border bg-white p-5 shadow-sm"
          >
            <p className="font-bold">랭킹</p>
            <p className="mt-1 text-sm text-gray-500">
              시청자 포인트 순위를 확인해요.
            </p>
          </Link>
        </div>
      </section>
    </PageContainer>
  );
}