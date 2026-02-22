export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container-main py-8 md:py-10">
      {children}
    </div>
  );
}
