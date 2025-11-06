import "./bootstrap-scope.scss";

export default function BootstrapMainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bootstrap-scope">
      {children}
    </div>
  );
}
