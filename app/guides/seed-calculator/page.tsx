import { GardenImage, PublicationPage } from "../../components/publication";
import { SeedCalculator } from "../../components/seed-calculator";
import { pageMetadata, publications } from "../../publications";

export const metadata = pageMetadata(publications.calculator);

export default function CalculatorGuide() {
  return <PublicationPage publication={publications.calculator}>
    <p>Use this estimate when packing seeds for a garden bed. It assumes 25 seeds per square metre and adds a 20% reserve.</p>
    <SeedCalculator />
    <p>The estimate changes when you change the area. Check the seed packet for the spacing required by your variety.</p>
    <GardenImage />
  </PublicationPage>;
}
