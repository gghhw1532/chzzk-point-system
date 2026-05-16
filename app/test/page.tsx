import PageContainer from "@/components/PageContainer";
import { supabase } from "@/lib/supabase";

export default async function TestPage() {
  const { data, error } = await supabase.from("users").select("*");

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold">Supabase 연결 테스트</h1>

      {error && (
        <pre className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-600">
          {error.message}
        </pre>
      )}

      <div className="mt-6 grid gap-3">
        {data?.map((user) => (
          <div key={user.id} className="rounded-2xl border bg-white p-5">
            <p className="font-bold">{user.nickname}</p>
            <p className="text-sm text-gray-500">{user.points}P</p>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}