import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/section-heading";
import { CAUTION_TEXT } from "@/lib/categories";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Conditions générales de location",
  description: "Conditions générales de location PRESTIGE CONCIERGERIE : âge minimum, ancienneté du permis, caution, réservation et restitution.",
  alternates: { canonical: "/conditions-generales" },
};

const SECTIONS = [
  {
    title: "1. Conducteur",
    body: [
      "Catégories D, C, B, U et A : conducteur âgé de 21 ans minimum et titulaire du permis B depuis 3 ans minimum.",
      "Catégories S et S+ : conducteur âgé de 23 ans minimum et titulaire du permis B depuis 5 ans minimum.",
      "Une pièce d'identité et un permis de conduire en cours de validité sont exigés à la remise du véhicule.",
    ],
  },
  {
    title: "2. Caution",
    body: [`Montant de la caution : ${CAUTION_TEXT.toLowerCase()}. Elle est restituée après contrôle du véhicule au retour.`],
  },
  {
    title: "3. Réservation et tarifs",
    body: [
      "Les devis générés sur le site sont estimatifs. La réservation est définitive après confirmation écrite de PRESTIGE CONCIERGERIE (WhatsApp ou e-mail).",
      "Le prix de la location est calculé par journée de 24 heures. Les options sont facturées selon les tarifs indiqués lors de la demande.",
    ],
  },
  {
    title: "4. Utilisation du véhicule",
    body: [
      "Le véhicule doit être utilisé en bon père de famille, conformément au code de la route. Il est interdit de fumer à bord.",
      "Toute sortie du territoire (Belgique, France) doit être signalée à l'avance.",
    ],
  },
  {
    title: "5. Restitution",
    body: [
      "Le véhicule est restitué à la date, à l'heure et au lieu convenus, dans l'état de propreté et avec le niveau de carburant ou de charge constatés au départ.",
    ],
  },
  {
    title: "6. Assurance et sinistre",
    body: ["Le véhicule est assuré. Une franchise peut s'appliquer en cas de sinistre responsable ; elle est précisée lors de la confirmation."],
  },
];

export default function CGPage() {
  return (
    <div className="container page-top pb-24"><div className="max-w-3xl">
      <SectionHeading as="h1" eyebrow="Informations légales" title="Conditions générales de location">
        Document type à valider et compléter par {SITE.name}.
      </SectionHeading>
      <div className="mt-12 space-y-10">
        {SECTIONS.map((s) => (
          <section key={s.title}>
            <h2 className="title-luxe text-sm text-subtle">{s.title}</h2>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
              {s.body.map((b) => (
                <p key={b}>{b}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
      </div>
    </div>
  );
}
