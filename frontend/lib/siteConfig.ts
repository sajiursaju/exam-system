// lib/siteConfig.ts

export const siteConfig = {
  name: "Mr Exam Mentor Mainul", // <-- Updated to match your brand
  tagline: "Online Exams • Tutorials • Job Preparation",
  ceo: {
    name: "Mainul",
    title: "CEO",
    portfolioUrl: "https://www.facebook.com/mainulhmoni11", // <-- Added your Facebook link
  },
};

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features" },
  { label: "Online Exams", href: "/online-exams" },
  { label: "Tutorials", href: "/tutorials" },
  { label: "Pricing", href: "/pricing" }, // <-- Changed from "/#pricing" to "/pricing"
  { label: "Our Students", href: "/#our-students" }, // (Requires an id="our-students" on the home page)
  { label: "FAQ", href: "/faq" }, // (Requires an id="faq" on the home page)
];