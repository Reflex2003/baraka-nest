import Link from "next/link";
import Navbar from "../navbar";

const credits = [
  ["SpongeBob", "https://commons.wikimedia.org/wiki/File:SpongeBob_SquarePants_character.png"],
  ["Patrick", "https://commons.wikimedia.org/wiki/File:Patrick_Star_character.png"],
  ["Squidward", "https://commons.wikimedia.org/wiki/File:Squidward_Tentacles_character.png"],
  ["Sandy", "https://commons.wikimedia.org/wiki/File:Sandy_Cheeks_character.png"],
  ["Mr. Krabs", "https://commons.wikimedia.org/wiki/File:Mr_Krabs_character.png"],
  ["Gary", "https://commons.wikimedia.org/wiki/File:Gary_(SpongeBob)_character.png"],
];

export default function AvatarCreditsPage() {
  return (
    <main className="min-h-screen bg-[#f7f8f4] text-[#183b2c]">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-10 pb-32 sm:px-6 sm:py-16">
        <article className="rounded-[2rem] border border-[#e5ebe3] bg-white p-6 shadow-[0_16px_48px_rgba(24,59,44,0.06)] sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b46a32]">Baraka Nest · Image credits</p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-[-0.045em]">Avatar image credits</h1>
          <p className="mt-4 text-sm leading-7 text-[#5e6c62]">These specific character depictions are screenshots and crops from NickRewind material hosted on Wikimedia Commons. The Commons file pages identify NickRewind as the author/source and list the images under Creative Commons Attribution 3.0 Unported. Cropping/format copies may be used with attribution under that license. These credits do not imply endorsement by Nickelodeon or its parent company.</p>
          <ul className="mt-7 space-y-3">
            {credits.map(([name, source]) => (
              <li key={name} className="flex items-center justify-between gap-4 rounded-2xl bg-[#f5f7f3] px-4 py-3 text-sm">
                <span className="font-semibold">{name} — NickRewind</span>
                <a href={source} target="_blank" rel="noreferrer" className="shrink-0 font-bold text-[#a95720] underline underline-offset-2">Source page</a>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs leading-5 text-[#78837b]">License: <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noreferrer" className="underline underline-offset-2">CC BY 3.0</a>. Character names and depictions remain subject to applicable trademark and other rights.</p>
          <p className="mt-7 text-sm"><Link href="/profile" className="font-bold text-[#a95720] underline underline-offset-2">Back to profile</Link></p>
        </article>
      </div>
    </main>
  );
}
