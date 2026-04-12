export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  // Layout delegates fully to the parent dashboard layout.
  // Finance sub-navigation is now integrated in the main sidebar.
  return <>{children}</>;
}
