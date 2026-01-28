export const eventsSeed = [
  {
    id: "e1",
    title: "Shutter Stories",
    slug: "shutter-stories",
    shortDescription: "Photography contest for DIU students.",
    description:
      "Join our photography contest. Submit your best captures and compete across categories.",
    deadline: "2026-02-01",
    status: "open",
    categories: ["Single Photo", "Photo Story", "Short Film"],
    coverImage: "",
    rules: [
      "Only DIU students can participate.",
      "Original content only.",
      "One submission per category.",
    ],
  },
  {
    id: "e2",
    title: "Cine Sprint",
    slug: "cine-sprint",
    shortDescription: "A short film challenge for creators.",
    description:
      "Make a short film within the given theme and submit before the deadline.",
    deadline: "2026-03-10",
    status: "open",
    categories: ["Short Film"],
    coverImage: "",
    rules: ["Max duration: 5 minutes.", "No copyrighted music."],
  },
];
