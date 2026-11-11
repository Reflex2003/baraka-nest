export default function Loading() {
  return <main aria-label="Loading Admin Centre" className="min-h-screen animate-pulse bg-[#fafbf9] px-5 py-10"><div className="mx-auto max-w-7xl space-y-6"><div className="h-10 w-64 rounded bg-[#e5ebe3]"/><div className="h-24 rounded-3xl bg-white"/><div className="grid gap-4 md:grid-cols-3">{Array.from({length:6},(_,i)=><div key={i} className="h-44 rounded-2xl bg-white"/>)}</div></div></main>;
}
