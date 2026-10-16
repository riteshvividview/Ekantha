import { useMemo } from "react";

import {
  splitTypographyProps,
  usePageTypography,
  type PageTypographyProps,
} from "./pageTypography";
import { LandingPageFrame, type LandingPageProps } from "./LandingPageFrame";
export { LandingPageFrame, applyBackgroundPresentation } from "./LandingPageFrame";
export type { LandingPageFrameProps, LandingPageProps } from "./LandingPageFrame";
import { SYLVA_TYPOGRAPHY } from "./pageRecipes";

export const SYLVA_HERO_VARIANTS = ["living-green", "sakura-sunset", "maple-autumn", "sequoia-mist"] as const;
export type SylvaHeroVariant = (typeof SYLVA_HERO_VARIANTS)[number];

export type SylvaHeroProps = LandingPageProps &
  PageTypographyProps & {
    variant?: SylvaHeroVariant;
    headingFont?: string;
    bodyFont?: string;
    headingWeight?: string;
    bodyWeight?: string;
    primaryColor?: string;
    headingSize?: number;
    bodySize?: number;
    headingLetterSpacing?: number;
    sourceUrl?: string;
    srcDoc?: string;
  };

const SYLVA_HERO_BASE_URL = "/landing-pages/inner-green-3d.html";

const SYLVA_HERO_TITLES: Record<SylvaHeroVariant, string> = {
  "living-green": "Vana Ekantha — Guest Stories",
  "sakura-sunset": "Sylva — Sakura Sunset",
  "maple-autumn": "Sylva — Maple Autumn",
  "sequoia-mist": "Sylva — Sequoia Mist",
};

export function SylvaHero({
  variant = "living-green",
  sourceUrl = SYLVA_HERO_BASE_URL,
  srcDoc,
  ...props
}: SylvaHeroProps) {
  const safeVariant = SYLVA_HERO_VARIANTS.includes(variant) ? variant : "living-green";
  const [type, frame] = splitTypographyProps(props);
  const customization = usePageTypography(SYLVA_TYPOGRAPHY, type);

  return (
    <LandingPageFrame
      {...frame}
      key={safeVariant}
      customization={customization}
      title={SYLVA_HERO_TITLES[safeVariant]}
      sourceUrl={sourceUrl}
      srcDoc={srcDoc}
    />
  );
}
