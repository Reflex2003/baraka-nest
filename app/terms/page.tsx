import Link from "next/link";
import Navbar from "../navbar";

const sections = [
  {
    title: "1. About Baraka Nest",
    text: "Baraka Nest helps students discover student-friendly housing and connect with potential roommates. The platform provides discovery and communication tools; it is not a landlord, letting agent, or party to a rental or roommate agreement.",
  },
  {
    title: "2. Your account",
    text: "Keep your sign-in details private, use accurate information, and tell us if you believe someone has accessed your account without permission. You are responsible for activity carried out through your account.",
  },
  {
    title: "3. Listings and decisions",
    text: "Listing details, prices, availability, and photos can change. Baraka Nest does not currently verify listings, property ownership, users, or the condition of a property. Confirm details directly, view a property safely, and agree on payment and rental terms with the relevant person before sending money or making a commitment.",
  },
  {
    title: "4. Roommate connections and messages",
    text: "Use roommate profiles and messages respectfully. A compatibility score is only a guide based on profile preferences; it is not a guarantee that two people will be compatible or safe to live together. Arrange meetings carefully and avoid sharing sensitive information with people you do not know.",
  },
  {
    title: "5. Content you share",
    text: "You must have the right to share the photos, messages, and other material you upload. Do not upload unlawful, misleading, abusive, harassing, threatening, or infringing content, or content that exposes another person's private information without permission. You allow Baraka Nest to store and display your content as needed to provide the service and show it to the audience you choose in the product.",
  },
  {
    title: "6. Fair use of the service",
    text: "Do not impersonate others, scam users, interfere with the platform, attempt unauthorized access, or use the service to break the law. We may restrict or remove accounts or content that threaten users or the service, or that breach these Terms.",
  },
  {
    title: "7. Service availability and changes",
    text: "We work to keep Baraka Nest available, but features may change and interruptions can happen. We may update these Terms as the service develops. If a change is material, we will update the date on this page and request acceptance again when needed.",
  },
  {
    title: "8. Contact",
    text: "If you need help or want to report a concern, contact the Baraka Nest admin through the Contact Admin page.",
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#f7f8f4] text-[#183b2c]">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-10 pb-32 sm:px-6 sm:py-16">
        <div className="rounded-[2rem] border border-[#e5ebe3] bg-white p-6 shadow-[0_16px_48px_rgba(24,59,44,0.06)] sm:p-10">
          <Link href="/register" className="text-xs font-bold uppercase tracking-[0.18em] text-[#b46a32]">Baraka Nest · Legal</Link>
          <h1 className="mt-4 text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl">Terms of Service</h1>
          <p className="mt-3 text-sm text-[#758078]">Effective 9 November 2026</p>
          <p className="mt-7 max-w-3xl text-base leading-7 text-[#536257]">These Terms explain the basic rules for using Baraka Nest. Please read them before creating an account or using the housing and roommate features.</p>
          <div className="mt-9 divide-y divide-[#edf0eb]">
            {sections.map((section) => (
              <section key={section.title} className="py-6 first:pt-0 last:pb-0">
                <h2 className="text-lg font-bold tracking-tight">{section.title}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-[#5e6c62]">{section.text}</p>
              </section>
            ))}
          </div>
          <div className="mt-8 rounded-2xl bg-[#f4f7f2] p-5 text-sm leading-6 text-[#56645a]">
            Questions? <Link href="/contact" className="font-bold text-[#a95720] underline underline-offset-2">Contact the Baraka Nest admin</Link>. Also see our <Link href="/privacy" className="font-bold text-[#a95720] underline underline-offset-2">Privacy Policy</Link> and <Link href="/avatar-credits" className="font-bold text-[#a95720] underline underline-offset-2">third-party image credits</Link>.
          </div>
        </div>
      </div>
    </main>
  );
}
