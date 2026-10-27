import type { Metadata } from "next";
import "./globals.css";
import { EventProvider } from "@/context/EventContext";
import { Navbar } from "@/components/navigation/Navbar";

export const metadata: Metadata = {
  title: "VibeCraft — GenAI-Powered Event Planning Assistant",
  description:
    "Organize unforgettable weddings, birthdays, and community gatherings with AI-generated budgets, timelines, vendor checklists, and personalized aesthetics.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased font-sans">
        <EventProvider>
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
          </div>
        </EventProvider>
      </body>
    </html>
  );
}
