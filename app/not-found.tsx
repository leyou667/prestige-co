import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="eyebrow">Erreur 404</p>
      <h1 className="mt-4 font-display text-4xl font-light">Cette route n&apos;existe pas.</h1>
      <Link href="/vehicules" className="btn-gold mt-8">Voir la collection</Link>
    </div>
  );
}
