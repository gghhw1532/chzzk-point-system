export default function PageContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 pb-24 pt-6">
      {children}
    </main>
  );
}