"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Navbar from "../../navbar";
import { useLanguage, type Language } from "../../language-context";
import { profileAvatars } from "@/lib/profile-avatars";

const interestOptions = [
  "Football",
  "Gaming",
  "Music",
  "Movies",
  "Gym",
  "Reading",
  "Travel",
  "Cooking",
  "Tech",
  "Photography",
];

const lifestyleOptions = [
  "Clean & organized",
  "Quiet home",
  "Social",
  "Early sleeper",
  "Night owl",
  "Study focused",
  "Occasional hangouts",
  "Respectful of privacy",
];

const locationOptions = [
  "Kilimani",
  "Juja",
  "Kasarani",
  "Rongai",
  "Kahawa",
  "Ruiru",
  "Eldoret",
  "Nakuru",
  "Mombasa",
];

const translations = {
  English: {
    eyebrow: "Baraka Nest · Roommates",
    title: "Create your",
    titleMuted: "roommate profile.",
    intro:
      "Tell students a little about yourself, your budget and the kind of home you want. The right roommate could be one profile away.",
    basic: "01 · Basic information",
    basicTitle: "Start with the basics.",
    fullName: "Full name",
    yourName: "Your name",
    age: "Age",
    school: "School / University",
    yourSchool: "Your school",
    housing: "02 · Housing preferences",
    housingTitle: "What are you looking for?",
    preferredArea: "Preferred area",
    selectArea: "Select an area",
    budget: "Monthly roommate budget",
    moveIn: "Move-in time",
    preference: "Roommate preference",
    lifestyleSection: "03 · How you live",
    lifestyleTitle: "Help people understand your lifestyle.",
    lifestyleText: "Select everything that describes you.",
    interestsSection: "04 · Your interests",
    interestsTitle: "What are you into?",
    aboutSection: "05 · About you",
    aboutTitle: "Say a little more.",
    aboutPlaceholder:
      "Tell potential roommates about yourself, your routine, what kind of home you want and anything else that matters...",
    profileNote:
      "Your profile will only be created after you submit this form.",
    creating: "Creating profile...",
    create: "Create Profile",
    browse: "Browse roommates →",
    tagline: "Better student living, together.",
    required: "Please complete all required profile details.",
    createdNoId:
      "Profile was created but no profile ID was returned.",
    submitError:
      "Something went wrong while creating your profile.",
    avatar: "Choose an avatar or upload a photo (optional)",
    gender: "Gender (optional)",
    customGender: "How do you identify? e.g. spoon or cow 😄",
  },

  Swahili: {
    eyebrow: "Baraka Nest · Roommates",
    title: "Tengeneza",
    titleMuted: "profile yako ya roommate.",
    intro:
      "Waambie wanafunzi kidogo kukuhusu, budget yako na aina ya nyumba unayotaka. Roommate anayekufaa anaweza kuwa profile moja tu mbali.",
    basic: "01 · Taarifa za msingi",
    basicTitle: "Anza na taarifa muhimu.",
    fullName: "Jina kamili",
    yourName: "Jina lako",
    age: "Umri",
    school: "Chuo / University",
    yourSchool: "Jina la chuo chako",
    housing: "02 · Mapendeleo ya makazi",
    housingTitle: "Unatafuta nini?",
    preferredArea: "Eneo unalopendelea",
    selectArea: "Chagua eneo",
    budget: "Budget ya mwezi ya roommate",
    moveIn: "Muda wa kuhamia",
    preference: "Unapendelea roommate wa aina gani?",
    lifestyleSection: "03 · Maisha yako",
    lifestyleTitle: "Wasaidie watu kuelewa lifestyle yako.",
    lifestyleText: "Chagua kila kitu kinachokuelezea.",
    interestsSection: "04 · Unachopenda",
    interestsTitle: "Unapenda kufanya nini?",
    aboutSection: "05 · Kukuhusu",
    aboutTitle: "Eleza kidogo zaidi.",
    aboutPlaceholder:
      "Waambie roommates watarajiwa kukuhusu, routine yako, aina ya nyumba unayotaka na kitu kingine muhimu...",
    profileNote:
      "Profile yako itatengenezwa baada ya kutuma form hii.",
    creating: "Inatengeneza profile...",
    create: "Tengeneza Profile",
    browse: "Tafuta roommates →",
    tagline: "Maisha bora ya wanafunzi, pamoja.",
    required: "Tafadhali jaza taarifa zote muhimu za profile.",
    createdNoId:
      "Profile imetengenezwa lakini profile ID haikupatikana.",
    submitError:
      "Kuna tatizo wakati wa kutengeneza profile yako.",
    avatar: "Chagua avatar au upload picha (si lazima)",
    gender: "Jinsia (si lazima)",
    customGender: "Unajitambulisha vipi? mfano spoon ama cow 😄",
  },

  Sheng: {
    eyebrow: "Baraka Nest · Roommates",
    title: "Tengeneza",
    titleMuted: "roommate profile yako.",
    intro:
      "Waambie wasee kidogo kukuhusu, budget yako na type ya place unadai. Roommate wako anaweza kuwa profile moja tu away.",
    basic: "01 · Basic info",
    basicTitle: "Anza na basics.",
    fullName: "Full name",
    yourName: "Name yako",
    age: "Age",
    school: "School / Campus",
    yourSchool: "Campus yako",
    housing: "02 · Housing preferences",
    housingTitle: "Unadai nini?",
    preferredArea: "Area unadai",
    selectArea: "Chagua area",
    budget: "Roommate budget ya mwezi",
    moveIn: "Move-in time",
    preference: "Roommate preference",
    lifestyleSection: "03 · Vile unaishi",
    lifestyleTitle: "Wasaidie wasee wajue lifestyle yako.",
    lifestyleText: "Select kila kitu inakurepresent.",
    interestsSection: "04 · Vitu unapenda",
    interestsTitle: "Unahustle na nini?",
    aboutSection: "05 · Kukuhusu",
    aboutTitle: "Sema kidogo zaidi.",
    aboutPlaceholder:
      "Waambie potential roommates kukuhusu, routine yako, type ya home unadai na anything muhimu...",
    profileNote:
      "Profile yako itacreateiwa baada ya kusubmit hii form.",
    creating: "Inacreate profile...",
    create: "Create Profile",
    browse: "Saka roommates →",
    tagline: "Student life better, pamoja.",
    required: "Jaza details zote muhimu za profile.",
    createdNoId:
      "Profile imecreate lakini profile ID haikurudi.",
    submitError:
      "Kuna noma imehappen wakati wa kucreate profile.",
    avatar: "Chagua avatar ama upload picha (optional)",
    gender: "Gender (optional)",
    customGender: "Unajitambulisha aje? mfano spoon ama cow 😄",
  },
};

const optionTranslations = {
  Swahili: {
    Football: "Mpira",
    Gaming: "Gaming",
    Music: "Muziki",
    Movies: "Filamu",
    Gym: "Gym",
    Reading: "Kusoma",
    Travel: "Kusafiri",
    Cooking: "Kupika",
    Tech: "Tech",
    Photography: "Photography",
    "Clean & organized": "Msafi na mpangilio",
    "Quiet home": "Nyumba tulivu",
    Social: "Mchangamfu",
    "Early sleeper": "Analala mapema",
    "Night owl": "Hulinda usiku",
    "Study focused": "Anazingatia masomo",
    "Occasional hangouts": "Hutoka mara kwa mara",
    "Respectful of privacy": "Anaheshimu privacy",
  },
  Sheng: {
    Football: "Ball",
    Gaming: "Gaming",
    Music: "Music",
    Movies: "Movies",
    Gym: "Gym",
    Reading: "Kusoma",
    Travel: "Travel",
    Cooking: "Kupika",
    Tech: "Tech",
    Photography: "Photography",
    "Clean & organized": "Clean na organized",
    "Quiet home": "Home iko chill",
    Social: "Social",
    "Early sleeper": "Hulala mapema",
    "Night owl": "Night owl",
    "Study focused": "Ako focused na kusoma",
    "Occasional hangouts": "Hutoka sometimes",
    "Respectful of privacy": "Anaheshimu privacy",
  },
};

function translateOption(
  value: string,
  language: Language,
) {
  if (language === "English") {
    return value;
  }

  return (
    optionTranslations[language]?.[
      value as keyof (typeof optionTranslations)[typeof language]
    ] ?? value
  );
}

export default function CreateRoommatePage() {
  const router = useRouter();
  const { language } = useLanguage();

  const currentLanguage = language as Language;
  const t = translations[currentLanguage];

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [school, setSchool] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [moveIn, setMoveIn] = useState("");
  const [preference, setPreference] = useState("");
  const [genderChoice, setGenderChoice] = useState("");
  const [customGender, setCustomGender] = useState("");
  const [avatarId, setAvatarId] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [about, setAbout] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [lifestyle, setLifestyle] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleOption(
    value: string,
    current: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) {
    setter(
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");

    if (
      !name.trim() ||
      !age ||
      !school.trim() ||
      !location ||
      !budget ||
      !moveIn ||
      !preference ||
      !about.trim()
    ) {
      setError(t.required);
      return;
    }

    setLoading(true);

    try {
      if (profilePhoto) {
        const formData = new FormData();
        formData.set("avatar", profilePhoto);
        const uploadResponse = await fetch("/api/profile/avatar", { method: "POST", body: formData });
        const uploadResult = await uploadResponse.json();
        if (!uploadResponse.ok) throw new Error(uploadResult.error || "Profile photo upload failed.");
      } else if (avatarId) {
        const avatarResponse = await fetch("/api/profile/avatar/selection", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatarId }),
        });
        const avatarResult = await avatarResponse.json();
        if (!avatarResponse.ok) throw new Error(avatarResult.error || "Could not save selected avatar.");
      }

      const response = await fetch("/api/roommates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          age: Number(age),
          school: school.trim(),
          location,
          budget: Number(budget),
          moveIn,
          preference,
          gender: genderChoice === "Self-describe" ? customGender.trim() : genderChoice,
          about: about.trim(),
          interests,
          lifestyle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || t.submitError,
        );
      }

      if (!data.id) {
        throw new Error(t.createdNoId);
      }

      router.push(`/roommates/${data.id}`);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : t.submitError,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white text-black">
        <section className="border-b border-black/10 bg-[#f7f7f5]">
          <div className="mx-auto max-w-5xl px-6 py-16 lg:px-8 lg:py-24">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-black/40">
              {t.eyebrow}
            </p>

            <h1 className="mt-5 text-5xl font-black tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              {t.title}
              <br />
              <span className="text-black/30">
                {t.titleMuted}
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-black/55">
              {t.intro}
            </p>
          </div>
        </section>

        <form
          onSubmit={handleSubmit}
          className="mx-auto max-w-5xl px-6 py-14 lg:px-8 lg:py-20"
        >
          <section>
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/35">
                {t.basic}
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight">
                {t.basicTitle}
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-sm font-bold">
                  {t.fullName}
                </label>

                <input
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder={t.yourName}
                  required
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f7f5] px-5 py-4 outline-none transition focus:border-black"
                />
              </div>

              <div>
                <label className="text-sm font-bold">
                  {t.age}
                </label>

                <input
                  type="number"
                  min="16"
                  max="100"
                  value={age}
                  onChange={(event) =>
                    setAge(event.target.value)
                  }
                  placeholder="22"
                  required
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f7f5] px-5 py-4 outline-none transition focus:border-black"
                />
              </div>

              <div>
                <label className="text-sm font-bold">
                  {t.school}
                </label>

                <input
                  value={school}
                  onChange={(event) =>
                    setSchool(event.target.value)
                  }
                  placeholder={t.yourSchool}
                  required
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f7f5] px-5 py-4 outline-none transition focus:border-black"
                />
              </div>

              <div className="md:col-span-2 rounded-3xl border border-black/10 bg-[#f7f7f5] p-5">
                <label className="text-sm font-bold">{t.avatar}</label>
                <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
                  {profileAvatars.map((avatar) => (
                    <button key={avatar.id} type="button" aria-label={`Choose ${avatar.name}`} aria-pressed={avatarId === avatar.id}
                      onClick={() => { setAvatarId(avatar.id); setProfilePhoto(null); }}
                      className={`rounded-2xl border p-2 transition ${avatarId === avatar.id ? "border-emerald-700 bg-emerald-50 ring-2 ring-emerald-700" : "border-black/10 bg-white hover:border-black/40"}`}>
                      <Image src={avatar.src} alt={avatar.name} width={72} height={72} className="mx-auto h-14 w-14 rounded-full object-cover" />
                      <span className="mt-1 block truncate text-xs font-semibold">{avatar.name}</span>
                    </button>
                  ))}
                </div>
                <label className="mt-4 block text-sm font-semibold">Or upload your own photo</label>
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => { setProfilePhoto(event.target.files?.[0] ?? null); if (event.target.files?.[0]) setAvatarId(""); }} className="mt-2 block w-full text-sm" />
                <p className="mt-1 text-xs text-black/45">Optional · image up to 5 MB</p>
              </div>

              <div>
                <label className="text-sm font-bold">{t.gender}</label>
                <select value={genderChoice} onChange={(event) => setGenderChoice(event.target.value)} className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f7f5] px-5 py-4 outline-none focus:border-black">
                  <option value="">Prefer not to say</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Self-describe">I identify as…</option>
                </select>
                {genderChoice === "Self-describe" && <input value={customGender} maxLength={60} onChange={(event) => setCustomGender(event.target.value)} placeholder={t.customGender} className="mt-3 w-full rounded-2xl border border-black/10 bg-white px-5 py-4 outline-none focus:border-black" />}
              </div>
            </div>
          </section>

          <div className="my-16 border-t border-black/10" />

          <section>
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/35">
                {t.housing}
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight">
                {t.housingTitle}
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-bold">
                  {t.preferredArea}
                </label>

                <select
                  value={location}
                  onChange={(event) =>
                    setLocation(event.target.value)
                  }
                  required
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f7f5] px-5 py-4 outline-none transition focus:border-black"
                >
                  <option value="">
                    {t.selectArea}
                  </option>

                  {locationOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-bold">
                  {t.budget}
                </label>

                <div className="relative mt-2">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-bold text-black/40">
                    KSh
                  </span>

                  <input
                    type="number"
                    min="500"
                    value={budget}
                    onChange={(event) =>
                      setBudget(event.target.value)
                    }
                    placeholder="8500"
                    required
                    className="w-full rounded-2xl border border-black/10 bg-[#f7f7f5] px-14 py-4 outline-none transition focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold">
                  {t.moveIn}
                </label>

                <input
                  value={moveIn}
                  onChange={(event) =>
                    setMoveIn(event.target.value)
                  }
                  placeholder="January 2027"
                  required
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f7f5] px-5 py-4 outline-none transition focus:border-black"
                />
              </div>

              <div>
                <label className="text-sm font-bold">
                  {t.preference}
                </label>

                <input
                  value={preference}
                  onChange={(event) =>
                    setPreference(event.target.value)
                  }
                  placeholder="Quiet & clean"
                  required
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f7f7f5] px-5 py-4 outline-none transition focus:border-black"
                />
              </div>
            </div>
          </section>

          <div className="my-16 border-t border-black/10" />

          <section>
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/35">
                {t.lifestyleSection}
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight">
                {t.lifestyleTitle}
              </h2>

              <p className="mt-3 text-sm leading-6 text-black/50">
                {t.lifestyleText}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {lifestyleOptions.map((item) => {
                const selected = lifestyle.includes(item);

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      toggleOption(
                        item,
                        lifestyle,
                        setLifestyle,
                      )
                    }
                    className={`rounded-full border px-5 py-3 text-sm font-semibold transition ${
                      selected
                        ? "border-black bg-black text-white"
                        : "border-black/10 bg-[#f7f7f5] hover:border-black/30"
                    }`}
                  >
                    {translateOption(
                      item,
                      currentLanguage,
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          <div className="my-16 border-t border-black/10" />

          <section>
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/35">
                {t.interestsSection}
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight">
                {t.interestsTitle}
              </h2>
            </div>

            <div className="flex flex-wrap gap-3">
              {interestOptions.map((item) => {
                const selected = interests.includes(item);

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      toggleOption(
                        item,
                        interests,
                        setInterests,
                      )
                    }
                    className={`rounded-full border px-5 py-3 text-sm font-semibold transition ${
                      selected
                        ? "border-black bg-black text-white"
                        : "border-black/10 bg-[#f7f7f5] hover:border-black/30"
                    }`}
                  >
                    {translateOption(
                      item,
                      currentLanguage,
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          <div className="my-16 border-t border-black/10" />

          <section>
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/35">
                {t.aboutSection}
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight">
                {t.aboutTitle}
              </h2>
            </div>

            <textarea
              value={about}
              onChange={(event) =>
                setAbout(event.target.value)
              }
              placeholder={t.aboutPlaceholder}
              required
              rows={7}
              className="w-full resize-none rounded-3xl border border-black/10 bg-[#f7f7f5] px-5 py-5 leading-7 outline-none transition focus:border-black"
            />

            {error && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-md text-xs leading-5 text-black/40">
                {t.profileNote}
              </p>

              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-black px-8 py-4 text-sm font-black text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? t.creating
                  : t.create}
              </button>
            </div>
          </section>
        </form>

        <footer className="border-t border-black/10 bg-white">
          <div className="mx-auto flex max-w-5xl flex-col gap-5 px-6 py-10 sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <div>
              <div className="text-lg font-black tracking-tight">
                BARAKA<span className="text-black/35">
                  NEST
                </span>
              </div>

              <p className="mt-1 text-xs text-black/40">
                {t.tagline}
              </p>
            </div>

            <Link
              href="/roommates"
              className="text-sm font-semibold text-black/50 transition hover:text-black"
            >
              {t.browse}
            </Link>
          </div>
        </footer>
      </main>
    </>
  );
}
