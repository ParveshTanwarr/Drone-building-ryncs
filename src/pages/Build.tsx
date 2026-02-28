import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Circle, Cpu, Zap, Beaker, Wrench } from 'lucide-react';
import { cn } from '../lib/utils';

const steps = [
  {
    title: "Frame Assembly & Materials Science",
    desc: "Modern UAV frames utilize Carbon Fiber Reinforced Polymer (CFRP). The layup process involves layering woven carbon sheets with epoxy resin, cured under heat and pressure. This provides an exceptional stiffness-to-weight ratio. When assembling, ensure the weave direction aligns with the primary stress vectors. Use medium-strength threadlocker (anaerobic adhesive) on metal-to-metal fasteners to prevent vibrational loosening caused by motor harmonics.",
    status: "done"
  },
  {
    title: "Motor Mounting & Resonance",
    desc: "Mounting BLDC (Brushless DC) motors requires precise torque. Over-tightening crushes the carbon fiber matrix; under-tightening leads to catastrophic vibrational resonance. Ensure the mounting screws do not penetrate the motor stator windings, which would cause an immediate phase-to-ground short circuit.",
    status: "done"
  },
  {
    title: "ESC & PDB: Engineering Deep Dive",
    desc: "The Power Distribution Board (PDB) and Electronic Speed Controller (ESC) are the cardiovascular system of the drone. \n\nWhat they do: The PDB takes the high-current DC from the LiPo battery and distributes it. The ESC takes this DC and uses a microcontroller (like an STM32) to rapidly switch banks of MOSFETs (Metal-Oxide-Semiconductor Field-Effect Transistors). This converts the DC into 3-phase AC to drive the brushless motors. The ESC reads the back-EMF (Electromotive Force) from the unpowered motor phase to determine the rotor's exact position, allowing sensorless commutation.\n\nManufacturing: These are multi-layer Printed Circuit Boards (PCBs), typically 4 to 6 layers, utilizing 2oz or 3oz copper thickness to handle extreme currents (often 30A-60A per motor). They are manufactured using photolithography, etching, and automated Pick-and-Place machines for SMD (Surface Mount Device) components, then baked in a reflow oven.\n\nAlternative Uses: Because an ESC is simply a high-power BLDC motor driver, you can flash custom firmware (like AM32 or BLHeli) to use drone ESCs in electric skateboards, underwater ROV thrusters, CNC spindle motors, or custom robotics.",
    status: "current"
  },
  {
    title: "Research-Grade Soldering Techniques",
    desc: "Aerospace-grade soldering requires eutectic solder (like Sn63/Pb37), which transitions instantly from liquid to solid, preventing 'cold joints' caused by movement during cooling. Use a high-quality flux (rosin or no-clean) to chemically reduce oxidation on the copper pads. For high-thermal-mass components (like the main XT60 battery leads on the PDB), use a high-wattage iron (70W+) with a large chisel tip to transfer heat rapidly without delaminating the PCB pads.",
    status: "upcoming"
  },
  {
    title: "Flight Controller (FC) Integration",
    desc: "The FC must be soft-mounted using silicone grommets or conformal polyurethane standoffs. This acts as a mechanical low-pass filter, preventing high-frequency motor vibrations from aliasing into the MEMS gyroscope's sampling rate. Connect the ESC to the FC using a digital protocol like DShot600, which sends discrete digital throttle values rather than analog PWM, eliminating signal jitter.",
    status: "upcoming"
  },
  {
    title: "Firmware & PID Tuning",
    desc: "Flash a Real-Time Operating System (RTOS) based firmware like Betaflight or ArduPilot. The core of the flight code is the PID (Proportional-Integral-Derivative) controller. You must tune the P-gain (immediate reaction to error), I-gain (accumulation of past error to fight wind/gravity), and D-gain (prediction of future error to dampen oscillations).",
    status: "upcoming"
  }
];

export default function Build() {
  return (
    <div className="container max-w-5xl py-10 px-4 md:px-8 overflow-y-auto">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Research-Grade Build Guide</h1>
        <p className="text-xl text-muted-foreground">
          A PhD-level deep dive into the materials, electronics, and assembly of UAV systems.
        </p>
      </div>

      <div className="relative border-l border-border/50 ml-4 md:ml-8 space-y-12 pb-8">
        {steps.map((step, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative pl-8 md:pl-12"
          >
            {/* Timeline dot */}
            <div className="absolute -left-3.5 top-1 bg-background">
              {step.status === 'done' ? (
                <CheckCircle2 className="w-7 h-7 text-emerald-500 bg-background" />
              ) : step.status === 'current' ? (
                <div className="w-7 h-7 rounded-full border-2 border-primary flex items-center justify-center bg-background">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                </div>
              ) : (
                <Circle className="w-7 h-7 text-muted-foreground bg-background" />
              )}
            </div>

            <div className={cn(
              "p-6 md:p-8 rounded-2xl border transition-colors",
              step.status === 'current' 
                ? "border-primary/50 bg-primary/5 shadow-[0_0_30px_-10px_rgba(6,182,212,0.3)]" 
                : "border-border/50 bg-card hover:border-border"
            )}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={cn(
                  "text-2xl font-bold",
                  step.status === 'current' ? "text-primary" : "text-foreground"
                )}>
                  Phase {i + 1}: {step.title}
                </h3>
                {step.status === 'current' && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/20 text-primary uppercase tracking-wider">Active Phase</span>
                )}
              </div>
              <div className="text-muted-foreground leading-relaxed space-y-4 whitespace-pre-line text-sm md:text-base">
                {step.desc}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Deep Dive Section */}
      <div className="mt-16 grid md:grid-cols-2 gap-8">
        <div className="bg-secondary/30 border border-border/50 p-8 rounded-3xl">
          <Cpu className="w-10 h-10 text-accent mb-4" />
          <h3 className="text-2xl font-bold mb-4">Custom PCB Manufacturing</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Want to build your own ESC or Flight Controller? You start with EDA (Electronic Design Automation) software like KiCad or Altium Designer. You design the schematic, routing high-speed differential pairs for USB and thick copper polygons for high-current motor traces. You export Gerber files and send them to a fab house (like JLCPCB). They use photolithography to etch the copper, apply solder mask, and use automated machines to place microscopic 0402-sized resistors and STM32 microcontrollers before baking the board in a reflow oven.
          </p>
        </div>
        <div className="bg-secondary/30 border border-border/50 p-8 rounded-3xl">
          <Beaker className="w-10 h-10 text-emerald-500 mb-4" />
          <h3 className="text-2xl font-bold mb-4">Flux & Solder Chemistry</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Soldering isn't just melting metal; it's a chemical reaction. Copper instantly oxidizes in the presence of air, preventing solder from bonding. Flux is an acidic compound (often rosin-based) that becomes active when heated. It boils off the oxide layer, exposing pure copper. The solder (an alloy of Tin and Lead/Silver) then forms an intermetallic bond with the copper at the molecular level. Without flux, you get a "cold joint"—a brittle, highly resistive connection that will fail mid-flight.
          </p>
        </div>
      </div>
    </div>
  );
}
