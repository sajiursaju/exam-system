// lib/tutorialData.ts

export type Subject = {
    name: string;
    marks?: number; // optional, used for job exams like BCS
    topics: string[];
  };
  
  export type Package = {
    id: string;
    name: string;
    price: number; // BDT
    duration: string;
    popular?: boolean;
    features: string[];
  };
  
  export type Category = {
    slug: string; // used in the URL: /tutorials/[slug]
    group: "academic" | "job";
    name: string;
    nameBn: string;
    icon: string;
    description: string;
    basePrice: number; // Basic package price; other packages are calculated from it
    subjects: Subject[];
  };
  
  export const categories: Category[] = [
    // ───────────── ACADEMIC (3 cards) ─────────────
    {
      slug: "class-9-10",
      group: "academic",
      name: "Class 9-10 (SSC)",
      nameBn: "নবম-দশম শ্রেণি",
      icon: "📘",
      description: "Subject-wise video classes and full syllabus for SSC.",
      basePrice: 1500,
      subjects: [
        { name: "Bangla 1st Paper", topics: ["Prose", "Poetry", "Comprehension", "Creative writing"] },
        { name: "Bangla 2nd Paper", topics: ["Grammar", "Composition", "Paragraph", "Application and letter"] },
        { name: "English 1st Paper", topics: ["Reading comprehension", "Vocabulary", "Writing skills"] },
        { name: "English 2nd Paper", topics: ["Grammar", "Tense", "Transformation of sentences", "Composition"] },
        { name: "Mathematics", topics: ["Algebra", "Geometry", "Trigonometry", "Statistics", "Mensuration"] },
        { name: "Higher Mathematics", topics: ["Set and function", "Matrix", "Logarithm", "Coordinate geometry"] },
        { name: "Physics", topics: ["Motion", "Force", "Work, power and energy", "Light", "Electricity"] },
        { name: "Chemistry", topics: ["Matter", "Atomic structure", "Periodic table", "Chemical bonding", "Acids and bases"] },
        { name: "Biology", topics: ["Cell", "Nutrition", "Digestion", "Genetics", "Environment"] },
        { name: "ICT", topics: ["Information and communication", "Computer", "Internet", "Programming basics"] },
        { name: "Bangladesh & Global Studies", topics: ["History", "Geography", "Civics", "Economics"] },
      ],
    },
    {
      slug: "hsc-11-12",
      group: "academic",
      name: "HSC (Class 11-12)",
      nameBn: "একাদশ-দ্বাদশ শ্রেণি",
      icon: "🎓",
      description: "Subject-wise video classes and full syllabus for HSC.",
      basePrice: 2500,
      subjects: [
        { name: "Physics 1st Paper", topics: ["Physical world and measurement", "Vector", "Dynamics", "Newtonian mechanics", "Gravitation"] },
        { name: "Physics 2nd Paper", topics: ["Thermodynamics", "Static electricity", "Current electricity", "Modern physics"] },
        { name: "Chemistry 1st Paper", topics: ["Laboratory safety", "Qualitative chemistry", "Periodic table", "Chemical changes"] },
        { name: "Chemistry 2nd Paper", topics: ["Environmental chemistry", "Organic chemistry", "Quantitative chemistry", "Electrochemistry"] },
        { name: "Biology 1st Paper", topics: ["Cell and its structure", "Cell division", "Microorganisms", "Algae and fungi"] },
        { name: "Biology 2nd Paper", topics: ["Animal physiology", "Human physiology", "Genetics and evolution"] },
        { name: "Higher Math 1st Paper", topics: ["Matrix", "Vector", "Straight line", "Circle", "Trigonometry"] },
        { name: "Higher Math 2nd Paper", topics: ["Complex number", "Polynomial", "Conic section", "Calculus"] },
        { name: "ICT", topics: ["ICT and global village", "Number systems", "Web design and HTML", "Programming language", "Database"] },
        { name: "Bangla", topics: ["Prose", "Poetry", "Grammar", "Composition"] },
        { name: "English", topics: ["Reading", "Grammar", "Writing", "Vocabulary"] },
      ],
    },
    {
      // Moved from "job" to "academic" so the layout is 3 + 3
      slug: "primary",
      group: "academic",
      name: "Primary Teacher",
      nameBn: "প্রাথমিক শিক্ষক নিয়োগ",
      icon: "🍎",
      description: "Primary school teacher recruitment exam preparation.",
      basePrice: 1500,
      subjects: [
        { name: "Bangla", topics: ["Grammar", "Literature", "Comprehension"] },
        { name: "English", topics: ["Grammar", "Vocabulary", "Translation"] },
        { name: "Mathematics", topics: ["Arithmetic", "Algebra", "Geometry"] },
        { name: "General Science", topics: ["Physics", "Chemistry", "Biology"] },
        { name: "Bangladesh & Global Studies", topics: ["History", "Geography", "Civics"] },
        { name: "Mental Ability", topics: ["Verbal reasoning", "Logical analysis"] },
      ],
    },
  
    // ───────────── JOB PREPARATION (3 cards) ─────────────
    {
      slug: "bcs",
      group: "job",
      name: "BCS Preparation",
      nameBn: "বিসিএস প্রস্তুতি",
      icon: "🏛️",
      description: "Complete BCS preliminary syllabus with video classes and model tests.",
      basePrice: 3000,
      subjects: [
        { name: "Bangla Language & Literature", marks: 35, topics: ["Grammar", "Literature", "Writers and works", "Vocabulary"] },
        { name: "English Language & Literature", marks: 35, topics: ["Grammar", "Vocabulary", "Literature", "Writers and works"] },
        { name: "Bangladesh Affairs", marks: 30, topics: ["History", "Liberation War", "Constitution", "Economy", "Culture"] },
        { name: "International Affairs", marks: 20, topics: ["Organizations", "Current affairs", "World geography", "Treaties"] },
        { name: "Geography, Environment & Disaster Management", marks: 10, topics: ["Geography of Bangladesh", "Climate change", "Disaster management"] },
        { name: "General Science", marks: 15, topics: ["Physics", "Chemistry", "Biology", "Daily life science"] },
        { name: "Computer & Information Technology", marks: 15, topics: ["Computer basics", "Internet", "Networking", "Digital Bangladesh"] },
        { name: "Mathematical Reasoning", marks: 15, topics: ["Arithmetic", "Algebra", "Geometry", "Percentage, ratio and profit"] },
        { name: "Mental Ability", marks: 15, topics: ["Verbal reasoning", "Non-verbal reasoning", "Logical analysis"] },
        { name: "Ethics, Values & Good Governance", marks: 10, topics: ["Ethics and values", "Good governance", "Public administration"] },
      ],
    },
    {
      slug: "bank-job",
      group: "job",
      name: "Bank Job",
      nameBn: "ব্যাংক জব প্রস্তুতি",
      icon: "🏦",
      description: "Written and MCQ preparation for bank recruitment exams.",
      basePrice: 2000,
      subjects: [
        { name: "Bangla", topics: ["Grammar", "Comprehension", "Vocabulary"] },
        { name: "English", topics: ["Grammar", "Vocabulary", "Comprehension", "Sentence correction"] },
        { name: "Mathematics", topics: ["Arithmetic", "Percentage", "Profit and loss", "Time and work", "Data interpretation"] },
        { name: "General Knowledge", topics: ["Bangladesh affairs", "International affairs", "Banking and economy", "Current affairs"] },
        { name: "Computer & ICT", topics: ["Computer basics", "Networking", "Internet", "MS Office"] },
        { name: "Analytical Ability", topics: ["Logical reasoning", "Puzzles", "Series and patterns"] },
      ],
    },
    {
      slug: "niyogon",
      group: "job",
      name: "Niyogon (Govt Recruitment)",
      nameBn: "নিয়োগ পরীক্ষা প্রস্তুতি",
      icon: "📝",
      description: "General preparation for government and non-cadre recruitment exams.",
      basePrice: 1800,
      subjects: [
        { name: "Bangla", topics: ["Grammar", "Literature", "Comprehension"] },
        { name: "English", topics: ["Grammar", "Vocabulary", "Translation"] },
        { name: "Mathematics", topics: ["Arithmetic", "Algebra", "Geometry"] },
        { name: "General Knowledge", topics: ["Bangladesh affairs", "International affairs", "Current affairs"] },
        { name: "General Science", topics: ["Physics", "Chemistry", "Biology"] },
        { name: "ICT", topics: ["Computer basics", "Internet", "Digital services"] },
      ],
    },
  ];
  
  // Find one category by its URL slug (returns undefined if not found)
  export function getCategory(slug: string): Category | undefined {
    return categories.find((c) => c.slug === slug);
  }
  
  // Build the 3 packages for a category. Prices come from category.basePrice.
  export function getPackages(category: Category): Package[] {
    const base = category.basePrice;
    return [
      {
        id: "basic",
        name: "Basic",
        price: base,
        duration: "3 months",
        features: ["Recorded video classes", "Syllabus-wise lecture sheets", "Email support"],
      },
      {
        id: "standard",
        name: "Standard",
        price: base * 2,
        duration: "6 months",
        popular: true,
        features: [
          "Everything in Standard",
          "Weekly model tests on the exam system",
          "Result analytics",
          "Live doubt-solving session",
        ],
      },
      {
        id: "premium",
        name: "Premium",
        price: base * 3,
        duration: "12 months",
        features: [
          "Everything in Standard",
          "Unlimited model tests",
          "One-to-one mentor support",
          "Printed notes and certificate",
        ],
      },
    ];
  }