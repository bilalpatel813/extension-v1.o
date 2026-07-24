import type { JobApplication } from "./api";

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

export const demoApplications: JobApplication[] = [
  {
    id: "demo-1",
    title: "Frontend Engineer",
    company: "Vercel",
    location: "Remote",
    source: "linkedin",
    status: "interview",
    appliedAt: daysAgo(2),
  },
  {
    id: "demo-2",
    title: "Product Designer",
    company: "Notion",
    location: "Remote",
    source: "indeed",
    status: "applied",
    appliedAt: daysAgo(4),
  },
  {
    id: "demo-3",
    title: "UX Researcher",
    company: "Figma",
    location: "Bengaluru, IN",
    source: "naukri",
    status: "rejected",
    appliedAt: daysAgo(9),
  },
  {
    id: "demo-4",
    title: "Design Systems Lead",
    company: "Stripe",
    location: "Remote",
    source: "linkedin",
    status: "offer",
    appliedAt: daysAgo(14),
  },
  {
    id: "demo-5",
    title: "Software Engineer, Full Stack",
    company: "Razorpay",
    location: "Mumbai, IN",
    source: "naukri",
    status: "applied",
    appliedAt: daysAgo(1),
  },
  {
    id: "demo-6",
    title: "Backend Engineer",
    company: "Postman",
    location: "Bengaluru, IN",
    source: "indeed",
    status: "interview",
    appliedAt: daysAgo(6),
  },
];
