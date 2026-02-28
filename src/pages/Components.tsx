import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Battery, Radio, Camera, Zap, Compass, Navigation, Layers, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

const components = [
  {
    id: 'motors',
    name: 'BLDC Motors (Brushless DC)',
    icon: Zap,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    description: 'The electromechanical actuators of the drone. They convert electrical energy into rotational kinetic energy with extremely high efficiency (>85%).',
    details: 'Unlike brushed motors, BLDC motors have no physical contacts (brushes) to wear out. The stator consists of silicon-steel laminations (to reduce eddy currents) wrapped in copper wire electromagnets. The rotor contains powerful Neodymium (N52 grade) permanent magnets. The KV rating defines RPM per Volt. High KV (e.g., 2700KV) means high speed for small props; Low KV (e.g., 900KV) means high torque for large props.',
    mistakes: 'Using mounting screws that are too long. They will touch the copper stator windings, stripping the enamel insulation and causing a phase-to-ground short circuit, instantly destroying the motor and ESC.',
  },
  {
    id: 'esc',
    name: 'Electronic Speed Controllers (ESCs)',
    icon: Cpu,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    description: 'The power electronics module that translates digital throttle signals into 3-phase alternating current.',
    details: 'ESCs use a dedicated 32-bit ARM Cortex MCU. They read the throttle signal (via DShot protocol) and use Gate Drivers to rapidly switch banks of N-channel MOSFETs. This creates a rotating magnetic field in the motor stator. Advanced ESCs use Field Oriented Control (FOC) or BLHeli_32 firmware to monitor Back-EMF, determining the exact rotor angle thousands of times per second to optimize commutation timing.',
    mistakes: 'Failing to add a Low-ESR (Equivalent Series Resistance) Capacitor to the battery input. Without it, voltage spikes from active braking (regenerative braking) can exceed the voltage rating of the MOSFETs, blowing them up.',
  },
  {
    id: 'fc',
    name: 'Flight Controller (FC)',
    icon: Compass,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    description: 'The central processing unit running the RTOS (Real-Time Operating System) that keeps the drone airborne.',
    details: 'Powered by an STM32 F4, F7, or H7 processor. The most critical component on the FC is the IMU (Inertial Measurement Unit), typically an MPU6000 or BMI270. The IMU contains a MEMS (Micro-Electro-Mechanical Systems) Gyroscope. It uses microscopic vibrating silicon structures; when the drone rotates, the Coriolis effect alters the vibration, which is measured as capacitance change. The FC reads this data at 8kHz, runs it through a PID loop, and outputs motor commands.',
    mistakes: 'Hard-mounting the FC to the frame. High-frequency motor vibrations will alias into the gyro signal, confusing the PID loop and causing the drone to fly erratically or "fly away" to the moon.',
  },
  {
    id: 'battery',
    name: 'LiPo & Li-Ion Chemistry',
    icon: Battery,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    description: 'High-density energy storage. Drones require batteries capable of massive instantaneous current discharge.',
    details: 'Lithium Polymer (LiPo) batteries use a Lithium Cobalt Oxide (LiCoO2) cathode and a graphite anode. During discharge, Lithium ions intercalate through a polymer electrolyte. They are rated by Cell Count (S) and Discharge Rate (C). A 6S 1300mAh 100C battery outputs 22.2V and can theoretically discharge at 130 Amps. Under high load, the Internal Resistance (IR) causes "Voltage Sag" (V = I*R drop).',
    mistakes: 'Discharging a LiPo cell below 3.2V. This causes irreversible chemical degradation of the anode. Puncturing a LiPo exposes the highly reactive lithium to moisture in the air, resulting in a violent thermal runaway (fire).',
  },
  {
    id: 'rx',
    name: 'RF Receiver (RX)',
    icon: Radio,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    description: 'The telemetry and control link between the pilot and the drone.',
    details: 'Modern systems use LoRa (Long Range) modulation on 900MHz or 2.4GHz bands (e.g., ExpressLRS, TBS Crossfire). LoRa uses Chirp Spread Spectrum (CSS) technology, allowing the receiver to decode signals even when they are below the RF noise floor. This provides ranges of 30km+ with minimal latency (500Hz packet rates).',
    mistakes: 'Mounting the antenna parallel to carbon fiber. Carbon fiber is conductive and acts as an RF shield, blocking the signal and causing a failsafe (drone drops out of the sky).',
  },
  {
    id: 'fpv',
    name: 'FPV Video Systems',
    icon: Camera,
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
    description: 'First Person View systems transmit real-time, low-latency video to the pilot.',
    details: 'Analog systems use NTSC/PAL composite video over 5.8GHz FM transmission. They have zero latency but low resolution. Digital systems (DJI, Walksnail, HDZero) use H.264/H.265 encoding and OFDM (Orthogonal Frequency-Division Multiplexing) to transmit 1080p video at 100fps with ~20ms latency. The VTX (Video Transmitter) generates significant heat and relies on propeller airflow for cooling.',
    mistakes: 'Powering on a VTX without an antenna attached. The RF amplifier has nowhere to dump its energy, causing the standing wave ratio (SWR) to spike and instantly burning out the amplifier chip.',
  },
  {
    id: 'gps',
    name: 'GNSS & Magnetometer',
    icon: Navigation,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    description: 'Provides absolute global positioning and heading data for autonomous navigation.',
    details: 'GNSS (Global Navigation Satellite System) modules receive timing signals from GPS, GLONASS, Galileo, and Beidou constellations. By calculating the time-of-flight of signals from at least 4 satellites, it determines 3D position. Advanced RTK (Real-Time Kinematic) GPS uses carrier-phase tracking to achieve centimeter-level accuracy. The built-in magnetometer measures the Earths magnetic field to determine yaw heading.',
    mistakes: 'Mounting the GPS/Magnetometer close to the battery cables. The high DC current flowing to the motors creates a massive electromagnetic field (Ampere\'s Law) that completely blinds the magnetometer, causing "toilet-bowling" during position hold.',
  }
];

export default function Components() {
  const [activeId, setActiveId] = useState(components[0].id);
  const activeComponent = components.find(c => c.id === activeId);

  return (
    <div className="container max-w-6xl py-10 px-4 md:px-8 flex-1 flex flex-col h-[calc(100vh-4rem)]">
      <div className="mb-8 shrink-0">
        <h1 className="text-4xl font-bold tracking-tight">Component Engineering</h1>
        <p className="text-xl text-muted-foreground mt-2">
          A deep dive into the material science, electronics, and physics of drone hardware.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
        {/* Sidebar List */}
        <div className="w-full lg:w-1/3 flex flex-col gap-2 overflow-y-auto pr-2 pb-8">
          {components.map((comp) => (
            <button
              key={comp.id}
              onClick={() => setActiveId(comp.id)}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl text-left transition-all shrink-0",
                activeId === comp.id 
                  ? "bg-secondary border border-border shadow-sm" 
                  : "hover:bg-secondary/50 border border-transparent"
              )}
            >
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", comp.bg, comp.color)}>
                <comp.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm md:text-base">{comp.name}</h3>
              </div>
            </button>
          ))}
        </div>

        {/* Detail View */}
        <div className="w-full lg:w-2/3 overflow-y-auto pb-8">
          <AnimatePresence mode="wait">
            {activeComponent && (
              <motion.div
                key={activeComponent.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="bg-card border border-border/50 rounded-2xl p-6 md:p-10 min-h-full"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center", activeComponent.bg, activeComponent.color)}>
                    <activeComponent.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">{activeComponent.name}</h2>
                    <p className="text-muted-foreground font-mono text-sm mt-1">Hardware Specification</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <h4 className="text-lg font-semibold text-primary mb-2 border-b border-border pb-2 flex items-center gap-2">
                      <Layers className="w-5 h-5" /> Purpose & Function
                    </h4>
                    <p className="text-foreground/80 leading-relaxed text-sm md:text-base">{activeComponent.description}</p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-accent mb-2 border-b border-border pb-2 flex items-center gap-2">
                      <Cpu className="w-5 h-5" /> Engineering & Physics
                    </h4>
                    <p className="text-foreground/80 leading-relaxed text-sm md:text-base">{activeComponent.details}</p>
                  </div>

                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5">
                    <h4 className="text-sm font-bold text-red-500 mb-2 uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Catastrophic Failure Mode
                    </h4>
                    <p className="text-red-200/80 text-sm leading-relaxed">{activeComponent.mistakes}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
