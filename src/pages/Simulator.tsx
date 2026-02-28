import React, { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'motion/react';
import DroneModel, { BuildState } from '../components/3d/DroneModel';
import { Play, Square, Wrench, Code, Terminal, CheckCircle2, Circle, BookOpen, Wind, Battery, SlidersHorizontal, Gamepad2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw, RotateCw, Info } from 'lucide-react';
import { cn } from '../lib/utils';

type Mode = 'build' | 'code' | 'physics' | 'control';

const defaultCode = `# --- RESEARCH FLIGHT SCRIPT ---
# Language: Python-like pseudo-code
# Simulating MAVLink commands to a PID-controlled Flight Controller

# 1. Arm motors and climb to 2 meters
takeoff()

# 2. Stabilize and wait for 2 seconds
# Observe the drone fighting wind drift if wind is enabled
hover(2)

# 3. Pitch forward to move 3 meters
forward(3)

# 4. Yaw (rotate) 90 degrees to the right
yaw(90)

# 5. Move forward again
forward(3)

# 6. Descend to 0 meters and disarm motors
land()
`;

// A wrapper component to handle physics updates within the Canvas
function PhysicsEngine({ 
  position, 
  setPosition, 
  isHovering, 
  windX, 
  windZ,
  isRunning
}: { 
  position: [number, number, number], 
  setPosition: React.Dispatch<React.SetStateAction<[number, number, number]>>,
  isHovering: boolean,
  windX: number,
  windZ: number,
  isRunning: boolean
}) {
  useFrame((state, delta) => {
    if (isHovering && isRunning) {
      // Apply wind drift. A real PID controller would fight this, 
      // but we simulate a slight drift that the "code" doesn't perfectly correct.
      const driftFactor = 0.5; // How much wind affects the drone
      const newX = position[0] + (windX * driftFactor * delta);
      const newZ = position[2] + (windZ * driftFactor * delta);
      
      // Only update if there's actual wind to avoid constant re-renders
      if (Math.abs(windX) > 0.1 || Math.abs(windZ) > 0.1) {
        setPosition([newX, position[1], newZ]);
      }
    }
  });
  return null;
}

export default function Simulator() {
  const [mode, setMode] = useState<Mode>('build');
  const [isHovering, setIsHovering] = useState(false);
  const [code, setCode] = useState(defaultCode);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>(['System initialized. Ready.']);
  const [showGuide, setShowGuide] = useState(false);
  
  // Drone State
  const [dronePos, setDronePos] = useState<[number, number, number]>([0, 0, 0]);
  const [droneRot, setDroneRot] = useState<[number, number, number]>([0, 0, 0]);

  // Physics State
  const [windX, setWindX] = useState(0);
  const [windZ, setWindZ] = useState(0);
  const [batteryVoltage, setBatteryVoltage] = useState(16.8); // 4S LiPo fully charged
  const [throttle, setThrottle] = useState(0);

  // Build State
  const [buildState, setBuildState] = useState<BuildState>({
    frame: true,
    motors: false,
    esc: false,
    fc: false,
    battery: false,
    props: false,
    camera: false,
  });

  const isFullyBuilt = Object.values(buildState).every(Boolean);

  const toggleComponent = (key: keyof BuildState) => {
    setBuildState(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  // Simulate Voltage Sag based on throttle
  useEffect(() => {
    if (isHovering) {
      // Base hover throttle is around 30%
      const currentThrottle = throttle > 0 ? throttle : 0.3;
      // Internal Resistance (IR) causes voltage drop: V_drop = I * R
      const sag = currentThrottle * 1.5; 
      setBatteryVoltage(Math.max(14.0, 16.8 - sag));
    } else {
      setBatteryVoltage(16.8);
    }
  }, [isHovering, throttle]);

  const handleManualCommand = (cmd: string) => {
    if (!isFullyBuilt) return;
    
    let currentPos = [...dronePos] as [number, number, number];
    let currentRot = [...droneRot] as [number, number, number];
    const val = 1; // 1 meter or 15 degrees
    const yaw = currentRot[1];

    addLog(`Manual Override: ${cmd.toUpperCase()}`);

    switch (cmd) {
      case 'takeoff':
        setIsHovering(true);
        setThrottle(0.8);
        setDronePos([currentPos[0], 2, currentPos[2]]);
        setTimeout(() => setThrottle(0.3), 1000);
        break;
      case 'land':
        setThrottle(0.1);
        setDronePos([currentPos[0], 0, currentPos[2]]);
        setTimeout(() => {
          setIsHovering(false);
          setThrottle(0);
        }, 1000);
        break;
      case 'forward':
        setThrottle(0.5);
        setDronePos([currentPos[0] + Math.sin(yaw) * val, currentPos[1], currentPos[2] + Math.cos(yaw) * val]);
        setTimeout(() => setThrottle(0.3), 500);
        break;
      case 'backward':
        setThrottle(0.5);
        setDronePos([currentPos[0] - Math.sin(yaw) * val, currentPos[1], currentPos[2] - Math.cos(yaw) * val]);
        setTimeout(() => setThrottle(0.3), 500);
        break;
      case 'left':
        setThrottle(0.5);
        setDronePos([currentPos[0] + Math.sin(yaw + Math.PI/2) * val, currentPos[1], currentPos[2] + Math.cos(yaw + Math.PI/2) * val]);
        setTimeout(() => setThrottle(0.3), 500);
        break;
      case 'right':
        setThrottle(0.5);
        setDronePos([currentPos[0] + Math.sin(yaw - Math.PI/2) * val, currentPos[1], currentPos[2] + Math.cos(yaw - Math.PI/2) * val]);
        setTimeout(() => setThrottle(0.3), 500);
        break;
      case 'yaw_left':
        setDroneRot([currentRot[0], currentRot[1] + (15 * Math.PI / 180), currentRot[2]]);
        break;
      case 'yaw_right':
        setDroneRot([currentRot[0], currentRot[1] - (15 * Math.PI / 180), currentRot[2]]);
        break;
    }
  };

  const runCode = async () => {
    if (!isFullyBuilt) {
      addLog("ERROR: Drone is not fully built. Complete assembly first.");
      return;
    }
    
    setIsRunning(true);
    addLog("Starting execution...");
    
    const lines = code.split('\n').map(l => l.trim().toLowerCase()).filter(l => l && !l.startsWith('#'));
    
    let currentRot = [...droneRot] as [number, number, number];

    for (const line of lines) {
      if (!isRunning) break; // Allow stopping
      addLog(`Executing: ${line}`);
      
      if (line.startsWith('takeoff()')) {
        setIsHovering(true);
        setThrottle(0.8); // High throttle to climb
        setDronePos(prev => [prev[0], 2, prev[2]]);
        await new Promise(r => setTimeout(r, 1500));
        setThrottle(0.3); // Hover throttle
      } else if (line.startsWith('land()')) {
        setThrottle(0.1); // Low throttle to descend
        setDronePos(prev => [prev[0], 0, prev[2]]);
        await new Promise(r => setTimeout(r, 1500));
        setIsHovering(false);
        setThrottle(0);
      } else if (line.startsWith('forward(')) {
        const val = parseFloat(line.match(/\d+/)?.[0] || '1');
        const yaw = currentRot[1];
        setThrottle(0.5);
        setDronePos(prev => [
          prev[0] + Math.sin(yaw) * val,
          prev[1],
          prev[2] + Math.cos(yaw) * val
        ]);
        await new Promise(r => setTimeout(r, 1500));
        setThrottle(0.3);
      } else if (line.startsWith('backward(')) {
        const val = parseFloat(line.match(/\d+/)?.[0] || '1');
        const yaw = currentRot[1];
        setThrottle(0.5);
        setDronePos(prev => [
          prev[0] - Math.sin(yaw) * val,
          prev[1],
          prev[2] - Math.cos(yaw) * val
        ]);
        await new Promise(r => setTimeout(r, 1500));
        setThrottle(0.3);
      } else if (line.startsWith('left(')) {
        const val = parseFloat(line.match(/\d+/)?.[0] || '1');
        const yaw = currentRot[1];
        setThrottle(0.5);
        setDronePos(prev => [
          prev[0] + Math.sin(yaw + Math.PI/2) * val,
          prev[1],
          prev[2] + Math.cos(yaw + Math.PI/2) * val
        ]);
        await new Promise(r => setTimeout(r, 1500));
        setThrottle(0.3);
      } else if (line.startsWith('right(')) {
        const val = parseFloat(line.match(/\d+/)?.[0] || '1');
        const yaw = currentRot[1];
        setThrottle(0.5);
        setDronePos(prev => [
          prev[0] + Math.sin(yaw - Math.PI/2) * val,
          prev[1],
          prev[2] + Math.cos(yaw - Math.PI/2) * val
        ]);
        await new Promise(r => setTimeout(r, 1500));
        setThrottle(0.3);
      } else if (line.startsWith('yaw(')) {
        const val = parseFloat(line.match(/\d+/)?.[0] || '90');
        currentRot[1] += val * (Math.PI / 180);
        setDroneRot([...currentRot]);
        await new Promise(r => setTimeout(r, 1500));
      } else if (line.startsWith('hover(')) {
        const val = parseFloat(line.match(/\d+/)?.[0] || '1');
        setThrottle(0.3);
        await new Promise(r => setTimeout(r, val * 1000));
      } else {
        addLog(`Unknown command: ${line}`);
      }
    }
    
    addLog("Execution finished.");
    setIsRunning(false);
    setThrottle(0);
  };

  const stopCode = () => {
    setIsRunning(false);
    setIsHovering(false);
    setThrottle(0);
    setDronePos([0,0,0]);
    setDroneRot([0,0,0]);
    addLog("Execution stopped. Drone reset.");
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-3.5rem)] overflow-hidden bg-background">
      
      {/* Left Sidebar - Controls */}
      <div className="w-full md:w-[400px] border-r border-border/50 flex flex-col bg-card z-10 shadow-xl">
        <div className="flex border-b border-border/50 text-xs md:text-sm">
          <button 
            onClick={() => setMode('build')}
            className={cn("flex-1 py-4 flex items-center justify-center gap-2 font-medium transition-colors", mode === 'build' ? "text-primary border-b-2 border-primary bg-primary/5" : "text-muted-foreground hover:bg-secondary/50")}
          >
            <Wrench className="w-4 h-4" /> Build
          </button>
          <button 
            onClick={() => setMode('code')}
            className={cn("flex-1 py-4 flex items-center justify-center gap-2 font-medium transition-colors", mode === 'code' ? "text-accent border-b-2 border-accent bg-accent/5" : "text-muted-foreground hover:bg-secondary/50")}
          >
            <Code className="w-4 h-4" /> Code
          </button>
          <button 
            onClick={() => setMode('control')}
            className={cn("flex-1 py-4 flex items-center justify-center gap-2 font-medium transition-colors", mode === 'control' ? "text-orange-500 border-b-2 border-orange-500 bg-orange-500/5" : "text-muted-foreground hover:bg-secondary/50")}
          >
            <Gamepad2 className="w-4 h-4" /> Fly
          </button>
          <button 
            onClick={() => setMode('physics')}
            className={cn("flex-1 py-4 flex items-center justify-center gap-2 font-medium transition-colors", mode === 'physics' ? "text-emerald-500 border-b-2 border-emerald-500 bg-emerald-500/5" : "text-muted-foreground hover:bg-secondary/50")}
          >
            <SlidersHorizontal className="w-4 h-4" /> Physics
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col">
          {mode === 'build' && (
            <div className="space-y-4">
              <div className="mb-6">
                <h2 className="text-lg font-bold">Assembly Bay</h2>
                <p className="text-sm text-muted-foreground">Click components to install them on the frame.</p>
              </div>
              
              {[
                { id: 'frame', label: 'Carbon Fiber Frame', desc: 'The backbone. X-geometry for optimal CG.' },
                { id: 'motors', label: 'Brushless Motors (x4)', desc: 'Provides thrust. High KV for racing, low KV for cinematic.' },
                { id: 'esc', label: '4-in-1 ESC', desc: 'Electronic Speed Controller. Translates digital signals to 3-phase AC.' },
                { id: 'fc', label: 'Flight Controller', desc: 'The brain. Runs PID loops and processes gyro data.' },
                { id: 'camera', label: 'FPV Camera & VTX', desc: 'Video transmitter and camera for real-time vision.' },
                { id: 'battery', label: 'LiPo Battery', desc: 'High-discharge power source. Usually 4S to 6S.' },
                { id: 'props', label: 'Propellers (x4)', desc: 'Converts rotational motion into thrust.' },
              ].map((comp) => {
                const isInstalled = buildState[comp.id as keyof BuildState];
                return (
                  <motion.div 
                    key={comp.id}
                    className="relative group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      onClick={() => toggleComponent(comp.id as keyof BuildState)}
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-xl border transition-all overflow-hidden relative",
                        isInstalled 
                          ? "bg-primary/10 border-primary/30 text-primary shadow-[0_0_15px_rgba(var(--primary),0.2)]" 
                          : "bg-secondary/50 border-border hover:border-primary/50 text-foreground"
                      )}
                    >
                      <div className="flex flex-col items-start z-10">
                        <span className="font-medium flex items-center gap-2">
                          {comp.label}
                          <Info className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </span>
                      </div>
                      <div className="z-10">
                        {isInstalled ? (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </motion.div>
                        ) : (
                          <Circle className="w-5 h-5 opacity-50" />
                        )}
                      </div>
                      
                      {/* Installation Flash Animation */}
                      <AnimatePresence>
                        {isInstalled && (
                          <motion.div 
                            initial={{ opacity: 0.5, scale: 0 }}
                            animate={{ opacity: 0, scale: 2 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 bg-primary/20 rounded-xl pointer-events-none"
                          />
                        )}
                      </AnimatePresence>
                    </button>
                    
                    {/* Tooltip */}
                    <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 w-48 p-2 bg-popover text-popover-foreground text-xs rounded-lg border shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                      <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-popover border-l border-b rotate-45"></div>
                      {comp.desc}
                    </div>
                  </motion.div>
                )
              })}
              
              <div className="mt-8 p-4 bg-secondary/30 rounded-xl border border-border/50">
                <h3 className="text-sm font-bold mb-2">Status</h3>
                {isFullyBuilt ? (
                  <p className="text-sm text-emerald-500 flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Ready for flight coding</p>
                ) : (
                  <p className="text-sm text-yellow-500">Assembly incomplete</p>
                )}
              </div>
            </div>
          )}

          {mode === 'code' && (
            <div className="flex flex-col h-full">
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold">Flight Computer</h2>
                  <p className="text-sm text-muted-foreground">Write Python-like scripts.</p>
                </div>
                <button 
                  onClick={() => setShowGuide(!showGuide)}
                  className="p-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                  title="Toggle Code Guide"
                >
                  <BookOpen className="w-5 h-5 text-accent" />
                </button>
              </div>

              {showGuide && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-4 bg-accent/10 border border-accent/20 rounded-xl text-sm text-foreground/80 space-y-4 overflow-y-auto max-h-80 custom-scrollbar"
                >
                  <h4 className="font-bold text-accent sticky top-0 bg-[#09090b]/90 backdrop-blur py-1 z-10">Code Guide & Real-World Implementation</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <code className="text-primary font-bold bg-primary/10 px-1 rounded">takeoff()</code>
                      <p className="text-xs mt-1">Arms the motors and climbs to a default altitude of 2 meters. Equivalent to sending a <code>MAV_CMD_NAV_TAKEOFF</code> command.</p>
                    </div>
                    
                    <div>
                      <code className="text-primary font-bold bg-primary/10 px-1 rounded">land()</code>
                      <p className="text-xs mt-1">Descends to 0 meters and disarms the motors. Equivalent to <code>MAV_CMD_NAV_LAND</code>.</p>
                    </div>
                    
                    <div>
                      <code className="text-primary font-bold bg-primary/10 px-1 rounded">forward(distance)</code>
                      <p className="text-xs mt-1">Pitches the drone forward to travel the specified distance in meters. Uses local NED (North-East-Down) coordinate frames.</p>
                    </div>
                    
                    <div>
                      <code className="text-primary font-bold bg-primary/10 px-1 rounded">yaw(angle_degrees)</code>
                      <p className="text-xs mt-1">Rotates the drone around its Z-axis by the specified degrees. Uses <code>MAV_CMD_CONDITION_YAW</code>.</p>
                    </div>
                    
                    <div>
                      <code className="text-primary font-bold bg-primary/10 px-1 rounded">hover(seconds)</code>
                      <p className="text-xs mt-1">Maintains current position and altitude for the specified duration using GPS and Barometer sensor fusion.</p>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground mt-4 border-t border-accent/20 pt-4 space-y-3">
                    <h5 className="font-bold text-foreground">How to Code a Drone IRL:</h5>
                    
                    <div>
                      <strong className="text-foreground">1. Hardware Connection:</strong>
                      <p>You need a Companion Computer (like a Raspberry Pi or Jetson Nano) connected to the Flight Controller (FC) via UART (Serial connection). TX on Pi goes to RX on FC, and RX on Pi goes to TX on FC. Ensure common ground.</p>
                    </div>
                    
                    <div>
                      <strong className="text-foreground">2. Software Setup (Laptop/PC):</strong>
                      <ul className="list-disc pl-4 mt-1 space-y-1">
                        <li>Install Python 3.x</li>
                        <li>Install Mission Planner or QGroundControl (Ground Control Station software)</li>
                        <li>Install libraries: <code>pip install dronekit pymavlink</code></li>
                      </ul>
                    </div>

                    <div>
                      <strong className="text-foreground">3. Example Real-World Script (DroneKit):</strong>
                      <pre className="mt-2 p-2 bg-black/50 rounded border border-border/50 overflow-x-auto text-[10px] leading-tight">
{`from dronekit import connect, VehicleMode
import time

# Connect to the Vehicle (via serial port or UDP)
vehicle = connect('/dev/ttyAMA0', wait_ready=True, baud=921600)

def arm_and_takeoff(aTargetAltitude):
    print("Basic pre-arm checks")
    while not vehicle.is_armable:
        time.sleep(1)

    print("Arming motors")
    vehicle.mode = VehicleMode("GUIDED")
    vehicle.armed = True

    while not vehicle.armed:
        time.sleep(1)

    print("Taking off!")
    vehicle.simple_takeoff(aTargetAltitude)

    while True:
        print(" Altitude: ", vehicle.location.global_relative_frame.alt)
        if vehicle.location.global_relative_frame.alt >= aTargetAltitude * 0.95:
            print("Reached target altitude")
            break
        time.sleep(1)

arm_and_takeoff(2)
print("Hovering for 5 seconds...")
time.sleep(5)
print("Landing...")
vehicle.mode = VehicleMode("LAND")
vehicle.close()`}
                      </pre>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div className="flex-1 relative rounded-xl overflow-hidden border border-border/50 bg-[#1e1e1e] min-h-[200px]">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-full p-4 bg-transparent text-emerald-400 font-mono text-sm resize-none focus:outline-none"
                  spellCheck={false}
                />
              </div>
              
              <div className="mt-4 flex gap-2 shrink-0">
                {!isRunning ? (
                  <button 
                    onClick={runCode}
                    disabled={!isFullyBuilt}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-accent text-accent-foreground font-bold hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Play className="w-4 h-4" /> Run Script
                  </button>
                ) : (
                  <button 
                    onClick={stopCode}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
                  >
                    <Square className="w-4 h-4" /> Stop & Reset
                  </button>
                )}
              </div>
            </div>
          )}

          {mode === 'control' && (
            <div className="flex flex-col h-full space-y-6">
              <div className="mb-2">
                <h2 className="text-lg font-bold">Manual Override</h2>
                <p className="text-sm text-muted-foreground">Direct MAVLink command injection.</p>
              </div>

              {!isFullyBuilt ? (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                  Drone assembly incomplete. Cannot initialize flight controller.
                </div>
              ) : (
                <>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleManualCommand('takeoff')}
                      disabled={isHovering}
                      className="flex-1 py-3 bg-emerald-500/20 text-emerald-500 border border-emerald-500/50 rounded-xl font-bold hover:bg-emerald-500/30 disabled:opacity-50 transition-colors"
                    >
                      ARM & TAKEOFF
                    </button>
                    <button 
                      onClick={() => handleManualCommand('land')}
                      disabled={!isHovering}
                      className="flex-1 py-3 bg-red-500/20 text-red-500 border border-red-500/50 rounded-xl font-bold hover:bg-red-500/30 disabled:opacity-50 transition-colors"
                    >
                      LAND & DISARM
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 max-w-[250px] mx-auto">
                    <div />
                    <button onClick={() => handleManualCommand('forward')} disabled={!isHovering} className="p-4 bg-secondary rounded-xl flex items-center justify-center hover:bg-secondary/80 disabled:opacity-50 transition-colors"><ArrowUp /></button>
                    <div />
                    <button onClick={() => handleManualCommand('left')} disabled={!isHovering} className="p-4 bg-secondary rounded-xl flex items-center justify-center hover:bg-secondary/80 disabled:opacity-50 transition-colors"><ArrowLeft /></button>
                    <button onClick={() => handleManualCommand('backward')} disabled={!isHovering} className="p-4 bg-secondary rounded-xl flex items-center justify-center hover:bg-secondary/80 disabled:opacity-50 transition-colors"><ArrowDown /></button>
                    <button onClick={() => handleManualCommand('right')} disabled={!isHovering} className="p-4 bg-secondary rounded-xl flex items-center justify-center hover:bg-secondary/80 disabled:opacity-50 transition-colors"><ArrowRight /></button>
                  </div>

                  <div className="flex justify-center gap-4">
                    <button onClick={() => handleManualCommand('yaw_left')} disabled={!isHovering} className="p-4 px-6 bg-secondary rounded-xl flex items-center justify-center gap-2 hover:bg-secondary/80 disabled:opacity-50 transition-colors"><RotateCcw className="w-5 h-5" /> Yaw L</button>
                    <button onClick={() => handleManualCommand('yaw_right')} disabled={!isHovering} className="p-4 px-6 bg-secondary rounded-xl flex items-center justify-center gap-2 hover:bg-secondary/80 disabled:opacity-50 transition-colors">Yaw R <RotateCw className="w-5 h-5" /></button>
                  </div>
                </>
              )}
            </div>
          )}

          {mode === 'physics' && (
            <div className="space-y-6">
              <div className="mb-6">
                <h2 className="text-lg font-bold">Environment Parameters</h2>
                <p className="text-sm text-muted-foreground">Simulate real-world aerodynamic forces.</p>
              </div>

              <div className="bg-secondary/30 p-5 rounded-xl border border-border/50 space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-bold flex items-center gap-2"><Wind className="w-4 h-4 text-primary"/> Wind X (Crosswind)</label>
                    <span className="text-sm font-mono text-primary">{windX.toFixed(1)} m/s</span>
                  </div>
                  <input 
                    type="range" 
                    min="-5" max="5" step="0.1" 
                    value={windX} 
                    onChange={(e) => setWindX(parseFloat(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-bold flex items-center gap-2"><Wind className="w-4 h-4 text-accent"/> Wind Z (Head/Tailwind)</label>
                    <span className="text-sm font-mono text-accent">{windZ.toFixed(1)} m/s</span>
                  </div>
                  <input 
                    type="range" 
                    min="-5" max="5" step="0.1" 
                    value={windZ} 
                    onChange={(e) => setWindZ(parseFloat(e.target.value))}
                    className="w-full accent-accent"
                  />
                </div>
              </div>

              <div className="bg-red-500/5 p-5 rounded-xl border border-red-500/20">
                <h3 className="text-sm font-bold text-red-500 mb-2 flex items-center gap-2"><Battery className="w-4 h-4"/> Battery Chemistry</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Simulating a 4S LiPo (16.8V max). Notice the voltage sag when throttle increases due to Internal Resistance (IR).
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Current Voltage:</span>
                  <span className={cn("font-mono font-bold", batteryVoltage < 14.5 ? "text-red-500" : "text-emerald-500")}>
                    {batteryVoltage.toFixed(2)}V
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Area - 3D Canvas & Terminal */}
      <div className="flex-1 relative flex flex-col bg-zinc-950">
        <div className="flex-1 relative">
          <Canvas camera={{ position: [5, 4, 5], fov: 45 }}>
            <color attach="background" args={['#09090b']} />
            <ambientLight intensity={0.6} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.5} castShadow />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />
            
            <PhysicsEngine 
              position={dronePos} 
              setPosition={setDronePos} 
              isHovering={isHovering} 
              windX={windX} 
              windZ={windZ} 
              isRunning={isRunning || isHovering}
            />

            <Suspense fallback={
              <Html center>
                <div className="text-primary font-mono animate-pulse bg-background/80 px-4 py-2 rounded-lg backdrop-blur-sm border border-border">Loading Simulation...</div>
              </Html>
            }>
              <DroneModel 
                buildState={buildState} 
                isHovering={isHovering} 
                position={dronePos}
                rotation={droneRot}
              />
              <Environment preset="city" />
              {/* Grid floor for better spatial awareness */}
              <gridHelper args={[20, 20, '#3f3f46', '#27272a']} position={[0, -0.01, 0]} />
              <ContactShadows position={[0, 0, 0]} opacity={0.5} scale={20} blur={2} far={4.5} />
            </Suspense>
            
            <OrbitControls 
              enablePan={true} 
              enableZoom={true} 
              enableRotate={true}
              minPolarAngle={0}
              maxPolarAngle={Math.PI / 2 - 0.05} // Don't go below ground
            />
          </Canvas>

          {/* Overlay Telemetry */}
          <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-md border border-border/50 p-4 rounded-xl pointer-events-none min-w-[200px]">
            <h3 className="font-mono text-primary text-sm mb-3 uppercase tracking-wider border-b border-border/50 pb-2">Telemetry</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="text-muted-foreground">Status</div>
              <div className={cn("font-mono text-right", isHovering ? "text-emerald-500" : "text-yellow-500")}>
                {isHovering ? 'ARMED' : 'DISARMED'}
              </div>
              <div className="text-muted-foreground">Altitude</div>
              <div className="font-mono text-right">{dronePos[1].toFixed(2)}m</div>
              <div className="text-muted-foreground">Heading</div>
              <div className="font-mono text-right">{((droneRot[1] * 180 / Math.PI) % 360).toFixed(0)}°</div>
              <div className="text-muted-foreground">Voltage</div>
              <div className={cn("font-mono text-right", batteryVoltage < 14.5 ? "text-red-500" : "text-emerald-500")}>
                {batteryVoltage.toFixed(2)}V
              </div>
              <div className="text-muted-foreground">Throttle</div>
              <div className="font-mono text-right">{(throttle * 100).toFixed(0)}%</div>
              <div className="text-muted-foreground">Wind Drift</div>
              <div className="font-mono text-right text-accent">
                {Math.sqrt(windX*windX + windZ*windZ).toFixed(1)}m/s
              </div>
            </div>
          </div>
        </div>

        {/* Terminal / Logs */}
        <div className="h-48 border-t border-border/50 bg-[#0c0c0e] p-4 font-mono text-xs overflow-y-auto flex flex-col">
          <div className="flex items-center gap-2 text-muted-foreground mb-2 sticky top-0 bg-[#0c0c0e] pb-2 border-b border-border/20">
            <Terminal className="w-4 h-4" /> System Logs
          </div>
          <div className="flex-1 space-y-1">
            {logs.map((log, i) => (
              <div key={i} className={
                log.includes('ERROR') ? 'text-red-400' : 
                log.includes('Executing') || log.includes('Manual Override') ? 'text-accent' : 
                'text-emerald-400/70'
              }>
                {log}
              </div>
            ))}
            {/* Empty div to scroll to bottom */}
            <div ref={(el) => el?.scrollIntoView()} />
          </div>
        </div>
      </div>
    </div>
  );
}
