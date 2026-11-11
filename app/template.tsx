export default function Template({ children }: LayoutProps<"/">) {
  return <div className="page-enter min-h-full">{children}</div>;
}
