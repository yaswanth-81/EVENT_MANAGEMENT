import techSummitImg from "@/assets/event-tech-summit.jpg";
import workshopImg from "@/assets/event-workshop.jpg";
import networkingImg from "@/assets/event-networking.jpg";
import startupImg from "@/assets/event-startup.jpg";
import musicImg from "@/assets/event-music.jpg";
import wellnessImg from "@/assets/event-wellness.jpg";

export interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  price: number;
  image: string;
  featured?: boolean;
}

export const initialEvents: Event[] = [
  {
    id: "1",
    name: "Tech Summit 2024",
    description:
      "Join industry leaders for a day of keynotes, panels, and hands-on workshops covering the latest in AI, cloud infrastructure, and developer tooling.",
    date: "Oct 26, 2024",
    price: 199,
    image: techSummitImg,
    featured: true,
  },
  {
    id: "2",
    name: "Design Workshop",
    description:
      "A half-day, hands-on workshop exploring modern design systems, prototyping workflows, and cross-functional collaboration techniques.",
    date: "Nov 8, 2024",
    price: 49,
    image: workshopImg,
    featured: true,
  },
  {
    id: "3",
    name: "Startup Pitch Night",
    description:
      "Watch 10 early-stage startups pitch their ideas to a panel of investors. Network with founders and VCs over drinks afterward.",
    date: "Nov 15, 2024",
    price: 0,
    image: startupImg,
    featured: true,
  },
  {
    id: "4",
    name: "Networking Mixer",
    description:
      "An evening of structured networking for professionals in tech, design, and product. Make meaningful connections in a relaxed setting.",
    date: "Dec 1, 2024",
    price: 25,
    image: networkingImg,
    featured: true,
  },
  {
    id: "5",
    name: "Music & Arts Festival",
    description:
      "A weekend celebration of live music, art installations, and local food vendors. Family-friendly with activities for all ages.",
    date: "Dec 14, 2024",
    price: 75,
    image: musicImg,
  },
  {
    id: "6",
    name: "Wellness Retreat",
    description:
      "Recharge with a full day of guided yoga, meditation, and wellness workshops. Healthy meals and refreshments included.",
    date: "Jan 10, 2025",
    price: 120,
    image: wellnessImg,
  },
];
