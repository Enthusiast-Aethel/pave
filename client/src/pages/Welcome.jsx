import { Link } from "react-router-dom";
import { ArrowRight, Wallet, TrendingUp, PiggyBank } from "lucide-react";

export default function Welcome() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-gradient-to-b from-sky-100 via-brand-50 to-emerald-100 p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 text-lg font-bold text-white">
          P
        </span>
        <span className="text-xl font-bold text-brand-900">Pave</span>
      </div>

      <div className="mt-8">
        <h1 className="text-4xl font-extrabold leading-tight text-brand-900">
          Take control of your finances
        </h1>
        <p className="mt-3 text-gray-600">
          Plan every shilling, track every spend, reach your goals.
        </p>
      </div>

      {/* Illustration placeholder: swap for the image exported from Stitch (see note below) */}
      <div className="my-8 flex flex-1 items-center justify-center">
        <div className="relative flex h-64 w-full items-center justify-center rounded-3xl bg-white/50">
          <div className="grid grid-cols-3 gap-4">
            {[Wallet, TrendingUp, PiggyBank].map((Icon, i) => (
              <span
                key={i}
                className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-brand-700 shadow-md"
              >
                <Icon size={34} />
              </span>
            ))}
          </div>
        </div>
      </div>

      <Link
        to="/register"
        className="flex items-center justify-center gap-2 rounded-2xl bg-brand-700 py-4 font-bold text-white shadow-lg active:scale-[0.99]"
      >
        Get Started <ArrowRight size={18} />
      </Link>
      <p className="mt-4 pb-2 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-brand-700">
          Sign in
        </Link>
      </p>
    </div>
  );
}