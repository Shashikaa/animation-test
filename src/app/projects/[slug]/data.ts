export interface FullServiceData {
  title: string;
  category: string;
  images: string[];
}

export const GRAND_POOLS_DATA: Record<string, FullServiceData> = {
  "kooyong": {
    title: "Kooyong Rd Toorak",
    category: "Custom Concrete Pool",
    images: [
      "/kooyong/img-1.webp",
      "/kooyong/img-2.webp",
      "/kooyong/img-3.webp",
      "/kooyong/img-4.webp",
      "/kooyong/img-5.webp",
      "/kooyong/img-6.webp"
    ]
  },
  "dennett": {
    title: "Dennett st Carrum",
    category: "Family Sanctuary",
    images: [
      "/dennett/img-1.webp",
      "/dennett/img-2.webp",
      "/dennett/img-3.webp",
      "/dennett/img-4.webp",
      "/dennett/img-5.webp",
      "/dennett/img-6.webp"
    ]
  },
  "murray": {
    title: "Murray st Prahran",
    category: "Architectural Plunge",
    images: [
      "/murray/img-1.webp",
      "/murray/img-2.webp",
      "/murray/img-3.webp",
      "/murray/img-4.webp",
      "/murray/img-5.webp",
      "/murray/img-6.webp"
    ]
  },
  "reay": {
    title: "Reay Rd Mooroolbark",
    category: "Residential Oasis",
    images: [
      "/reay/img-1.webp",
      "/reay/img-2.webp",
      "/reay/img-3.webp",
      "/reay/img-4.webp",
      "/reay/img-5.webp",
      "/reay/img-6.webp"
    ]
  },
  "como": {
    title: "‘The Como’ Toorak",
    category: "Luxury Showcase",
    images: [
      "/como/img-1.webp",
      "/como/img-2.webp",
      "/como/img-3.webp",
      "/como/img-4.webp",
      "/como/img-5.webp",
      "/como/img-6.webp"
    ]
  }
};