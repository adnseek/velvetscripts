"use client";

import { useEffect, useState } from "react";
import CrackRevenue, { CrackRevenueProps } from "./CrackRevenue";

interface CamgirlWidgetProps extends Partial<CrackRevenueProps> {
  theme?: string;
}

const API_KEY = "fd92db2aebc07ffb5d98d8e972986ea8742974b2674fb99073ca8ed306217ef1";
const TOKEN = "a0dd6360-04f8-11f1-ac3a-8f517e0355c5";

export default function CamgirlWidget({
  theme = "default",
  genders = ["f"],
  ages = [],
  ethnicities = [],
  languages = [],
  cols = 4,
  rows = 2,
  number = 8,
  ...rest
}: CamgirlWidgetProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const mobileCols = 2;
  const mobileRows = 3;
  const mobileNumber = 6;

  return (
    <CrackRevenue
      token={TOKEN}
      apiKey={API_KEY}
      genders={genders}
      ages={ages}
      ethnicities={ethnicities}
      languages={languages}
      providers={["bongacash", "cam4", "streamate", "awempire", "xlovecam", "xcams"]}
      cols={isMobile ? mobileCols : cols}
      rows={isMobile ? mobileRows : rows}
      number={isMobile ? mobileNumber : number}
      useFeed={true}
      animateFeed={true}
      smoothAnimation={true}
      animationSpeed={8}
      className="mt-2"
      {...rest}
    />
  );
}
