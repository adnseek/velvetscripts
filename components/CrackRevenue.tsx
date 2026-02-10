"use client";

import { useEffect, useRef, useMemo } from "react";

export interface CrackRevenueProps {
  // Filter
  genders?: string[];
  ages?: string[];
  ethnicities?: string[];
  languages?: string[];
  providers?: string[];
  categories?: string[];
  tags?: string[];

  // Layout
  cols?: number;
  rows?: number;
  number?: number;
  ratio?: number;
  containerAlignment?: "center" | "";
  verticalSpace?: string;
  horizontalSpace?: string;
  thumbsWidth?: string;
  thumbsHeight?: string;
  iframeWidth?: string;
  iframeHeight?: string;

  // Appearance
  skin?: string;
  background?: string;
  fontSize?: string;
  fontFamily?: string;
  cardsBorderRadius?: string;
  cardsBorderColor?: string;
  thumbsBorderRadius?: string;
  colorFilter?: number;
  colorFilterStrength?: number;

  // CTA
  ctaContent?: string;
  ctaBackground?: string;
  ctaColor?: string;
  ctaBorderRadius?: string;
  ctaFontSize?: string;

  // Animation & Feed
  useFeed?: boolean;
  animateFeed?: boolean;
  smoothAnimation?: boolean;
  animationSpeed?: number;

  // Miscellaneous
  lang?: string;
  showOnline?: boolean;
  muted?: boolean;
  auxiliaryCSS?: string;

  // Auth
  token: string;
  apiKey: string;
  landingId?: string;

  // Styling
  className?: string;
}

const DEFAULT_PROVIDERS = [
  "bongacash",
  "cam4",
  "streamate",
  "awempire",
  "xlovecam",
  "xcams",
];

export default function CrackRevenue({
  genders = ["f"],
  ages = [],
  ethnicities = [],
  languages = [],
  providers = DEFAULT_PROVIDERS,
  categories = [],
  tags = [],
  cols = 4,
  rows = 1,
  number = 4,
  ratio = 1,
  containerAlignment = "center",
  verticalSpace = "10px",
  horizontalSpace = "10px",
  thumbsWidth = "",
  thumbsHeight = "",
  iframeWidth = "",
  iframeHeight = "",
  skin = "1",
  background = "transparent",
  fontSize = "",
  fontFamily = "",
  cardsBorderRadius = "",
  cardsBorderColor = "",
  thumbsBorderRadius = "",
  colorFilter = 0,
  colorFilterStrength = 0,
  ctaContent = "",
  ctaBackground = "",
  ctaColor = "",
  ctaBorderRadius = "",
  ctaFontSize = "",
  useFeed = true,
  animateFeed = true,
  smoothAnimation = true,
  animationSpeed,
  lang = "en",
  showOnline,
  muted,
  auxiliaryCSS = "",
  token,
  apiKey,
  landingId = "%7Boffer_url_id%7D",
  className = "",
}: CrackRevenueProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const scriptUrl = useMemo(() => {
    const params = new URLSearchParams();

    params.set("landing_id", landingId);
    if (genders.length) params.set("genders", genders.join(","));
    if (ages.length) params.set("ages", ages.join(","));
    if (ethnicities.length) params.set("ethnicities", ethnicities.join(","));
    if (languages.length) params.set("languages", languages.join(","));
    if (providers.length) params.set("providers", providers.join(","));
    if (categories.length) params.set("categories", categories.join(","));
    if (tags.length) params.set("tags", tags.join(","));

    params.set("skin", skin);
    params.set("containerAlignment", containerAlignment);
    params.set("cols", String(cols));
    params.set("rows", String(rows));
    params.set("number", String(number));
    params.set("background", background);
    params.set("useFeed", useFeed ? "1" : "0");
    params.set("animateFeed", animateFeed ? "1" : "0");
    params.set("smoothAnimation", smoothAnimation ? "1" : "0");
    params.set("ratio", String(ratio));
    params.set("verticalSpace", verticalSpace);
    params.set("horizontalSpace", horizontalSpace);
    params.set("colorFilter", String(colorFilter));
    params.set("colorFilterStrength", String(colorFilterStrength));

    if (thumbsWidth) params.set("thumbsWidth", thumbsWidth);
    if (thumbsHeight) params.set("thumbsHeight", thumbsHeight);
    if (iframeWidth) params.set("iframeWidth", iframeWidth);
    if (iframeHeight) params.set("iframeHeight", iframeHeight);
    if (fontSize) params.set("fontSize", fontSize);
    if (fontFamily) params.set("fontFamily", fontFamily);
    if (cardsBorderRadius) params.set("cardsBorderRadius", cardsBorderRadius);
    if (cardsBorderColor) params.set("cardsBorderColor", cardsBorderColor);
    if (thumbsBorderRadius) params.set("thumbsBorderRadius", thumbsBorderRadius);
    if (ctaContent) params.set("CTAContent", ctaContent);
    if (ctaBackground) params.set("CTABackground", ctaBackground);
    if (ctaColor) params.set("CTAColor", ctaColor);
    if (ctaBorderRadius) params.set("CTABorderRadius", ctaBorderRadius);
    if (ctaFontSize) params.set("CTAFontSize", ctaFontSize);
    if (animationSpeed !== undefined) params.set("animationSpeed", String(animationSpeed));
    if (showOnline !== undefined) params.set("showOnline", showOnline ? "1" : "0");
    if (muted !== undefined) params.set("muted", muted ? "1" : "0");
    if (auxiliaryCSS) params.set("AuxiliaryCSS", auxiliaryCSS);

    params.set("lang", lang);
    params.set("token", token);
    params.set("api_key", apiKey);

    return `https://crxcr2.com/cams-widget-ext/script?${params.toString()}`;
  }, [
    genders, ages, ethnicities, languages, providers, categories, tags,
    cols, rows, number, ratio, containerAlignment, verticalSpace, horizontalSpace,
    thumbsWidth, thumbsHeight, iframeWidth, iframeHeight,
    skin, background, fontSize, fontFamily, cardsBorderRadius, cardsBorderColor,
    thumbsBorderRadius, colorFilter, colorFilterStrength,
    ctaContent, ctaBackground, ctaColor, ctaBorderRadius, ctaFontSize,
    useFeed, animateFeed, smoothAnimation, animationSpeed,
    lang, showOnline, muted, auxiliaryCSS, token, apiKey, landingId,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear previous content on re-render
    container.innerHTML = "";

    // Track intervals created by the external script so we can clean them up
    const origSetInterval = window.setInterval;
    const createdIntervals: ReturnType<typeof setInterval>[] = [];
    (window as any).setInterval = function (...args: any[]) {
      const id = origSetInterval.apply(window, args as any);
      createdIntervals.push(id);
      return id;
    };

    const script = document.createElement("script");
    script.src = `${scriptUrl}&_t=${Date.now()}`;
    script.async = true;
    container.appendChild(script);

    // Restore original setInterval after script loads
    script.onload = () => {
      window.setInterval = origSetInterval;
    };

    return () => {
      window.setInterval = origSetInterval;
      createdIntervals.forEach((id) => clearInterval(id));
      container.innerHTML = "";
    };
  }, [scriptUrl]);

  return <div ref={containerRef} className={className} />;
}
