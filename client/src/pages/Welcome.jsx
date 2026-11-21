import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Landmark, PiggyBank, TrendingUp, Wallet } from "lucide-react";

const slides = [
  { title: "Make every shilling count", subtitle: "A clearer plan for the things that matter.", icon: Wallet },
  { title: "Find your money rhythm", subtitle: "See what comes in and where it goes.", icon: TrendingUp },
  { title: "Build toward something bigger", subtitle: "Small steps today make room for tomorrow.", icon: PiggyBank },
];

export default function Welcome() {
  const [activeSlide, setActiveSlide] = useState(0);
  const slide = slides[activeSlide];
  const SlideIcon = slide.icon;

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <section className="relative flex min-h-[430px] flex-1 flex-col overflow-hidden bg-gradient-to-br from-[#10233a] via-[#174b58] to-brand-700 px-6 pb-12 pt-[calc(1.75rem+env(safe-area-inset-top))] text-white">
        <div className="pointer-events-none absolute -right-20 top-24 h-64 w-64 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-10 top-32 h-44 w-44 rounded-full border border-white/10" />

        <div className="relative flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-lg font-bold">P</span>
          <span className="text-xl font-bold tracking-tight">Pave</span>
        </div>

        <div className="relative flex flex-1 flex-col items-center justify-center pb-2 pt-8">
          <div className="relative mb-8 flex h-52 w-full max-w-xs items-center justify-center">
            <div className="absolute left-5 top-6 h-36 w-36 rounded-[2rem] bg-white/10 blur-sm" />
            <div className="absolute right-4 top-1 h-40 w-40 rounded-full bg-emerald-300/10" />
            <div className="absolute left-8 top-10 flex h-16 w-16 rotate-[-12deg] items-center justify-center rounded-2xl bg-white/15 shadow-xl backdrop-blur">
              <TrendingUp size={28} />
            </div>
            <div className="absolute right-7 top-12 flex h-14 w-14 rotate-[10deg] items-center justify-center rounded-2xl bg-emerald-300/20 shadow-xl backdrop-blur">
              <Landmark size={25} />
            </div>
            <div className="relative z-10 flex h-28 w-28 items-center justify-center rounded-[2rem] border border-white/20 bg-white/15 shadow-2xl backdrop-blur-md">
              <SlideIcon size={48} strokeWidth={1.6} />
            </div>
            <div className="absolute bottom-4 right-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-300/20 shadow-xl backdrop-blur">
              <PiggyBank size={24} />
            </div>
            <div className="absolute bottom-0 left-9 h-2 w-20 rounded-full bg-emerald-200/50" />
            <div className="absolute bottom-0 left-32 h-2 w-12 rounded-full bg-white/30" />
            <div className="absolute bottom-0 right-5 h-2 w-8 rounded-full bg-white/30" />
          </div>

          <h1 className="max-w-sm text-center text-3xl font-extrabold leading-tight tracking-tight">
            {slide.title}
          </h1>
          <p className="mt-3 max-w-xs text-center text-sm leading-6 text-white/75">{slide.subtitle}</p>

          <div className="mt-6 flex items-center gap-2" aria-label="Welcome highlights">
            {slides.map((item, index) => (
              <button
                key={item.title}
                type="button"
                aria-label={`Show highlight ${index + 1}: ${item.title}`}
                aria-pressed={activeSlide === index}
                onClick={() => setActiveSlide(index)}
                className={`h-1.5 rounded-full transition-all ${activeSlide === index ? "w-9 bg-emerald-300" : "w-5 bg-white/40"}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="relative -mt-7 rounded-t-[2rem] bg-white px-6 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-7 shadow-[0_-12px_36px_rgba(12,30,43,0.12)]">
        <div className="mx-auto mb-6 h-1 w-10 rounded-full bg-slate-200" />
        <p className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">A fresh start with Pave</p>
        <h2 className="mt-2 text-center text-2xl font-bold tracking-tight text-ink">Welcome to a better money routine</h2>
        <p className="mx-auto mt-2 max-w-xs text-center text-sm leading-6 text-slate-500">
          Plan your budget, keep up with bills and make progress on your goals.
        </p>

        <div className="mt-6 space-y-3">
          <Link
            to="/register"
            className="flex items-center justify-center gap-2 rounded-2xl bg-brand-700 py-4 text-sm font-bold text-white shadow-[0_8px_20px_rgba(15,107,74,0.2)] transition active:scale-[0.99]"
          >
            Create an account <ArrowRight size={18} />
          </Link>
          <Link
            to="/login"
            className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-4 text-sm font-bold text-ink transition hover:bg-slate-50"
          >
            I already have an account
          </Link>
        </div>
        <p className="mt-4 text-center text-xs text-slate-400">Your finances, on your terms.</p>
      </section>
    </div>
  );
}