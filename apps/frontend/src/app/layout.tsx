import "./globals.css";

export const metadata = {
  title: "AssetFlow ERP",
  description: "Enterprise Resource Planning system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      {/* Adding suppressHydrationWarning={true} tells React to ignore 
          injected classes from browser extensions like yours */}
      <body className="antialiased bg-slate-900 text-white" suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}