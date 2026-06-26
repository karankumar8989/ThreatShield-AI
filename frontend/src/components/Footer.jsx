export default function Footer() {
  return (
    <footer className="mt-auto py-4 px-6 border-t border-white/5 text-center">
      <p className="text-xs text-slate-500">
        &copy; {new Date().getFullYear()} ThreatShield AI. Enterprise Cyber Security Platform.
      </p>
    </footer>
  );
}
