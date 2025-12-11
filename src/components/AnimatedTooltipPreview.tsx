"use client";
import React from "react";
import { AnimatedTooltip } from "./ui/animated-tooltip";

const people = [
  {
    id: 1,
    name: "Aditi",
    designation: "Master in German, JNU",
    image:
      "/t1.png",
  },
  {
    id: 2,
    name: "Alka Mishra",
    designation: "M.Sc. (Math), B.Ed",
    image:
      "/t2.png",
  },
  {
    id: 3,
    name: "Aatika Khan",
    designation: "Spanish C1",
    image:
      "/t3.png",
  },
  {
    id: 4,
    name: "Manan Negi",
    designation: "Trinity rock and pop grade 5",
    image:
      "/t4.png",
  },
  {
    id: 5,
    name: "Amit",
    designation: "Btech, DTU",
    image:
      "/t5.png",
  },
  {
    id: 6,
    name: "Gowtham",
    designation: "MCA in AI",
    image:
      "/t6.png",
  },
];

export function AnimatedTooltipPreview() {
  return (
    <>
      <AnimatedTooltip items={people} />
    </>
  );
}