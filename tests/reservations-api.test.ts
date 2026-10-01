import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/reservations/route";
import { addDays, parseISODate, toISODate, todayISO } from "@/lib/utils";

const day = (n: number) => toISODate(addDays(parseISODate(todayISO())!, n));
let ip = 0;
function req(body: unknown, headers: Record<string, string> = {}) {
  const raw = typeof body === "string" ? body : JSON.stringify(body);
  return new Request("http://localhost:3000/api/reservations", {
    method: "POST",
    // IP différente à chaque requête : le limiteur de débit ne fausse pas les tests
    headers: { "content-type": "application/json", host: "localhost:3000", "x-real-ip": `10.0.0.${++ip}`, ...headers },
    body: raw,
  });
}
const valid = { vehicleId: "bmw-x2", city: "bruxelles", from: day(3), to: day(5), acceptedTerms: true, options: ["livraison"] };

describe("POST /api/reservations", () => {
  it("accepte une demande valide (Google Calendar non configuré)", async () => {
    const res = await POST(req(valid));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, synced: false });
  });

  it("refuse un corps non JSON ou un mauvais Content-Type", async () => {
    expect((await POST(req(valid, { "content-type": "text/plain" }))).status).toBe(415);
    expect((await POST(req("pas du json"))).status).toBe(400);
    expect((await POST(req("[]"))).status).toBe(400);
  });

  it("refuse une origine tierce", async () => {
    expect((await POST(req(valid, { origin: "https://site-malveillant.example" }))).status).toBe(403);
  });

  it("refuse un formulaire vide ou incomplet", async () => {
    expect((await POST(req({}))).status).toBe(400);
    expect((await POST(req({ ...valid, acceptedTerms: false }))).status).toBe(400);
    expect((await POST(req({ ...valid, vehicleId: "inconnu" }))).status).toBe(400);
  });

  it("refuse les dates invalides, passées, trop lointaines ou trop longues", async () => {
    expect((await POST(req({ ...valid, from: "2027-02-30", to: "2027-03-02" }))).status).toBe(400);
    expect((await POST(req({ ...valid, from: day(-2), to: day(1) }))).status).toBe(400);
    expect((await POST(req({ ...valid, from: day(5), to: day(3) }))).status).toBe(400);
    expect((await POST(req({ ...valid, to: "9999-12-31" }))).status).toBe(400);
    expect((await POST(req({ ...valid, from: day(1), to: day(90) }))).status).toBe(400);
  });

  it("refuse une ville où le véhicule n'est pas livrable", async () => {
    expect((await POST(req({ ...valid, vehicleId: "renault-twingo", city: "paris" }))).status).toBe(400);
  });

  it("refuse un téléphone ou un e-mail mal formés", async () => {
    expect((await POST(req({ ...valid, phone: "abc" }))).status).toBe(400);
    expect((await POST(req({ ...valid, email: "pas-un-email" }))).status).toBe(400);
  });

  it("ignore silencieusement les robots (champ piège)", async () => {
    const res = await POST(req({ ...valid, website: "http://spam.example" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, synced: false });
  });

  it("refuse un corps trop volumineux", async () => {
    expect((await POST(req({ ...valid, name: "x".repeat(20_000) }))).status).toBe(413);
  });

  it("limite le débit par IP", async () => {
    const h = { "x-real-ip": "10.9.9.9" };
    const codes = [];
    for (let i = 0; i < 6; i++) codes.push((await POST(req(valid, h))).status);
    expect(codes.slice(0, 5).every((c) => c === 200)).toBe(true);
    expect(codes[5]).toBe(429);
  });
});
