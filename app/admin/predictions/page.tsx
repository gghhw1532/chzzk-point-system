import AdminCreatePredictionForm from "@/components/AdminCreatePredictionForm";
import AdminPredictionList from "@/components/AdminPredictionList";
import { supabase } from "@/lib/supabase";


export default async function AdminPredictionsPage() {
  const { data: predictions } = await supabase
    .from("predictions")
    .select(`
      *,
      prediction_options (
        id,
        title
      )
    `)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-[#f8f9fc] p-8">
      <h1 className="text-3xl font-black">승부예측 관리</h1>

      <div className="mt-6 grid gap-5 lg:grid-cols-[380px_1fr]">
        <AdminCreatePredictionForm />
        <AdminPredictionList predictions={predictions ?? []} />
      </div>
    </main>
  );
}