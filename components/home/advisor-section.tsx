import { Advisor } from "./advisor";

/** Le conseiller sort du hero : une section à part, pour ceux qui hésitent. */
export function AdvisorSection() {
  return (
    <section aria-labelledby="conseiller-titre" className="bg-anthracite py-20 md:py-28">
      <div className="container grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-start lg:gap-16">
        <div className="max-w-xl lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
          <h2 id="conseiller-titre" className="font-display text-4xl font-light leading-[1.05] sm:text-5xl">
            Pas sûr de votre choix ?
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted">
            Quatre questions sur votre usage, votre budget et votre trajet : notre conseiller vous propose les véhicules qui vous
            correspondent, avec le prix par jour.
          </p>
        </div>
        <Advisor />
      </div>
    </section>
  );
}
