export function Footer() {
  return (
    <footer className="border-t border-light-gray py-12 mt-24">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-6">
        <p className="text-sm text-medium-gray">© 2026 AutoCare. Precision in every service.</p>
        <div className="flex gap-6 label-uppercase text-medium-gray">
          <span>Terms</span>
          <span>Privacy</span>
          <span>Contact</span>
        </div>
      </div>
    </footer>
  );
}