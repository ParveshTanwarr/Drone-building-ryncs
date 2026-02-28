import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Battery, Radio, Camera, Zap, Compass, Navigation, Layers, AlertTriangle, Activity, PenTool, Network } from 'lucide-react';
import { cn } from '../lib/utils';
import FullWiringDiagram from '../components/FullWiringDiagram';

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
    soldering: 'Motors come with pre-tinned wires. Cut to exact length to reach the ESC pads. Strip 2mm of silicone. Pre-tin the ESC pads with 63/37 leaded solder (or high-quality lead-free) at 380°C. Solder the 3 wires in any order (swap any two to reverse direction). Ensure joints are shiny and concave, not dull "cold" joints.',
    diagram: (
      <svg viewBox="0 0 400 150" className="w-full h-full font-mono text-[10px] md:text-xs">
        <rect x="50" y="45" width="60" height="60" rx="8" fill="#1f2937" stroke="#eab308" strokeWidth="2" />
        <text x="80" y="80" fill="#eab308" textAnchor="middle" className="font-bold">MOTOR</text>
        
        <rect x="250" y="45" width="80" height="60" rx="8" fill="#1f2937" stroke="#3b82f6" strokeWidth="2" />
        <text x="290" y="80" fill="#3b82f6" textAnchor="middle" className="font-bold">ESC</text>
        
        <path d="M 110 55 L 250 55" stroke="#fbbf24" strokeWidth="3" fill="none" />
        <text x="180" y="50" fill="#fbbf24" textAnchor="middle">Phase A</text>
        
        <path d="M 110 75 L 250 75" stroke="#fbbf24" strokeWidth="3" fill="none" />
        <text x="180" y="70" fill="#fbbf24" textAnchor="middle">Phase B</text>
        
        <path d="M 110 95 L 250 95" stroke="#fbbf24" strokeWidth="3" fill="none" />
        <text x="180" y="90" fill="#fbbf24" textAnchor="middle">Phase C</text>
      </svg>
    )
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
    soldering: 'The XT60 pigtail requires massive heat. Use a large chisel tip at 400°C. Pre-tin the thick 12AWG wire and the large ESC pads. Apply flux. Heat the pad and wire simultaneously until solder flows completely. For the FC connector, use the provided JST-SH harness, or direct solder the tiny signal pads using a conical tip at 350°C and thin 0.3mm solder.',
    diagram: (
      <svg viewBox="0 0 400 200" className="w-full h-full font-mono text-[10px] md:text-xs">
        <rect x="20" y="80" width="60" height="40" rx="4" fill="#1f2937" stroke="#ef4444" strokeWidth="2" />
        <text x="50" y="105" fill="#ef4444" textAnchor="middle" className="font-bold">LIPO</text>
        
        <rect x="160" y="60" width="80" height="80" rx="8" fill="#1f2937" stroke="#3b82f6" strokeWidth="2" />
        <text x="200" y="105" fill="#3b82f6" textAnchor="middle" className="font-bold">ESC</text>

        <rect x="160" y="10" width="80" height="30" rx="4" fill="#1f2937" stroke="#10b981" strokeWidth="2" />
        <text x="200" y="30" fill="#10b981" textAnchor="middle" className="font-bold">FC</text>

        <rect x="320" y="70" width="60" height="60" rx="8" fill="#1f2937" stroke="#eab308" strokeWidth="2" />
        <text x="350" y="105" fill="#eab308" textAnchor="middle" className="font-bold">MOTOR</text>

        <path d="M 80 90 L 160 90" stroke="#ef4444" strokeWidth="4" fill="none" />
        <text x="120" y="85" fill="#ef4444" textAnchor="middle">VCC (+)</text>
        <path d="M 80 110 L 160 110" stroke="#9ca3af" strokeWidth="4" fill="none" />
        <text x="120" y="125" fill="#9ca3af" textAnchor="middle">GND (-)</text>

        <path d="M 190 40 L 190 60" stroke="#fcd34d" strokeWidth="2" fill="none" />
        <text x="175" y="55" fill="#fcd34d" textAnchor="middle">SIG</text>
        <path d="M 210 40 L 210 60" stroke="#9ca3af" strokeWidth="2" fill="none" />
        <text x="230" y="55" fill="#9ca3af" textAnchor="middle">GND</text>

        <path d="M 240 80 L 320 80" stroke="#fbbf24" strokeWidth="3" fill="none" />
        <path d="M 240 100 L 320 100" stroke="#fbbf24" strokeWidth="3" fill="none" />
        <path d="M 240 120 L 320 120" stroke="#fbbf24" strokeWidth="3" fill="none" />
        <text x="280" y="75" fill="#fbbf24" textAnchor="middle">3-Phase</text>
      </svg>
    )
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
    soldering: 'FC pads are tiny and delicate. Use a fine tip at 350°C. ALWAYS use flux. Pre-tin all pads you plan to use. When soldering wires (like RX or VTX), strip only 1-2mm. Do not hold the iron on the pad for more than 2 seconds, or you risk delaminating the copper pad from the PCB. Pitfall: F4 processors do not have built-in hardware inverters for all UARTs. If using an inverted protocol like SBUS, you MUST solder to the specific pad labeled "SBUS" which has a dedicated hardware inverter circuit.',
    diagram: (
      <svg viewBox="0 0 400 250" className="w-full h-full font-mono text-[10px] md:text-xs">
        <rect x="150" y="80" width="100" height="100" rx="8" fill="#1f2937" stroke="#10b981" strokeWidth="2" />
        <text x="200" y="135" fill="#10b981" textAnchor="middle" className="text-lg font-bold">FC</text>

        <rect x="20" y="20" width="60" height="40" rx="4" fill="#1f2937" stroke="#a855f7" strokeWidth="2" />
        <text x="50" y="45" fill="#a855f7" textAnchor="middle" className="font-bold">RX</text>

        <rect x="320" y="20" width="60" height="40" rx="4" fill="#1f2937" stroke="#06b6d4" strokeWidth="2" />
        <text x="350" y="45" fill="#06b6d4" textAnchor="middle" className="font-bold">VTX</text>

        <rect x="20" y="200" width="60" height="40" rx="4" fill="#1f2937" stroke="#f97316" strokeWidth="2" />
        <text x="50" y="225" fill="#f97316" textAnchor="middle" className="font-bold">GPS</text>

        <rect x="320" y="200" width="60" height="40" rx="4" fill="#1f2937" stroke="#3b82f6" strokeWidth="2" />
        <text x="350" y="225" fill="#3b82f6" textAnchor="middle" className="font-bold">ESC</text>

        <path d="M 80 40 L 150 90" stroke="#a855f7" strokeWidth="2" fill="none" />
        <text x="100" y="60" fill="#a855f7" textAnchor="middle" transform="rotate(35 100 60)">UART</text>

        <path d="M 320 40 L 250 90" stroke="#06b6d4" strokeWidth="2" fill="none" />
        <text x="300" y="60" fill="#06b6d4" textAnchor="middle" transform="rotate(-35 300 60)">Video/UART</text>

        <path d="M 80 220 L 150 170" stroke="#f97316" strokeWidth="2" fill="none" />
        <text x="100" y="205" fill="#f97316" textAnchor="middle" transform="rotate(-35 100 205)">UART+I2C</text>

        <path d="M 320 220 L 250 170" stroke="#3b82f6" strokeWidth="2" fill="none" />
        <text x="300" y="205" fill="#3b82f6" textAnchor="middle" transform="rotate(35 300 205)">DShot</text>
      </svg>
    )
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
    soldering: 'Never solder directly to a LiPo cell unless you are building custom packs (requires spot welder). For the XT60 connector on the drone side: fill the connector cup with solder, tin the wire, insert the wire into the cup while heating. Use heat shrink tubing to prevent shorts. Pitfall: Ground Loops. Ensure all high-current ground paths go directly to the battery/ESC, not through the FC.',
    diagram: (
      <svg viewBox="0 0 400 150" className="w-full h-full font-mono text-[10px] md:text-xs">
        <rect x="50" y="50" width="80" height="50" rx="4" fill="#1f2937" stroke="#ef4444" strokeWidth="2" />
        <text x="90" y="80" fill="#ef4444" textAnchor="middle" className="font-bold">LiPo</text>

        <rect x="250" y="50" width="100" height="50" rx="4" fill="#1f2937" stroke="#3b82f6" strokeWidth="2" />
        <text x="300" y="80" fill="#3b82f6" textAnchor="middle" className="font-bold">ESC / PDB</text>

        <path d="M 130 65 L 250 65" stroke="#ef4444" strokeWidth="6" fill="none" />
        <text x="190" y="55" fill="#ef4444" textAnchor="middle">VBAT (+)</text>

        <path d="M 130 85 L 250 85" stroke="#9ca3af" strokeWidth="6" fill="none" />
        <text x="190" y="105" fill="#9ca3af" textAnchor="middle">GND (-)</text>
      </svg>
    )
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
    soldering: 'Receivers usually have 4 pads: 5V, GND, TX, RX. Solder to a free UART on the FC. CRITICAL: TX on the receiver goes to RX on the FC, and RX on the receiver goes to TX on the FC. Use thin 30AWG silicone wire. Twist the wires together to reject electromagnetic interference (EMI).',
    diagram: (
      <svg viewBox="0 0 400 150" className="w-full h-full font-mono text-[10px] md:text-xs">
        <rect x="50" y="40" width="80" height="70" rx="4" fill="#1f2937" stroke="#a855f7" strokeWidth="2" />
        <text x="90" y="80" fill="#a855f7" textAnchor="middle" className="font-bold">RX</text>

        <rect x="250" y="30" width="80" height="90" rx="4" fill="#1f2937" stroke="#10b981" strokeWidth="2" />
        <text x="290" y="80" fill="#10b981" textAnchor="middle" className="font-bold">FC</text>

        <path d="M 130 50 L 250 50" stroke="#ef4444" strokeWidth="2" fill="none" />
        <text x="190" y="45" fill="#ef4444" textAnchor="middle">5V</text>

        <path d="M 130 70 L 250 70" stroke="#9ca3af" strokeWidth="2" fill="none" />
        <text x="190" y="65" fill="#9ca3af" textAnchor="middle">GND</text>

        <path d="M 130 90 L 250 90" stroke="#34d399" strokeWidth="2" fill="none" />
        <text x="190" y="85" fill="#34d399" textAnchor="middle">TX -{'>'} RX</text>

        <path d="M 130 110 L 250 110" stroke="#60a5fa" strokeWidth="2" fill="none" />
        <text x="190" y="105" fill="#60a5fa" textAnchor="middle">RX {'<'}-- TX</text>
      </svg>
    )
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
    soldering: 'Analog VTXs require 5V or 9V, GND, Video In, and SmartAudio/Tramp (to a TX pad). Digital VTXs (DJI) require VBAT (up to 6S), GND, TX, and RX. Pitfall: Video noise. Power the camera and VTX from the same filtered BEC on the FC. If you share a ground wire with a high-current component (like an ESC), the voltage drop across the wire will appear as horizontal lines in your analog video (a Ground Loop). Twist the video and ground wires together.',
    diagram: (
      <svg viewBox="0 0 400 200" className="w-full h-full font-mono text-[10px] md:text-xs">
        <rect x="20" y="80" width="60" height="40" rx="4" fill="#1f2937" stroke="#06b6d4" strokeWidth="2" />
        <text x="50" y="105" fill="#06b6d4" textAnchor="middle" className="font-bold">CAM</text>

        <rect x="160" y="60" width="80" height="80" rx="4" fill="#1f2937" stroke="#10b981" strokeWidth="2" />
        <text x="200" y="105" fill="#10b981" textAnchor="middle" className="font-bold">FC (OSD)</text>

        <rect x="320" y="80" width="60" height="40" rx="4" fill="#1f2937" stroke="#06b6d4" strokeWidth="2" />
        <text x="350" y="105" fill="#06b6d4" textAnchor="middle" className="font-bold">VTX</text>

        <path d="M 80 90 L 160 90" stroke="#eab308" strokeWidth="2" fill="none" />
        <text x="120" y="85" fill="#eab308" textAnchor="middle">Vid In</text>

        <path d="M 240 90 L 320 90" stroke="#eab308" strokeWidth="2" fill="none" />
        <text x="280" y="85" fill="#eab308" textAnchor="middle">Vid Out</text>

        <path d="M 240 110 L 320 110" stroke="#34d399" strokeWidth="2" fill="none" />
        <text x="280" y="125" fill="#34d399" textAnchor="middle">TX/RX (SA)</text>
      </svg>
    )
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
    soldering: 'GPS modules use UART (TX/RX) for positioning data, and I2C (SDA/SCL) for the magnetometer (compass). Solder TX->RX, RX->TX. For I2C, SDA goes to SDA, SCL goes to SCL (no crossover). I2C is a bus protocol and requires pull-up resistors, which are usually included on the GPS module. Keep I2C wires as short as possible, as it is highly susceptible to noise from the ESCs.',
    diagram: (
      <svg viewBox="0 0 400 180" className="w-full h-full font-mono text-[10px] md:text-xs">
        <rect x="50" y="40" width="80" height="100" rx="4" fill="#1f2937" stroke="#f97316" strokeWidth="2" />
        <text x="90" y="95" fill="#f97316" textAnchor="middle" className="font-bold">GPS+MAG</text>

        <rect x="250" y="40" width="80" height="100" rx="4" fill="#1f2937" stroke="#10b981" strokeWidth="2" />
        <text x="290" y="95" fill="#10b981" textAnchor="middle" className="font-bold">FC</text>

        <path d="M 130 50 L 250 50" stroke="#ef4444" strokeWidth="2" fill="none" />
        <text x="190" y="45" fill="#ef4444" textAnchor="middle">5V</text>

        <path d="M 130 70 L 250 70" stroke="#9ca3af" strokeWidth="2" fill="none" />
        <text x="190" y="65" fill="#9ca3af" textAnchor="middle">GND</text>

        <path d="M 130 90 L 250 90" stroke="#34d399" strokeWidth="2" fill="none" />
        <text x="190" y="85" fill="#34d399" textAnchor="middle">TX/RX (UART)</text>

        <path d="M 130 110 L 250 110" stroke="#60a5fa" strokeWidth="2" fill="none" />
        <text x="190" y="105" fill="#60a5fa" textAnchor="middle">SCL (I2C)</text>

        <path d="M 130 130 L 250 130" stroke="#818cf8" strokeWidth="2" fill="none" />
        <text x="190" y="125" fill="#818cf8" textAnchor="middle">SDA (I2C)</text>
      </svg>
    )
  }
];

export default function Components() {
  const [activeId, setActiveId] = useState(components[0].id);
  const [activeTab, setActiveTab] = useState<'overview' | 'physics' | 'wiring' | 'schematic'>('overview');
  const [viewMode, setViewMode] = useState<'library' | 'architecture'>('library');
  const activeComponent = components.find(c => c.id === activeId);

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 md:px-8 flex-1 flex flex-col h-[calc(100vh-4rem)] relative z-10">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            Hardware Engineering
          </h1>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl">
            A deep dive into the material science, electronics, and physics of drone hardware.
          </p>
        </div>
        
        <div className="flex bg-secondary/50 p-1 rounded-xl border border-border/50 backdrop-blur-sm">
          <button
            onClick={() => setViewMode('library')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
              viewMode === 'library' ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground/70 hover:text-foreground"
            )}
          >
            <Layers className="w-4 h-4" /> Component Library
          </button>
          <button
            onClick={() => setViewMode('architecture')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
              viewMode === 'architecture' ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground/70 hover:text-foreground"
            )}
          >
            <Network className="w-4 h-4" /> System Architecture
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative">
        <AnimatePresence mode="wait">
          {viewMode === 'architecture' ? (
            <motion.div
              key="architecture"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 overflow-y-auto"
            >
              <FullWiringDiagram />
            </motion.div>
          ) : (
            <motion.div
              key="library"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex flex-col lg:flex-row gap-6"
            >
              {/* Sidebar List */}
              <div className="w-full lg:w-[320px] flex flex-col gap-2 overflow-y-auto pr-2 pb-8 custom-scrollbar">
                {components.map((comp) => (
                  <button
                    key={comp.id}
                    onClick={() => {
                      setActiveId(comp.id);
                      setActiveTab('overview');
                    }}
                    className={cn(
                      "flex items-center gap-4 p-3 rounded-xl text-left transition-all shrink-0 group relative overflow-hidden",
                      activeId === comp.id 
                        ? "bg-secondary/80 border-border/80 shadow-md" 
                        : "hover:bg-secondary/40 border-transparent hover:border-border/30"
                    )}
                  >
                    {activeId === comp.id && (
                      <motion.div layoutId="active-indicator" className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                    )}
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", comp.bg, comp.color)}>
                      <comp.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={cn("font-medium text-sm transition-colors", activeId === comp.id ? "text-foreground" : "text-foreground/80")}>
                        {comp.name}
                      </h3>
                    </div>
                  </button>
                ))}
              </div>

              {/* Detail View */}
              <div className="flex-1 overflow-y-auto pb-8 custom-scrollbar">
                <AnimatePresence mode="wait">
                  {activeComponent && (
                    <motion.div
                      key={activeComponent.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="bg-card/40 backdrop-blur-md border border-border/50 rounded-2xl flex flex-col min-h-full overflow-hidden"
                    >
                      {/* Header */}
                      <div className="p-6 md:p-8 border-b border-border/50 bg-secondary/20">
                        <div className="flex items-center gap-5">
                          <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner", activeComponent.bg, activeComponent.color)}>
                            <activeComponent.icon className="w-8 h-8" />
                          </div>
                          <div>
                            <h2 className="text-3xl font-bold tracking-tight">{activeComponent.name}</h2>
                            <p className="text-primary/80 font-mono text-sm mt-1 flex items-center gap-2">
                              <Cpu className="w-4 h-4" /> Hardware Specification
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Tabs */}
                      <div className="flex border-b border-border/50 px-6 md:px-8 bg-secondary/10 overflow-x-auto hide-scrollbar">
                        {[
                          { id: 'overview', label: 'Overview', icon: Layers },
                          { id: 'physics', label: 'Physics & Eng.', icon: Cpu },
                          { id: 'wiring', label: 'Wiring Guide', icon: PenTool },
                          { id: 'schematic', label: 'Schematic', icon: Activity },
                        ].map((tab) => {
                          const Icon = tab.icon;
                          return (
                            <button
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id as any)}
                              className={cn(
                                "px-4 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap",
                                activeTab === tab.id 
                                  ? "border-primary text-primary" 
                                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                              )}
                            >
                              <Icon className="w-4 h-4" /> {tab.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Tab Content */}
                      <div className="p-6 md:p-8 flex-1">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                          >
                            {activeTab === 'overview' && (
                              <div className="space-y-6">
                                <h3 className="text-xl font-semibold">Purpose & Function</h3>
                                <p className="text-foreground/80 leading-relaxed text-lg">{activeComponent.description}</p>
                              </div>
                            )}

                            {activeTab === 'physics' && (
                              <div className="space-y-6">
                                <h3 className="text-xl font-semibold">Engineering Details</h3>
                                <p className="text-foreground/80 leading-relaxed text-lg">{activeComponent.details}</p>
                              </div>
                            )}

                            {activeTab === 'wiring' && (
                              <div className="space-y-6">
                                {activeComponent.soldering ? (
                                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-6">
                                    <h4 className="text-base font-bold text-orange-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                                      <PenTool className="w-5 h-5" /> Soldering & Wiring Guide
                                    </h4>
                                    <p className="text-orange-200/90 text-base leading-relaxed">{activeComponent.soldering}</p>
                                  </div>
                                ) : (
                                  <p className="text-muted-foreground italic">No specific soldering instructions for this component.</p>
                                )}

                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mt-6">
                                  <h4 className="text-base font-bold text-red-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" /> Catastrophic Failure Mode
                                  </h4>
                                  <p className="text-red-200/90 text-base leading-relaxed">{activeComponent.mistakes}</p>
                                </div>
                              </div>
                            )}

                            {activeTab === 'schematic' && activeComponent.diagram && (
                              <div className="space-y-6">
                                <h3 className="text-xl font-semibold">Connection Schematic</h3>
                                <div className="bg-black/60 border border-border/50 rounded-xl p-6 overflow-hidden flex items-center justify-center shadow-inner">
                                  <div className="w-full max-w-2xl">
                                    {activeComponent.diagram}
                                  </div>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
