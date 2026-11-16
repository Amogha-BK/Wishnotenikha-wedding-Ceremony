import type { EventKind, WeddingEvent, WeddingRecord } from "./schema";

export function sampleEvent(id: EventKind, weddingDate: string): WeddingEvent {
  const label = {
    mehndi: "Mehendi",
    haldi: "Haldi",
    sangeet: "Sangeet",
    wedding: "Wedding",
    reception: "Reception",
  }[id];
  return {
    id,
    shortName: `${label} Ceremony`,
    title: `${label} Ceremony — Together in celebration`,
    start: `${weddingDate}T${id === "haldi" ? "11:00" : "19:00"}:00+05:30`,
    venue: "Sample Garden Venue",
    address: "Sample Venue Road, Jaipur",
    mapUrl: "",
    supportingLine: "Join us for a joyful celebration.",
    image: `/assets/${id === "haldi" ? "haldi" : id === "mehndi" ? "mehndi" : "wedding"}-floral-arch-v2.webp`,
    scene: id === "wedding" ? "fire" : "lanterns",
    phereTime: "",
  };
}
export function createSampleRecord(): WeddingRecord {
  return {
    version: 1,
    templateId: "botanical",
    language: "en",
    weddingDate: "2027-02-14",
    countdownTarget: "2027-02-14T00:00:00+05:30",
    city: "Jaipur",
    scratchLocation: "",
    couple: {
      first: "Aanya",
      second: "Vivaan",
      brideParents: "The sample Sharma family",
      groomParents: "The sample Mehta family",
      groomGrandparents: "",
    },
    memorialLine: "",
    invitationLine:
      "Together with our families, Aanya and Vivaan invite you to celebrate their wedding.",
    blessingLine: "Your presence would mean the world to us.",
    homeAddress: "",
    hosts: "The Sharma & Mehta families",
    rsvp: "Our families",
    wishesFrom: "Family & friends",
    venue: { name: "Sample Garden Venue", address: "Sample Venue Road, Jaipur", mapUrl: "" },
    contacts: [],
    optional: { travel: "", stay: "", contact: "", musicUrl: "", whatsappHostNumber: "" },
    media: {
      portraitUrl: "/assets/couple-illustration-v1.png",
      portraitAlt: "An illustrated wedding couple",
      venueArtworkUrl: "/assets/wedding-floral-arch-v2.webp",
    },
    wording: {
      heroMessage: "A lifetime of love begins with a moment shared with you.",
      heroFootnote: "Your presence and blessings mean the world to us.",
      celebrationsIntro: "Cherished traditions, laughter, and a lifetime of love.",
      closingNote: "Our celebration is complete with you.",
    },
    celebrations: [
      sampleEvent("mehndi", "2027-02-13"),
      sampleEvent("haldi", "2027-02-14"),
      sampleEvent("wedding", "2027-02-14"),
    ],
  };
}
