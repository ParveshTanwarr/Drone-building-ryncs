import React from 'react';
import { motion } from 'motion/react';
import { Plane, Package, Zap, Target, Shield, Camera } from 'lucide-react';

const types = [
  {
    name: "Quadcopters",
    icon: Target,
    desc: "The most common type. Uses 4 rotors. Excellent balance of lift, maneuverability, and mechanical simplicity.",
    physics: "Relies entirely on varying motor speeds for all control (pitch, roll, yaw, throttle)."
  },
  {
    name: "Hexacopters & Octocopters",
    icon: Package,
    desc: "6 or 8 rotors. Used for heavy lifting (cinema cameras, agriculture) and redundancy.",
    physics: "Can survive a motor failure. Generates more lift but consumes more power and is less agile."
  },
  {
    name: "Fixed-Wing Drones",
    icon: Plane,
    desc: "Looks like a traditional airplane. Used for mapping, surveying, and long-range missions.",
    physics: "Uses forward thrust and wings to generate lift. Much more efficient than multirotors but cannot hover."
  },
  {
    name: "VTOL (Vertical Take-Off & Landing)",
    icon: Zap,
    desc: "Combines multirotor hovering with fixed-wing forward flight efficiency.",
    physics: "Takes off like a quadcopter, then transitions to forward flight using wings for lift."
  },
  {
    name: "Racing / FPV Drones",
    icon: Camera,
    desc: "Built for extreme speed and agility. Flown manually via video goggles.",
    physics: "High thrust-to-weight ratio (>10:1). Minimal drag profile. Capable of 100+ mph."
  },
  {
    name: "Military / Industrial UAVs",
    icon: Shield,
    desc: "Large-scale systems for surveillance, inspection, or defense.",
    physics: "Often use combustion engines or hybrid power systems for extreme endurance."
  }
];

export default function Types() {
  return (
    <div className="container max-w-6xl py-10 px-4 md:px-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Types of Drones</h1>
        <p className="text-xl text-muted-foreground">
          Explore the different architectures and their specific use cases.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {types.map((type, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 hover:border-primary/50 transition-colors"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <type.icon className="w-24 h-24 text-primary" />
            </div>
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-6">
                <type.icon className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-3">{type.name}</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {type.desc}
              </p>
              
              <div className="bg-secondary/50 rounded-xl p-4 border border-border/50">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Physics & Mechanics</h4>
                <p className="text-sm text-foreground/80">{type.physics}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
