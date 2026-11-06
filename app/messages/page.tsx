"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Navbar from "../navbar";
import { useLanguage } from "../language-context";

type Conversation = {
  user_id: string;
  profile_id: string;
  name: string;
  username: string;
  school: string;
  location: string;
  body?: string;
  created_at?: string;
  unread: number;
};
type Message = {
  id: string;
  sender_user_id: string;
  body: string;
  created_at: string;
};

const copy = {
  English: {
    title: "Messages", subtitle: "Keep the conversation going with your connections.",
    conversations: "Your conversations", select: "Choose a conversation",
    emptyTitle: "Your chats start with a connection",
    emptyText: "Connect with a roommate first. When they accept, you can plan the details together.",
    findPeople: "Find roommates", choose: "Choose a conversation to start chatting.",
    placeholder: "Write a message…", send: "Send", sending: "Sending…",
    loading: "Loading your conversations…", failed: "We could not load your messages.",
    retry: "Try again", signIn: "Sign in to see your messages.", logIn: "Log in",
    noMessages: "Start the conversation with a friendly hello.",
    sentError: "Your message was not sent. Try again.",
  },
  Swahili: {
    title: "Ujumbe", subtitle: "Endeleza mazungumzo na watu ulioungana nao.",
    conversations: "Mazungumzo yako", select: "Chagua mazungumzo",
    emptyTitle: "Mazungumzo huanza na connection",
    emptyText: "Ungana na roommate kwanza. Akikubali, mnaweza kupanga mambo pamoja.",
    findPeople: "Tafuta roommates", choose: "Chagua mazungumzo uanze kuongea.",
    placeholder: "Andika ujumbe…", send: "Tuma", sending: "Inatuma…",
    loading: "Tunapakia ujumbe…", failed: "Hatukuweza kupakia ujumbe.",
    retry: "Jaribu tena", signIn: "Ingia uone ujumbe wako.", logIn: "Ingia",
    noMessages: "Anzisha mazungumzo kwa salamu.",
    sentError: "Ujumbe haukutumwa. Jaribu tena.",
  },
  Sheng: {
    title: "Messages", subtitle: "Endelea story na connections zako.",
    conversations: "Chats zako", select: "Chagua chat",
    emptyTitle: "Chat inaanza ukipata connection",
    emptyText: "Connect na roommate kwanza. Akiniaccept mnaweza kupanga details pamoja.",
    findPeople: "Saka roommates", choose: "Chagua chat uanze story.",
    placeholder: "Andika message…", send: "Tuma", sending: "Inatuma…",
    loading: "Tunapakia chats…", failed: "Chats hazikuweza kuload.",
    retry: "Jaribu tena", signIn: "Log in ucheck messages zako.", logIn: "Log in",
    noMessages: "Anza story na salamu poa.",
    sentError: "Message haikutumwa. Jaribu tena.",
  },
} as const;

function timeLabel(value?: string) {
  if (!value) return "";
  const date = new Date(value.includes("Z") ? value : `${value.replace(" ", "T")}Z`);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function MessagesPage() {
  const { language } = useLanguage();
  const t = copy[language];
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sendError, setSendError] = useState("");
  const selected = useMemo(() => conversations.find((item) => item.user_id === selectedId), [conversations, selectedId]);

  const load = useCallback(async (otherId = "") => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(otherId ? `/api/messages?with=${encodeURIComponent(otherId)}` : "/api/messages", { credentials: "include" });
      const data = await response.json();
      if (!response.ok) throw new Error(response.status === 401 ? "unauthorized" : data.error || "failed");
      setConversations(data.conversations ?? []);
      setMessages(data.messages ?? []);
      if (otherId && !data.active) setSelectedId("");
      else if (!otherId && data.conversations?.length) setSelectedId(data.conversations[0].user_id);
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "failed");
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- Initial conversation loading is an external synchronization effect.
  useEffect(() => { void load(""); }, [load]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Selected conversation loading is an external synchronization effect.
    if (selectedId) void load(selectedId);
  }, [selectedId, load]);

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedId || !draft.trim() || sending) return;
    setSending(true);
    setSendError("");
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: selectedId, message: draft }),
      });
      if (!response.ok) throw new Error();
      setDraft("");
      await load(selectedId);
    } catch {
      setSendError(t.sentError);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-7 sm:px-6 sm:py-10">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8a958e]">Baraka Nest</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.045em] text-[#183b2c] sm:text-4xl">{t.title}</h1>
          <p className="mt-2 text-sm text-[#6f7b73]">{t.subtitle}</p>
        </div>
        <section className="grid min-h-[68vh] overflow-hidden rounded-[28px] border border-[#e5ebe3] bg-white shadow-[0_14px_40px_rgba(24,59,44,0.06)] lg:grid-cols-[320px_1fr]">
          <aside className="border-b border-[#e8ebe5] bg-[#fbfcfa] lg:border-b-0 lg:border-r">
            <h2 className="px-5 pb-3 pt-5 text-sm font-bold text-[#183b2c]">{t.conversations}</h2>
            {loading && !conversations.length ? (
              <div className="space-y-3 px-5 pb-5" aria-live="polite">
                <p className="text-sm text-[#7b877f]">{t.loading}</p>
                {[0, 1, 2].map((item) => <div key={item} className="h-16 animate-pulse rounded-2xl bg-[#eff3ed]" />)}
              </div>
            ) : conversations.length ? (
              <div className="flex gap-2 overflow-x-auto px-3 pb-3 lg:block lg:space-y-1 lg:px-2">
                {conversations.map((person) => (
                  <button key={person.user_id} type="button" onClick={() => setSelectedId(person.user_id)}
                    className={`min-w-56 flex-1 rounded-2xl p-3 text-left transition-colors lg:w-full ${selectedId === person.user_id ? "bg-[#edf3ed]" : "hover:bg-[#f3f6f1]"}`}>
                    <span className="flex items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#183b2c] text-sm font-bold text-white">{person.name.slice(0, 1).toUpperCase()}</span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-bold text-[#26352b]">{person.name}</span>
                          {person.unread > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e58b45] px-1 text-[10px] font-bold text-white">{person.unread}</span>}
                        </span>
                        <span className="mt-1 block truncate text-xs text-[#849087]">{person.body ?? person.school}</span>
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-5 pb-6">
                <div className="rounded-2xl border border-[#e5ebe3] bg-white p-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf3ed] text-xl text-[#183b2c]">◌</span>
                  <p className="mt-3 text-sm font-bold text-[#26352b]">{t.emptyTitle}</p>
                  <p className="mt-1 text-xs leading-5 text-[#78847c]">{t.emptyText}</p>
                  <Link href="/roommates" className="mt-4 inline-flex min-h-10 items-center rounded-full bg-[#183b2c] px-4 text-xs font-bold text-white hover:bg-[#285640]">{t.findPeople}</Link>
                </div>
              </div>
            )}
          </aside>

          <div className="flex min-h-[430px] flex-col">
            {error ? (
              <div className="m-auto max-w-sm px-6 py-12 text-center" role="alert">
                <p className="font-bold text-[#26352b]">{error === "unauthorized" ? t.signIn : t.failed}</p>
                {error === "unauthorized" ? <Link href="/login" className="mt-4 inline-flex min-h-11 items-center rounded-full bg-[#183b2c] px-5 text-sm font-bold text-white">{t.logIn}</Link> : <button onClick={() => void load()} className="mt-4 min-h-11 rounded-full bg-[#183b2c] px-5 text-sm font-bold text-white">{t.retry}</button>}
              </div>
            ) : !selected ? (
              <div className="m-auto px-6 py-12 text-center text-sm text-[#87928b]">{t.choose}</div>
            ) : (
              <>
                <header className="flex items-center gap-3 border-b border-[#edf0eb] px-4 py-3 sm:px-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#183b2c] font-bold text-white">{selected.name.slice(0, 1).toUpperCase()}</span>
                  <div className="min-w-0">
                    <h2 className="truncate font-bold text-[#26352b]">{selected.name}</h2>
                    <p className="truncate text-xs text-[#7b877f]">{selected.school} · {selected.location}</p>
                  </div>
                  <Link href={`/roommates/${selected.profile_id}`} className="ml-auto rounded-full border border-[#dce5dc] px-3 py-2 text-xs font-bold text-[#183b2c] hover:bg-[#f3f6f1]">{t.select}</Link>
                </header>
                <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-[linear-gradient(180deg,#fff,#fafbf9)] px-4 py-5 sm:px-6" aria-live="polite">
                  {loading ? <p className="m-auto text-sm text-[#849087]">{t.loading}</p> : messages.length ? messages.map((message) => {
                    const mine = message.sender_user_id !== selected.user_id;
                    return <div key={message.id} className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm sm:max-w-[70%] ${mine ? "ml-auto rounded-br-md bg-[#183b2c] text-white" : "mr-auto rounded-bl-md border border-[#e8ebe5] bg-white text-[#29382e]"}`}>
                      <p className="whitespace-pre-wrap break-words">{message.body}</p><time className={`mt-1 block text-[10px] ${mine ? "text-white/60" : "text-[#87928b]"}`}>{timeLabel(message.created_at)}</time>
                    </div>;
                  }) : <p className="m-auto text-center text-sm text-[#87928b]">{t.noMessages}</p>}
                </div>
                <form onSubmit={send} className="border-t border-[#edf0eb] bg-white p-3 sm:p-4">
                  {sendError && <p role="alert" className="mb-2 text-xs font-semibold text-red-700">{sendError}</p>}
                  <div className="flex items-end gap-2">
                    <textarea value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={2000} rows={1} placeholder={t.placeholder}
                      className="max-h-32 min-h-12 flex-1 resize-y rounded-2xl border border-[#dfe6dd] bg-[#fafbf9] px-4 py-3 text-sm outline-none placeholder:text-[#9aa49d] focus:border-[#8ea393] focus:bg-white" />
                    <button disabled={sending || !draft.trim()} className="min-h-12 rounded-2xl bg-[#183b2c] px-5 text-sm font-bold text-white transition hover:bg-[#285640] disabled:cursor-not-allowed disabled:opacity-50">{sending ? t.sending : t.send}</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
