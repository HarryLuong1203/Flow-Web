'use client';

import { Compass, Users, Map, CalendarDays } from 'lucide-react';
import { RegisterForm } from '@/components/auth/RegisterForm';

const features = [
  {
    icon: Users,
    title: 'Collaborate in Real-Time',
    description: 'Plan together with friends, vote on destinations, and sync schedules instantly.',
  },
  {
    icon: Map,
    title: 'Smart Itineraries',
    description: 'AI-powered suggestions to build the perfect travel plan for your group.',
  },
  {
    icon: CalendarDays,
    title: 'Seamless Scheduling',
    description: 'Find dates that work for everyone with intelligent availability matching.',
  },
];

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left Side — Branding (hidden on mobile) */}
      <div className="relative hidden w-1/2 overflow-hidden lg:flex lg:flex-col lg:items-center lg:justify-center">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#164e63] to-[#0c4a6e]" />

        {/* Animated Decorative Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 size-96 rounded-full bg-teal-500/10 blur-3xl animate-pulse" />
          <div className="absolute top-1/2 -left-32 size-[500px] rounded-full bg-cyan-500/10 blur-3xl animate-pulse [animation-delay:2s]" />
          <div className="absolute -bottom-32 right-1/4 size-80 rounded-full bg-blue-500/10 blur-3xl animate-pulse [animation-delay:4s]" />
          <div className="absolute top-1/3 right-1/3 size-64 rounded-full bg-orange-500/5 blur-3xl animate-pulse [animation-delay:3s]" />
        </div>

        {/* Grid Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-lg px-12">
          {/* Logo */}
          <div className="mb-12">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/30">
                <Compass className="size-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Flow Web <span className="inline-block animate-bounce [animation-delay:0.5s]">🌊</span>
                </h2>
                <p className="text-sm text-cyan-300/70">
                  Plan your group trips together
                </p>
              </div>
            </div>
          </div>

          {/* Tagline */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold leading-tight text-white">
              Your next adventure
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-teal-300 bg-clip-text text-transparent">
                starts here.
              </span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Join thousands of travelers who use Flow Web to plan
              unforgettable group trips effortlessly.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group flex items-start gap-4 rounded-xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm transition-all duration-300 hover:border-cyan-500/20 hover:bg-white/10"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-400 transition-colors duration-300 group-hover:from-cyan-500/30 group-hover:to-blue-500/30">
                  <feature.icon className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom accent */}
          <div className="mt-12 h-px w-full bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
          <p className="mt-4 text-center text-xs text-slate-500">
            Trusted by travelers worldwide
          </p>
        </div>
      </div>

      {/* Right Side — Register Form */}
      <div className="relative flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        {/* Subtle Background Gradient */}
        <div className="absolute inset-0 bg-[#0f172a]" />
        <div className="absolute inset-0 bg-gradient-to-b from-teal-950/20 via-transparent to-transparent" />

        {/* Mobile Header */}
        <div className="relative mb-8 flex items-center gap-3 lg:hidden">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/30">
            <Compass className="size-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">
            Flow Web <span>🌊</span>
          </h2>
        </div>

        {/* Form Container with Glassmorphism */}
        <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/[0.06] bg-slate-900/60 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-10">
          <RegisterForm />
        </div>

        {/* Footer */}
        <p className="relative mt-8 text-xs text-slate-600">
          © {new Date().getFullYear()} Flow Web. All rights reserved.
        </p>
      </div>
    </div>
  );
}
