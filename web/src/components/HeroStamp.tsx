import { motion, useReducedMotion } from "motion/react";
import { Seal } from "./Seal";

/** The one orchestrated moment on load: a seal lands on the headline panel. */
export function HeroStamp() {
  const reduce = useReducedMotion();
  return (
    <motion.span
      className="herostamp"
      aria-hidden="true"
      initial={reduce ? false : { scale: 2.4, opacity: 0, rotate: -26 }}
      animate={{ scale: 1, opacity: 1, rotate: -9 }}
      transition={{ delay: 0.9, type: "spring", stiffness: 380, damping: 17, mass: 0.9 }}
    >
      <Seal size={200} label="" />
    </motion.span>
  );
}
