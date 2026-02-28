import React from 'react';
import { motion } from 'motion/react';
import { Wind, ArrowUp, RotateCw, Activity, Plane, AlertTriangle, Calculator, BrainCircuit } from 'lucide-react';

export default function Learn() {
  return (
    <div className="container max-w-6xl py-10 px-4 md:px-8 overflow-y-auto">
      <div className="flex flex-col space-y-4 mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Advanced Aerodynamics & Physics</h1>
        <p className="text-xl text-muted-foreground">
          A rigorous, research-grade exploration of the mathematical and physical principles of UAV flight.
        </p>
      </div>

      {/* Mathematical Models */}
      <div className="mb-16 bg-card border border-border/50 rounded-3xl p-8 shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Calculator className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-3xl font-bold">Mathematical Models of Flight</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-accent mb-3">Thrust Generation (Momentum Theory)</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              A propeller generates thrust by accelerating a mass of air downwards. According to Newtonian mechanics and actuator disk theory, the thrust <code className="text-primary bg-primary/10 px-1 rounded">T</code> is proportional to the air density <code className="text-primary bg-primary/10 px-1 rounded">ρ</code>, the rotational speed <code className="text-primary bg-primary/10 px-1 rounded">n</code> squared, and the propeller diameter <code className="text-primary bg-primary/10 px-1 rounded">D</code> to the fourth power.
            </p>
            <div className="bg-[#1e1e1e] p-4 rounded-xl font-mono text-emerald-400 text-center text-lg border border-border">
              T = C_T · ρ · n² · D⁴
            </div>
            <p className="text-xs text-muted-foreground mt-2">Where C_T is the thrust coefficient specific to the propeller's airfoil geometry.</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-emerald-500 mb-3">The PID Control Loop</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Drones are inherently aerodynamically unstable. They rely on a PID (Proportional-Integral-Derivative) controller running at 4kHz-8kHz to stay airborne. The controller calculates the error <code className="text-primary bg-primary/10 px-1 rounded">e(t)</code> between the desired angle and the actual angle measured by the gyroscope.
            </p>
            <div className="bg-[#1e1e1e] p-4 rounded-xl font-mono text-emerald-400 text-center text-sm border border-border">
              u(t) = K_p·e(t) + K_i·∫e(t)dt + K_d·(de/dt)
            </div>
            <ul className="text-xs text-muted-foreground mt-3 space-y-1 list-disc pl-4">
              <li><strong>Proportional (P):</strong> Reacts to present error. Too high = rapid oscillations.</li>
              <li><strong>Integral (I):</strong> Accumulates past error. Fights steady forces like wind or off-center gravity.</li>
              <li><strong>Derivative (D):</strong> Predicts future error based on rate of change. Dampens the P-term to prevent overshoot.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-start mb-16">
        <div>
          <h2 className="text-3xl font-bold mb-6">Kinematics & Control</h2>
          <div className="space-y-6">
            <div className="border-l-2 border-primary pl-4">
              <h4 className="text-lg font-semibold">Hovering & Throttle Resolution</h4>
              <p className="text-muted-foreground text-sm">To hover, the sum of the thrust vectors from all 4 motors must exactly equal the gravitational force vector (mg). The ESCs use high-frequency PWM or DShot protocols to adjust motor RPM with 11-bit to 16-bit resolution, allowing micro-adjustments to maintain a perfect hover.</p>
            </div>
            <div className="border-l-2 border-accent pl-4">
              <h4 className="text-lg font-semibold">Pitch & Roll (Translational Movement)</h4>
              <p className="text-muted-foreground text-sm">By increasing the RPM of the rear motors and decreasing the front, the drone pitches forward. The total thrust vector tilts. The vertical component of thrust keeps the drone in the air, while the horizontal component accelerates it forward. (T_vertical = T * cos(θ), T_horizontal = T * sin(θ)).</p>
            </div>
            <div className="border-l-2 border-orange-500 pl-4">
              <h4 className="text-lg font-semibold">Yaw & Gyroscopic Precession</h4>
              <p className="text-muted-foreground text-sm">Yaw is controlled by torque imbalance. Because two motors spin CW and two CCW, increasing the speed of the CW motors while decreasing the CCW motors keeps total thrust constant but creates a net rotational torque. Advanced flight controllers also account for gyroscopic precession—the phenomenon where a force applied to a spinning rotor manifests 90 degrees later in the rotation.</p>
            </div>
          </div>
        </div>
        
        <div className="bg-secondary/20 rounded-2xl p-8 border border-border/50">
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Wind className="text-primary" /> Advanced Aerodynamic Phenomena
          </h3>
          
          <div className="space-y-6">
            <div className="bg-card p-5 rounded-xl border border-border">
              <h4 className="font-bold text-emerald-500 mb-2">Vortex Ring State (VRS)</h4>
              <p className="text-sm text-muted-foreground">Also known as "settling with power." If a drone descends too quickly vertically, it falls into its own downwash. The air recirculates around the propeller tips, creating a toroidal vortex. The propellers lose grip on the air, thrust drops to near zero, and the drone falls out of the sky regardless of throttle input. <strong>Recovery:</strong> Pitch forward or roll sideways to escape the turbulent column of air.</p>
            </div>
            
            <div className="bg-card p-5 rounded-xl border border-border">
              <h4 className="font-bold text-blue-500 mb-2">Ground Effect</h4>
              <p className="text-sm text-muted-foreground">When hovering within one rotor diameter of the ground, the downwash hits the surface and creates a high-pressure cushion. This increases aerodynamic efficiency, requiring less power to hover, but also introduces turbulence that can cause the drone to wobble unpredictably.</p>
            </div>

            <div className="bg-red-500/10 p-5 rounded-xl border border-red-500/20">
              <h4 className="font-bold text-red-500 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Propeller Configuration Physics
              </h4>
              <p className="text-sm text-red-200/80">
                A quadcopter MUST have diagonal pairs spinning in opposite directions to cancel reactive torque. If you reverse this (e.g., put CW props on CCW motors), the airfoil pushes air UP instead of DOWN. The drone will instantly flip and crash. If all motors spun the same direction, the un-canceled torque would cause the drone to spin uncontrollably on its yaw axis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
