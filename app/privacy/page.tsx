import Link from "next/link";
import Navbar from "../navbar";

const sections = [
  {
    title: "1. Information we handle",
    body: "When you use Baraka Nest, we handle the username and account details needed to sign you in; the profile details you choose to provide (such as school, location, budget, interests, and roommate preferences); listings, saved searches, favorites, messages, reports, and notifications you create; and photos or other files you upload. Passwords are handled by the authentication system and are not shown to other users.",
  },
  {
    title: "2. How we use it",
    body: "We use this information to operate accounts, show housing and roommate matches, deliver messages and saved-search alerts, display uploaded content, respond to support requests, and protect the service from misuse. We do not use profile information to make an automated decision with a legal or similarly significant effect.",
  },
  {
    title: "3. What other users can see",
    body: "Information and content you add to a roommate profile or housing listing may be visible to other Baraka Nest users so they can find and contact you. Messages are delivered to the people in that conversation. Do not put private details in a public profile or listing.",
  },
  {
    title: "4. Service providers",
    body: "Baraka Nest uses Turso/libSQL for its database and Vercel Blob to store uploaded files. The application may also use a third-party hosting provider. These providers process data so the service can work and may process it in locations outside Kenya. We will use the safeguards required by applicable law for those services.",
  },
  {
    title: "5. Retention and account requests",
    body: "We keep account and service information while it is needed to provide and protect Baraka Nest, and longer only where required to resolve a dispute or meet a legal obligation. You can contact the admin to request access to or correction of your personal information, object to processing, or request deletion. Some information may need to be retained where the law permits or requires it.",
  },
  {
    title: "6. Your data protection rights",
    body: "Under applicable Kenyan data-protection law, you may have rights to be informed, access your personal data, object to processing, and request correction or deletion of false or misleading data. Contact us first to exercise a right or raise a concern. You may also contact the Office of the Data Protection Commissioner.",
  },
  {
    title: "7. Updates and contact",
    body: "We may update this notice as Baraka Nest changes. The effective date at the top shows when this version began. For a privacy request or question, use the Contact Admin page.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f7f8f4] text-[#183b2c]">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-10 pb-32 sm:px-6 sm:py-16">
        <div className="rounded-[2rem] border border-[#e5ebe3] bg-white p-6 shadow-[0_16px_48px_rgba(24,59,44,0.06)] sm:p-10">
          <Link href="/register" className="text-xs font-bold uppercase tracking-[0.18em] text-[#b46a32]">Baraka Nest · Legal</Link>
          <h1 className="mt-4 text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl">Privacy Policy</h1>
          <p className="mt-3 text-sm text-[#758078]">Effective 9 November 2026</p>
          <p className="mt-7 max-w-3xl text-base leading-7 text-[#536257]">Your privacy matters. This notice explains what information Baraka Nest uses, why it is needed, and how you can make a data request.</p>
          <div className="mt-9 divide-y divide-[#edf0eb]">
            {sections.map((section) => (
              <section key={section.title} className="py-6 first:pt-0 last:pb-0">
                <h2 className="text-lg font-bold tracking-tight">{section.title}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-[#5e6c62]">{section.body}</p>
              </section>
            ))}
          </div>
          <div className="mt-8 rounded-2xl bg-[#f4f7f2] p-5 text-sm leading-6 text-[#56645a]">
            Contact <Link href="/contact" className="font-bold text-[#a95720] underline underline-offset-2">Baraka Nest admin</Link> for a privacy request. Learn about data-subject rights from the <a href="https://www.odpc.go.ke/rights-of-a-data-subject/index.html" target="_blank" rel="noreferrer" className="font-bold text-[#a95720] underline underline-offset-2">Office of the Data Protection Commissioner</a>.
          </div>
        </div>
      </div>
    </main>
  );
}
