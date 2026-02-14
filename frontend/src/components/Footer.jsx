function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap items-center justify-center gap-6 mb-4">
          <a href="#" className="text-text-dark/70 text-sm hover:text-primary transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="text-text-dark/70 text-sm hover:text-primary transition-colors">
            Terms of Service
          </a>
        </div>
        <p className="text-center text-text-dark/70 text-sm">
          © 2026 Eco Connect. Making sustainability accessible to everyone.
        </p>
        <p className="text-center text-text-dark/50 text-xs mt-2">
          Powered by AI  • Built by <i><u><a href="https://github.com/anshujain0">Anshu</a></u></i>
        </p>
      </div>
    </footer>
  );
}

export default Footer;