"use client";

import { useState } from "react";

export function SeedCalculator() {
  const [area, setArea] = useState("2");
  const squareMetres = Number(area);
  const valid = area.trim() !== "" && Number.isFinite(squareMetres) && squareMetres >= 1 && squareMetres <= 100;

  return <section className="calculator" data-conversion-blocker="interactive-seed-estimate">
    <h2>Estimate your seeds</h2>
    <p>Allow 25 seeds per square metre, plus a 20% reserve.</p>
    <label htmlFor="bed-area">Garden bed area in square metres</label>
    <input id="bed-area" type="number" min="1" max="100" step="any" value={area}
      onChange={(event) => setArea(event.target.value)} aria-describedby="seed-estimate" />
    <output id="seed-estimate" htmlFor="bed-area" aria-live="polite">
      {valid ? `${Math.ceil(squareMetres * 25 * 1.2)} seeds, including the reserve.` : "Enter an area between 1 and 100 square metres."}
    </output>
  </section>;
}
