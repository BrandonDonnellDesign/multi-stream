
"use client";

import Link from "next/link";
import { Users, LayoutGrid, MessageSquare, CalendarDays } from "lucide-react";

export default function LandingPage() {
  return (
  <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-card to-accent/40 text-center px-2 md:px-4">
  <header className="w-full flex flex-col md:flex-row items-center justify-between px-4 md:px-8 py-6 mb-12 gap-4 md:gap-0">
        <div className="flex items-center gap-3">
          <Link href="/">
            <img src="/logo.svg" alt="MultiStream Logo" className="h-10 w-10 cursor-pointer transition-transform hover:scale-110" />
          </Link>
          <span className="text-2xl font-bold text-primary">MultiStream</span>
        </div>
        <nav className="flex items-center gap-6">
          <Link href="/multistream" className="text-muted-foreground hover:text-accent font-semibold">MultiStream</Link>
          <a href="https://github.com/BrandonDonnellDesign/multi-stream" target="_blank" rel="noopener" className="text-muted-foreground hover:text-accent font-semibold">GitHub</a>
        </nav>
      </header>
  <section className="flex flex-col items-center justify-center flex-1 gap-8 w-full">
  <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-4 text-primary drop-shadow-lg">Welcome to MultiStream</h1>
  <h2 className="text-base sm:text-xl md:text-2xl font-medium text-accent mb-6">Your all-in-one hub for multi-platform live streaming</h2>
  <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 max-w-xl">A modern hub for multi-platform live streaming. Effortlessly watch, chat, and engage with Twitch, Kick, and YouTube creators—all in one place.</p>
        <div className="relative w-full max-w-3xl mb-16 px-2 sm:px-0">
          <div className="absolute inset-0 z-0 rounded-3xl bg-background/60 backdrop-blur-md shadow-2xl" />
          <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12 p-2 sm:p-4">
            <FeatureCard
              iconComponent={<CalendarDays className="h-32 w-32 text-accent" />}
              title="Live Events"
              description="Watch streams as they happen and never miss your favorite creators. All your favorites in one place without switching tabs."
            />
            <FeatureCard
              iconComponent={<LayoutGrid className="h-32 w-32 text-accent" />}
              title="Custom Layouts"
              description="Drag and drop streams to arrange your grid however you like. Responsive, modern, and built for engagement."
            />
          </div>
        </div>
  <Link href="/multistream" className="inline-block px-12 py-5 rounded-2xl bg-gradient-to-r from-accent to-primary text-background font-bold text-3xl shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-200">
          MultiStream
        </Link>
      </section>
      <footer className="mt-16 text-center text-base text-muted-foreground opacity-90">
  <div className="mb-2 font-semibold text-accent">Ready to experience multi-streaming? <Link href="/multistream" className="underline hover:text-primary transition-colors">Go to MultiStream</Link></div>
        <div className="text-xs mt-2">&copy; {new Date().getFullYear()} MultiStream. All rights reserved.</div>
      </footer>
    </main>
  );
}

function FeatureCard({ iconComponent, title, description }: { iconComponent: JSX.Element; title: string; description: string }) {
  return (
  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 p-6 sm:p-8 rounded-xl border border-muted bg-card shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-200 text-left cursor-pointer w-full">
      {iconComponent}
      <div>
        <h3 className="text-2xl md:text-3xl font-bold text-accent mb-2">{title}</h3>
        <p className="text-muted-foreground text-lg md:text-xl">{description}</p>
      </div>
    </div>
  );
}