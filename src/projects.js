
export const projects = [
  {
    id: "cigarettes",
    title: "Cigarettes: A POV",
    category: "Documentary",
    media: [
      {
        type: "youtube",
        videoId: "9r8OXp9UPRY",
      },
      {
        type: "text",
        heading: "About the project",
        content:
          "Cigarettes: A POV investigates the resurgence of cigarette smoking and changing public attitudes towards cigarettes. Through street interviews and vox pops, we asked people to share their opinions and perspectives on smoking, exploring how cigarettes are perceived and understood in contemporary society.",
      },
      ...Array.from({ length: 3 }, (_, index) => ({
        type: "placeholder",
        label: `Add photograph ${String(index + 1).padStart(2, "0")}`,
      })),
    ],
  },

  {
    id: "the-scavenger",
    title: "The Scavenger",
    category: "Film",
    media: [
      {
        type: "youtube",
        videoId: "1CZQhfqEgp4",
      },
      {
        type: "text",
        heading: "About the project",
        content:
          "The Scavenger is a speculative fiction project set in a post-apocalyptic world where a scavenger searches for remnants of human life through found-footage media. As they uncover traces of the past, they are pursued by glowing husks left behind by humanity, exploring themes of memory, technology, and the remnants of human existence.",
      },
      ...Array.from({ length: 3 }, (_, index) => ({
        type: "placeholder",
        label: `Add photograph ${String(index + 1).padStart(2, "0")}`,
      })),
    ],
  },

  {
    id: "fragments",
    title: "Fragments of a Faded Past",
    category: "Photography & Sound",
    media: [
      {
        type: "text",
        heading: "Fragments of a Faded Past — Samatar",
        content:
          "FRAGMENTS OF A FADED PAST is a collection of works exploring memory, time, identity and the things we lose, carry and leave behind.",
      },
      {
        type: "text",
        heading: "My contribution",
        content:
          "I contributed to this project as a photographer, capturing and framing photographs for the accompanying booklet. I also appeared in the booklet as the man in the white glove.",
      },

      // Exactly 16 photographs. No photo 17 or 18.
      ...Array.from({ length: 16 }, (_, index) => ({
        type: "image",
        src: `/images/fragments/fragments-${String(index + 1).padStart(2, "0")}.jpg`,
        alt: `Fragments of a Faded Past photograph ${index + 1}`,
      })),

      {
        type: "text",
        heading: "Credits",
        content:
          "All songs written, produced and mixed by Samatar Mohamed. All tracks mastered by Will Klep. Poems written by Samatar Mohamed. Photography by Samatar Mohamed and Nikhil Sabu Joseph. Photo editing and treatment by Samatar Mohamed. Book concept, design and layout by Samatar Mohamed. Creative direction by Samatar Mohamed. Released by CONTENT.NET. Fragments of a Faded Past (2026).",
      },
    ],
  },

  {
    id: "is-this-immediacy",
    title: "Is This Immediacy?",
    category: "Video Essay",
    media: [
      {
        type: "youtube",
        videoId: "wb1jjjk2TvQ",
      },
      {
        type: "text",
        heading: "About the project",
        content:
          "Is This Immediacy? is a five-minute video essay examining how streaming platforms manufacture an illusion of unmediated connection. Drawing on Kornbluh's 'style of immediacy' and Rascaroli's direct address, it contrasts solo streaming with mass broadcasting, using OBS recordings and split-screen montage to make editing an instrument of inquiry.",
      },
      ...Array.from({ length: 3 }, (_, index) => ({
        type: "placeholder",
        label: `Add photograph ${String(index + 1).padStart(2, "0")}`,
      })),
    ],
  },
];
