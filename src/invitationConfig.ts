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
    first: "Fareen",
    second: "Javeed",
    groomFullName: "Nellikavil Mohammed Javeed",
    brideFullName: "Dr. Shaik Fareen Banu",
    brideQualification: "MBBS",
    groomQualification: "B.E I.T",
    groomParents: "S/o Mrs&Mr Abbas Nellikavil",
    brideParents: "D/o Dr. H. Zeenath Banu [AH Dept] and Shaik Sohail Ahmed",
    brideGrandparents: "Grand D/o Late Mrs. Hameeda Banu & P. Mohammed Hanief",
    groomGrandparents: "Grand S/o Late T.K.M Koya & Late Ahmed Kutty",
  },
  weddingLabel: "9 January 2027",
  countdownTarget: "2027-01-09T00:00:00+05:30",
  islamicInvocation: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  invitationLine: "Together with their families, Dr. Shaik Fareen Banu & Nellikavil Mohammed Javeed request the honour of your presence and duas on the auspicious occasion of their Nikah.",
  blessingLine: "Your presence, blessings, and duas mean the world to us as we unite under the grace of Almighty Allah.",
  closingBlessing: "We look forward to celebrating this special occasion with you. Your presence and blessings will make our celebration complete.",
  homeAddress: "Chanda Nagar, Hyderabad – 500050",
  hosts: "",
  rsvp: "",
  wishesFrom: "Abdul Wahid, Mrs Zahida Banu, Mrs. Zabreena Banu and Shaik Shama Banu",
  monogram: "/assets/monogram-aa.png",
  artwork: "/assets/entrance-courtyard-hd-v2.webp",
  venue: {
    name: "Aashiana Banquet & Conference",
    address: "Road No. 1, Banjara Hills, Hyderabad – 500034",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Aashiana+Banquet+%26+Conference+Road+No.+1+Banjara+Hills+Hyderabad+500034",
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
      shortName: "Wedding Ceremony",
      title: "Nikah",
      dateLabel: "Saturday, 9 January 2027",
      timeLabel: "After Maghrib",
      venue: "Aashiana Banquet & Conference",
      address: "Road No. 1, Banjara Hills, Hyderabad – 500034",
      supportingLine: "Nikah after Maghrib, followed by dinner.",
      start: "2027-01-09T00:00:00+05:30",
      calendarTitle: "Javeed & Fareen · Nikah Ceremony",
      image: "/assets/wedding-ceremony-hd-v2.webp",
      scene: "candlelight",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Aashiana+Banquet+%26+Conference+Road+No.+1+Banjara+Hills+Hyderabad+500034",
    },
    {
      id: "reception",
      shortName: "Reception",
      title: "Reception",
      dateLabel: "Saturday, 16 January 2027",
      timeLabel: "",
      venue: "Avoki Centro Arena",
      address: "Kottakadavu, Kadalundi, Calicut, Kerala – 673302",
      supportingLine: "",
      start: "2027-01-16T00:00:00+05:30",
      calendarTitle: "Javeed & Fareen · Valima Reception",
      image: "/assets/reception-hd.webp",
      scene: "lanterns",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Avoki+Centro+Arena+Kottakadavu+Kadalundi+Calicut+Kerala+673302",
    },
  ] satisfies Celebration[],
  calendar: { timezone: "Asia/Kolkata" },
} as const;
