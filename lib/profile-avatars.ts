export const profileAvatars = [
  { id: "spongebob-happy", name: "SpongeBob", src: "/avatars/spongebob-happy.png" },
  { id: "patrick-happy", name: "Patrick", src: "/avatars/patrick-happy.png" },
  { id: "squidward-calm", name: "Squidward", src: "/avatars/squidward-calm.png" },
  { id: "sandy-confident", name: "Sandy", src: "/avatars/sandy-confident.png" },
  { id: "mr-krabs", name: "Mr. Krabs", src: "/avatars/mr-krabs.png" },
  { id: "gary", name: "Gary", src: "/avatars/gary.png" },
  { id: "doodlebob", name: "DoodleBob", src: "/avatars/doodlebob.png" },
  { id: "spongebob-in-show", name: "SpongeBob (Show Style)", src: "/avatars/spongebob-in-show.png" },
  { id: "spongebob-help-wanted", name: "SpongeBob (Classic)", src: "/avatars/spongebob-help-wanted.png" },
  { id: "spongebob-eyes", name: "SpongeBob (Eyes)", src: "/avatars/spongebob-eyes.png" },
] as const;

export type ProfileAvatarId = (typeof profileAvatars)[number]["id"];

export function getProfileAvatar(id: string) {
  return profileAvatars.find((avatar) => avatar.id === id) ?? null;
}
