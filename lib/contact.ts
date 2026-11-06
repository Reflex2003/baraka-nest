const listingMessage = encodeURIComponent("Hi Baraka Nest, I would like to list student housing for free.");

export const adminContactChannels = [
  { id: "whatsapp", label: "WhatsApp", href: `https://wa.me/254748798784?text=${listingMessage}`, detail: "Chat with me" },
  { id: "instagram", label: "Instagram", href: "https://www.instagram.com/ian_thoughts?vrfl=MTcwaHh3azNrd2FzZA==", detail: "Follow my updates" },
  { id: "facebook", label: "Facebook", href: "https://www.facebook.com/share/1E2p2v2Ead/", detail: "Visit my page" },
  { id: "threads", label: "Threads", href: "https://www.threads.com/@ian_thoughts", detail: "Follow me on Threads" },
  { id: "email", label: "Email", href: "mailto:ianmorgan107@gmail.com", detail: "Send me a message" },
  { id: "telegram", label: "Telegram", href: "https://t.me/ian_morgan", detail: "Chat with me" },
] as const;

export const freeListingLink = adminContactChannels[0].href;