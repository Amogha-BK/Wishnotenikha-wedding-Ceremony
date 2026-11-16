export type Celebration = {
  id: "nikah" | "reception";
  shortName: string;
  title: string;
  dateLabel: string;
  timeLabel?: string;
  venue?: string;
  address?: string;
  supportingLine: string;
  start: string;
  calendarTitle: string;
  image: string;
  scene: "lanterns" | "fire" | "candlelight";
  mapUrl?: string;
};

export const invitationConfig = {
  couple: {
    first: "Javeed",
    second: "Fareen",
    groomFullName: "Nellikavil Mohammed Javeed",
    brideFullName: "Dr. Shaik Fareen Banu",
    groomParents: "",
    brideParents: "",
    groomGrandparents: "",
  },
  weddingLabel: "9 January 2027",
  countdownTarget: "2027-01-09T00:00:00+05:30",
  islamicInvocation: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  invitationLine: "Together with their families, Nellikavil Mohammed Javeed & Dr. Shaik Fareen Banu request the honour of your presence as they begin their beautiful journey together.",
  blessingLine: "Your presence, blessings, and duas mean the world to us as we unite under the grace of Almighty Allah.",
  closingBlessing: "We look forward to celebrating this special occasion with you. Your presence and blessings will make our celebration complete.",
  homeAddress: "",
  hosts: "",
  rsvp: "",
  wishesFrom: "",
  monogram: "/assets/monogram-aa.png",
  artwork: "/assets/hero-bg-endframe.jpg",
  venue: {
    name: "",
    address: "",
    mapUrl: "",
  },
  contacts: [] as string[],
  optional: {
    travel: "",
    stay: "",
    contact: "",
    musicUrl: "/assets/kudmayi.mp3",
    whatsappHostNumber: "",
  },
  celebrations: [
    {
      id: "nikah",
      shortName: "Nikah Ceremony",
      title: "The Sacred Nikah",
      dateLabel: "Saturday, 9 January 2027",
      timeLabel: "",
      venue: "",
      address: "",
      supportingLine: "A sacred union blessed by Almighty Allah, solemnized with solemn vows and heartfelt duas.",
      start: "2027-01-09T00:00:00+05:30",
      calendarTitle: "Javeed & Fareen · Nikah Ceremony",
      image: "/assets/midnight-jali-motif-1.jpg",
      scene: "candlelight",
      mapUrl: "",
    },
    {
      id: "reception",
      shortName: "Valima Reception",
      title: "Midnight Royal Reception",
      dateLabel: "Saturday, 16 January 2027",
      timeLabel: "",
      venue: "",
      address: "",
      supportingLine: "A majestic starry celebration of love, union, and joyous memories with family and friends.",
      start: "2027-01-16T00:00:00+05:30",
      calendarTitle: "Javeed & Fareen · Valima Reception",
      image: "/assets/midnight-jali-decor.jpg",
      scene: "lanterns",
      mapUrl: "",
    },
  ] satisfies Celebration[],
  calendar: { timezone: "Asia/Kolkata" },
} as const;
