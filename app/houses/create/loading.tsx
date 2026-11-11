export default function Loading() {
  return <main aria-label="Loading listing form" className="min-h-screen animate-pulse bg-[#faf9f6] px-5 py-10"><div className="mx-auto max-w-3xl space-y-5"><div className="h-4 w-32 rounded bg-[#e5ebe3]"/><div className="h-10 w-64 rounded bg-[#e5ebe3]"/><div className="h-20 rounded-2xl bg-[#e5ebe3]"/><div className="grid gap-4 rounded-3xl bg-white p-6 sm:grid-cols-2">{Array.from({length:10},(_,i)=><div key={i} className="h-12 rounded-xl bg-[#f1f4ef]"/> )}</div></div></main>;
}
