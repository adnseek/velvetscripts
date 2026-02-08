"use client";

import CrackRevenue, { CrackRevenueProps } from "./CrackRevenue";

interface CamgirlWidgetProps extends Partial<CrackRevenueProps> {
  theme?: string;
}

const API_KEY = "fd92db2aebc07ffb5d98d8e972986ea8742974b2674fb99073ca8ed306217ef1";
const TOKEN = "a0dd6360-04f8-11f1-ac3a-8f517e0355c5";

export default function CamgirlWidget({
  theme = "default",
  genders = ["f", "f"],
  ages = ["gc_50_plus"],
  ethnicities = [],
  languages = ["langdeutsch"],
  cols = 4,
  rows = 1,
  number = 4,
  ...rest
}: CamgirlWidgetProps) {
  return (
    <CrackRevenue
      token={TOKEN}
      apiKey={API_KEY}
      genders={genders}
      ages={ages}
      ethnicities={ethnicities}
      languages={languages}
      cols={cols}
      rows={rows}
      number={number}
      className="mt-2"
      {...rest}
    />
  );
}
