import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-stone-100 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand */}
        <div className="flex flex-col gap-3">
          <span className="font-extrabold text-xl text-brand-orange">Finding Nami</span>
          <p className="text-sm text-stone-500 leading-relaxed">
            Helping Filipina professionals find remote work, find community, and find themselves.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">Links</p>
          <Link href="/" className="text-sm text-stone-500 hover:text-stone-800 transition-colors">Home</Link>
          <Link href="/about" className="text-sm text-stone-500 hover:text-stone-800 transition-colors">About</Link>
          <Link href="/login" className="text-sm text-stone-500 hover:text-stone-800 transition-colors">Sign in</Link>
          <Link href="/signup" className="text-sm text-stone-500 hover:text-stone-800 transition-colors">Join free</Link>
        </div>

        {/* Social */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">Follow us</p>
          <div className="flex gap-4">
            {/* LinkedIn */}
            <a
              href="https://linkedin.com/company/findingnami"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-stone-400 hover:text-brand-orange transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            {/* Facebook */}
            <a
              href="https://facebook.com/findingnami"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-stone-400 hover:text-brand-orange transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-stone-100 py-5 text-center">
        <p className="text-xs text-stone-400">© 2026 Finding Nami. A social enterprise.</p>
      </div>
    </footer>
  );
}
