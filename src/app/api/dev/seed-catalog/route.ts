import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import PujaCatalog from "@/models/PujaCatalog";

const catalog = [
  {
    title: "Satyanarayan Puja",
    slug: "satyanarayan-puja",
    category: "Prosperity & Wealth",
    description: "For peace, prosperity, and blessings at home or business.",
    defaultDurationMins: 120,
    modesSupported: ["HOME", "ONLINE"],
    isActive: true,
    startingFrom: 1101,
    typicalMin: 1101,
    typicalMax: 2501
  },
  {
    title: "Griha Pravesh (Home Entry) Puja",
    slug: "griha-pravesh-puja",
    category: "Home & Property",
    description: "Performed before entering a new house to invite positivity.",
    defaultDurationMins: 180,
    modesSupported: ["HOME"],
    isActive: true,
    startingFrom: 3501,
    typicalMin: 3501,
    typicalMax: 11000
  },
  {
    title: "Vastu Shanti Puja",
    slug: "vastu-shanti-puja",
    category: "Home & Property",
    description: "For vastu balance and removing obstacles in home/property.",
    defaultDurationMins: 180,
    modesSupported: ["HOME", "ONLINE"],
    isActive: true,
    startingFrom: 3501,
    typicalMin: 3501,
    typicalMax: 9001
  },
  {
    title: "Ganesh Puja",
    slug: "ganesh-puja",
    category: "General Rituals",
    description: "For auspicious beginnings before important work or exams.",
    defaultDurationMins: 60,
    modesSupported: ["HOME", "ONLINE"],
    isActive: true,
    startingFrom: 501,
    typicalMin: 501,
    typicalMax: 1101
  },
  {
    title: "Lakshmi Puja",
    slug: "lakshmi-puja",
    category: "Prosperity & Wealth",
    description: "For wealth, financial stability, and business growth.",
    defaultDurationMins: 90,
    modesSupported: ["HOME", "ONLINE"],
    isActive: true,
    startingFrom: 701,
    typicalMin: 701,
    typicalMax: 1501
  },
  {
    title: "Saraswati Puja",
    slug: "saraswati-puja",
    category: "Education & Career",
    description: "For learning, wisdom, creativity, and exam success.",
    defaultDurationMins: 90,
    modesSupported: ["HOME", "ONLINE"],
    isActive: true,
    startingFrom: 701,
    typicalMin: 701,
    typicalMax: 1501
  },
  {
    title: "Navagraha Shanti Puja",
    slug: "navagraha-shanti-puja",
    category: "Health & Protection",
    description: "For planetary peace and reducing horoscope-related issues.",
    defaultDurationMins: 150,
    modesSupported: ["HOME", "ONLINE"],
    isActive: true,
    startingFrom: 2101,
    typicalMin: 2101,
    typicalMax: 5501
  },
  {
    title: "Rudrabhishek",
    slug: "rudrabhishek",
    category: "Health & Protection",
    description: "Shiva abhishek for peace, health, and protection.",
    defaultDurationMins: 90,
    modesSupported: ["HOME", "ONLINE"],
    isActive: true,
    startingFrom: 1101,
    typicalMin: 1101,
    typicalMax: 2501
  },
  {
    title: "Mahamrityunjaya Jaap & Havan",
    slug: "mahamrityunjaya-jaap-havan",
    category: "Health & Protection",
    description: "For health recovery, protection, and fear removal.",
    defaultDurationMins: 180,
    modesSupported: ["HOME", "ONLINE"],
    isActive: true,
    startingFrom: 3501,
    typicalMin: 3501,
    typicalMax: 9001
  },
  {
    title: "Kali Puja",
    slug: "kali-puja",
    category: "Health & Protection",
    description: "For strength, protection, and removing negativity.",
    defaultDurationMins: 120,
    modesSupported: ["HOME", "ONLINE"],
    isActive: true,
    startingFrom: 1501,
    typicalMin: 1501,
    typicalMax: 3501
  },
  {
    title: "Durga Puja (Home Ritual)",
    slug: "durga-puja-home",
    category: "Health & Protection",
    description: "Durga worship at home for protection and family well-being.",
    defaultDurationMins: 120,
    modesSupported: ["HOME", "ONLINE"],
    isActive: true,
    startingFrom: 1501,
    typicalMin: 1501,
    typicalMax: 3501
  },
  {
    title: "Namkaran (Naming Ceremony)",
    slug: "namkaran",
    category: "Kids & Family",
    description: "Naming ceremony rituals with muhurat suggestions.",
    defaultDurationMins: 120,
    modesSupported: ["HOME", "ONLINE"],
    isActive: true,
    startingFrom: 1501,
    typicalMin: 1501,
    typicalMax: 3501
  },
  {
    title: "Mundan (First Haircut Ceremony)",
    slug: "mundan",
    category: "Kids & Family",
    description: "Traditional mundan rituals for the child.",
    defaultDurationMins: 120,
    modesSupported: ["HOME"],
    isActive: true,
    startingFrom: 1501,
    typicalMin: 1501,
    typicalMax: 3501
  },
  {
    title: "Annaprashan (First Rice Ceremony)",
    slug: "annaprashan",
    category: "Kids & Family",
    description: "First solid food ceremony with blessings.",
    defaultDurationMins: 90,
    modesSupported: ["HOME", "ONLINE"],
    isActive: true,
    startingFrom: 1101,
    typicalMin: 1101,
    typicalMax: 2501
  },
  {
    title: "Shraddha / Tarpan (Ancestor Ritual)",
    slug: "shraddha-tarpan",
    category: "Ancestors & Remembrance",
    description: "Rituals for ancestor peace; scheduled as per tithi.",
    defaultDurationMins: 150,
    modesSupported: ["HOME", "ONLINE"],
    isActive: true,
    startingFrom: 2101,
    typicalMin: 2101,
    typicalMax: 6501
  }
];

export async function POST() {
  await connectDB();

  const ops = catalog.map((item) => ({
    updateOne: {
      filter: { slug: item.slug },
      update: { $set: item },
      upsert: true,
    },
  }));

  const result = await PujaCatalog.bulkWrite(ops);

  return NextResponse.json({
    ok: true,
    message: "Catalog seeded (upsert).",
    result,
  });
}
