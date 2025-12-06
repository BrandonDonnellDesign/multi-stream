
"use client";

import React from "react";
import Link from "next/link";
import NextImage from "next/image";
import { Users, LayoutGrid, MessageSquare, CalendarDays } from "lucide-react";

export default function LandingPage() {
  // ...
  // (Function content is unchanged, I'll targeting just the top and the FeatureCard def)
}

function FeatureCard({ iconComponent, title, description }: { iconComponent: React.ReactNode; title: string; description: string }) {
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