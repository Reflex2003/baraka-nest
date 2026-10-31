"use client";

import Link from "next/link";
import { useLanguage } from "../../language-context";

const profiles = {
  brian: {
    name: "Brian",
    age: 22,
    campus: "JKUAT",
    location: "Juja",
    budget: "KSh 7,000",
    lifestyle: {
      English: "Chill & clean",
      Swahili: "Mtulivu na msafi",
      Sheng: "Chill na msafi",
    },
    bio: {
      English:
        "Easy-going student looking for a respectful roommate. I like keeping the house clean and having a peaceful space for studying.",
      Swahili:
        "Mwanafunzi mwenye urahisi wa kuishi na wengine anatafuta roommate mwenye heshima. Anapenda kuweka nyumba safi na kuwa na sehemu tulivu ya kusomea.",
      Sheng:
        "Ni student easy-going anadai roommate wa heshima. Anapenda keja iwe safi na space ikuwe peace ya kusoma.",
    },
    lookingFor: {
      English: "A clean, respectful and reliable roommate.",
      Swahili: "Roommate msafi, mwenye heshima na anayeaminika.",
      Sheng: "Roommate msafi, wa heshima na wa kuaminika.",
    },
  },

  sharon: {
    name: "Sharon",
    age: 21,
    campus: "Kenyatta University",
    location: "Kahawa",
    budget: "KSh 8,500",
    lifestyle: {
      English: "Social & outgoing",
      Swahili: "Mchangamfu na anayependa watu",
      Sheng: "Msee wa vibe na wasee",
    },
    bio: {
      English:
        "Friendly and easy-going student who enjoys good company but also respects personal space.",
      Swahili:
        "Mwanafunzi rafiki na mwenye urahisi wa kuishi na wengine ambaye anapenda company nzuri lakini pia anaheshimu nafasi binafsi.",
      Sheng:
        "Ni student friendly na easy-going. Anapenda good company lakini pia anarespect personal space.",
    },
    lookingFor: {
      English: "A friendly roommate with a good vibe.",
      Swahili: "Roommate rafiki mwenye vibe nzuri.",
      Sheng: "Roommate wa friendly mwenye vibe poa.",
    },
  },

  kevin: {
    name: "Kevin",
    age: 23,
    campus: "University of Nairobi",
    location: "Kilimani",
    budget: "KSh 10,000",
    lifestyle: {
      English: "Quiet & focused",
      Swahili: "Mtulivu na anayezingatia masomo",
      Sheng: "Chill na focused",
    },
    bio: {
      English:
        "Focused student looking for a peaceful shared space where everyone can concentrate and respect each other's routines.",
      Swahili:
        "Mwanafunzi anayezingatia masomo na anayetafuta sehemu ya pamoja yenye utulivu ambapo kila mtu anaweza kuzingatia masomo na kuheshimu ratiba za wengine.",
      Sheng:
        "Ako focused na shule na anadai keja yenye iko peace, kila mtu aweze kusoma na kurespect routine ya mwingine.",
    },
    lookingFor: {
      English:
        "A responsible roommate who values peace and cleanliness.",
      Swahili:
        "Roommate anayewajibika na anayethamini utulivu na usafi.",
      Sheng:
        "Roommate responsible mwenye anajua value ya peace na usafi.",
    },
  },
};

const translations = {
  English: {
    back: "← Back to roommates",
    about: "About",
    lookingFor: "Looking for",
    monthlyBudget: "Monthly budget",
    location: "Location",
    connect: "Connect with",
    profileNotFound: "Profile not found",
    profileNotFoundText: "This roommate profile doesn't exist.",
    backToRoommates: "Back to roommates",
  },

  Swahili: {
    back: "← Rudi kwa roommates",
    about: "Kuhusu",
    lookingFor: "Anatafuta",
    monthlyBudget: "Bajeti ya mwezi",
    location: "Eneo",
    connect: "Wasiliana na",
    profileNotFound: "Profile haijapatikana",
    profileNotFoundText: "Profile hii ya roommate haipo.",
    backToRoommates: "Rudi kwa roommates",
  },

  Sheng: {
    back: "← Rudi kwa roommates",
    about: "Kuhusu",
    lookingFor: "Anadai",
    monthlyBudget: "Budget ya mwezi",
    location: "Area",
    connect: "Connect na",
    profileNotFound: "Profile haipatikani",
    profileNotFoundText: "Hii profile ya roommate haiko.",
    backToRoommates: "Rudi kwa roommates",
  },
};

type ProfileId = keyof typeof profiles;
type Language = keyof typeof translations;

export default async function RoommateProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const profile = profiles[id as ProfileId];

  if (!profile) {
    return (
      <main className="min-h-screen bg-[#faf9f6] px-6 py-12 text-[#183b2c]">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold">
            Profile not found
          </h1>

          <p className="mt-3 text-[#68776d]">
            This roommate profile doesn&apos;t exist.
          </p>

          <Link
            href="/roommates"
            className="mt-6 inline-block rounded-2xl bg-[#183b2c] px-6 py-3 text-sm font-bold text-white"
          >
            Back to roommates
          </Link>
        </div>
      </main>
    );
  }

  return <ProfileContent profile={profile} />;
}

function ProfileContent({
  profile,
}: {
  profile: (typeof profiles)[ProfileId];
}) {
  const { language } = useLanguage();

  const currentLanguage = language as Language;
  const t = translations[currentLanguage];

  return (
    <main className="min-h-screen bg-[#faf9f6] px-6 py-10 text-[#183b2c]">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/roommates"
          className="text-sm font-semibold text-[#68776d] hover:text-[#e58b45]"
        >
          {t.back}
        </Link>

        <section className="mt-6 overflow-hidden rounded-3xl border border-[#e3e7df] bg-white shadow-sm">
          <div className="bg-[#dfe8dc] px-6 py-10 sm:px-10">
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-3xl font-bold shadow-sm">
                {profile.name.charAt(0)}
              </div>

              <div>
                <h1 className="text-3xl font-bold">
                  {profile.name}, {profile.age}
                </h1>

                <p className="mt-1 text-[#68776d]">
                  {profile.campus} · {profile.location}
                </p>

                <span className="mt-3 inline-block rounded-full bg-white px-3 py-1.5 text-xs font-semibold">
                  {profile.lifestyle[currentLanguage]}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-8 p-6 sm:p-10 md:grid-cols-[1fr_280px]">
            <div>
              <h2 className="text-xl font-bold">
                {t.about} {profile.name}
              </h2>

              <p className="mt-3 leading-7 text-[#68776d]">
                {profile.bio[currentLanguage]}
              </p>

              <h2 className="mt-8 text-xl font-bold">
                {t.lookingFor}
              </h2>

              <p className="mt-3 leading-7 text-[#68776d]">
                {profile.lookingFor[currentLanguage]}
              </p>
            </div>

            <aside className="rounded-3xl bg-[#f5f7f2] p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#68776d]">
                {t.monthlyBudget}
              </p>

              <p className="mt-1 text-2xl font-bold">
                {profile.budget}
              </p>

              <div className="my-5 h-px bg-[#dfe5dd]" />

              <p className="text-xs font-semibold uppercase tracking-wider text-[#68776d]">
                {t.location}
              </p>

              <p className="mt-1 font-semibold">
                {profile.location}
              </p>

              <button
                type="button"
                className="mt-6 w-full rounded-2xl bg-[#183b2c] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#285640]"
              >
                {t.connect} {profile.name}
              </button>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}