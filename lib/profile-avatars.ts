export const profileAvatars = [
  { id: "spongebob-happy", name: "SpongeBob", src: "/avatars/spongebob-happy.png" },
  { id: "patrick-happy", name: "Patrick", src: "/avatars/patrick-happy.png" },
  { id: "squidward-calm", name: "Squidward", src: "/avatars/squidward-calm.png" },
  { id: "sandy-confident", name: "Sandy", src: "/avatars/sandy-confident.png" },
  { id: "mr-krabs", name: "Mr. Krabs", src: "/avatars/mr-krabs.png" },
  { id: "gary", name: "Gary", src: "/avatars/gary.png" },
] as const;

export type ProfileAvatarId = (typeof profileAvatars)[number]["id"];

export function getProfileAvatar(id: string) {
  return profileAvatars.find((avatar) => avatar.id === id) ?? null;
}
