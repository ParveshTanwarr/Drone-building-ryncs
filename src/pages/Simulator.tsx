import React, { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'motion/react';
import DroneModel, { BuildState } from '../components/3d/DroneModel';
import { Play, Square, Wrench, Code, Terminal, CheckCircle2, Circle, BookOpen, Wind, Battery, SlidersHorizontal, Gamepad2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw, RotateCw, Info, Target, AlertTriangle, Keyboard } from 'lucide-react';
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

// Component Specifications for Weight & Thrust calculations
const COMPONENT_SPECS = {
  frame: { weight: 150, thrust: 0 },
  motors: { weight: 120, thrust: 3200 }, // Total thrust for 4 motors
  esc: { weight: 20, thrust: 0 },
  fc: { weight: 10, thrust: 0 },
  camera: { weight: 15, thrust: 0 },
  battery: { weight: 250, thrust: 0 },
  props: { weight: 20, thrust: 0 },
  wings: { weight: 200, thrust: 0 },
};

// A wrapper component to handle physics updates within the Canvas
function PhysicsEngine({ 
  position, 
  setPosition, 
  rotation,
  setRotation,
  isHovering, 
  windX, 
  windZ,
  isRunning,
  pGain,
  crashed
}: { 
  position: [number, number, number], 
  setPosition: React.Dispatch<React.SetStateAction<[number, number, number]>>,
  rotation: [number, number, number],
  setRotation: React.Dispatch<React.SetStateAction<[number, number, number]>>,
  isHovering: boolean,
  windX: number,
  windZ: number,
  isRunning: boolean,
  pGain: number,
  crashed: boolean
}) {
  useFrame((state, delta) => {
    if (crashed) return;

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

      // PID Wobble Simulation
      if (pGain !== 1.0) {
        const time = state.clock.elapsedTime;
        let wobbleX = 0;
        let wobbleZ = 0;
        
        if (pGain < 0.8) {
          // Sluggish, slow drift/wobble
          wobbleX = Math.sin(time * 2) * (1.0 - pGain) * 0.2;
          wobbleZ = Math.cos(time * 2.5) * (1.0 - pGain) * 0.2;
        } else if (pGain > 1.2) {
          // Overcompensated, rapid oscillation
          wobbleX = Math.sin(time * 20) * (pGain - 1.0) * 0.1;
          wobbleZ = Math.cos(time * 20) * (pGain - 1.0) * 0.1;
        }
        
        // Update rotation if significant
        if (Math.abs(wobbleX) > 0.01 || Math.abs(wobbleZ) > 0.01) {
          setRotation([wobbleX, rotation[1], wobbleZ]);
        }
      } else if (rotation[0] !== 0 || rotation[2] !== 0) {
        setRotation([0, rotation[1], 0]);
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
  const terminalRef = useRef<HTMLDivElement>(null);
  const [droneType, setDroneType] = useState<DroneType>('quadcopter');
  const [keyboardEnabled, setKeyboardEnabled] = useState(false);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);
  
  // Drone State
  const [dronePos, setDronePos] = useState<[number, number, number]>([0, 0, 0]);
  const [droneRot, setDroneRot] = useState<[number, number, number]>([0, 0, 0]);

  // Physics State
  const [windX, setWindX] = useState(0);
  const [windZ, setWindZ] = useState(0);
  const [batteryVoltage, setBatteryVoltage] = useState(16.8); // 4S LiPo fully charged
  const [throttle, setThrottle] = useState(0);
  const [pGain, setPGain] = useState(1.0);
  const [crashed, setCrashed] = useState(false);
  const [activeMission, setActiveMission] = useState('free');

  // Build State
  const [buildState, setBuildState] = useState<BuildState>({
    frame: true,
    motors: false,
    esc: false,
    fc: false,
    battery: false,
    props: false,
    camera: false,
    wings: false,
  });

  const isFullyBuilt = droneType === 'quadcopter' 
    ? buildState.frame && buildState.motors && buildState.esc && buildState.fc && buildState.battery && buildState.props
    : buildState.frame && buildState.motors && buildState.esc && buildState.fc && buildState.battery && buildState.props && buildState.wings;

  // Calculate Weight and Thrust
  const totalWeight = Object.entries(buildState).reduce((acc, [key, isInstalled]) => {
    return acc + (isInstalled && COMPONENT_SPECS[key as keyof typeof COMPONENT_SPECS] ? COMPONENT_SPECS[key as keyof typeof COMPONENT_SPECS].weight : 0);
  }, 0);
  const maxThrust = buildState.motors && buildState.props && buildState.battery 
    ? (droneType === 'quadcopter' ? COMPONENT_SPECS.motors.thrust : 2000) 
    : 0;
  const twr = maxThrust > 0 ? (maxThrust / totalWeight).toFixed(1) : '0.0';
  const canFly = parseFloat(twr) > 1.2;

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

  useEffect(() => {
    if (!keyboardEnabled || !isFullyBuilt || crashed) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['w','a','s','d','arrowup','arrowdown','q','e'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
      switch(e.key.toLowerCase()) {
        case 'w': handleManualCommand('forward'); break;
        case 's': handleManualCommand('backward'); break;
        case 'a': handleManualCommand('left'); break;
        case 'd': handleManualCommand('right'); break;
        case 'q': handleManualCommand('yaw_left'); break;
        case 'e': handleManualCommand('yaw_right'); break;
        case 'arrowup': handleManualCommand('takeoff'); break;
        case 'arrowdown': handleManualCommand('land'); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyboardEnabled, isFullyBuilt, crashed, dronePos, droneRot]);

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
    if (!canFly) {
      addLog("ERROR: Thrust-to-Weight Ratio too low. Cannot takeoff.");
      return;
    }
    if (crashed) {
      addLog("ERROR: Drone is crashed. Reset required.");
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
      } else if (line.startsWith('waypoint(')) {
        const match = line.match(/waypoint\(([-.\d]+),\s*([-.\d]+)\)/);
        if (match) {
          const targetX = parseFloat(match[1]);
          const targetZ = parseFloat(match[2]);
          setThrottle(0.6);
          setDronePos(prev => [targetX, prev[1], targetZ]);
          await new Promise(r => setTimeout(r, 2000));
          setThrottle(0.3);
        }
      } else if (line.startsWith('print_telemetry()')) {
        addLog(`Telemetry - Alt: ${dronePos[1].toFixed(1)}m, Bat: ${batteryVoltage.toFixed(1)}V`);
      } else {
        addLog(`Unknown command: ${line}`);
      }

      // Mission Checks
      if (activeMission === 'hoop') {
        // Check if drone is near the hoop at [0, 3, -5]
        const dist = Math.sqrt(Math.pow(dronePos[0], 2) + Math.pow(dronePos[1] - 3, 2) + Math.pow(dronePos[2] - (-5), 2));
        if (dist < 1.5) {
          addLog("MISSION COMPLETE: Passed through hoop!");
          setActiveMission('free');
        }
      }
    }
    
    addLog("Execution finished.");
    setIsRunning(false);
    setThrottle(0);
  };

  const stopCode = () => {
    setIsRunning(false);
    setIsHovering(false);
    setCrashed(false);
    setThrottle(0);
    setDronePos([0,0,0]);
    setDroneRot([0,0,0]);
    addLog("Execution stopped. Drone reset.");
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-3.5rem)] overflow-hidden bg-background relative z-10">
      
      {/* Left Sidebar - Controls */}
      <div className="w-full md:w-[420px] border-r border-border/50 flex flex-col bg-card/40 backdrop-blur-xl z-20 shadow-2xl">
        <div className="p-4 border-b border-border/50">
          <div className="flex bg-secondary/50 p-1 rounded-xl border border-border/50 backdrop-blur-sm">
            <button 
              onClick={() => setMode('build')}
              className={cn("flex-1 py-2.5 flex items-center justify-center gap-2 text-sm font-medium transition-all rounded-lg", mode === 'build' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
            >
              <Wrench className="w-4 h-4" /> Build
            </button>
            <button 
              onClick={() => setMode('code')}
              className={cn("flex-1 py-2.5 flex items-center justify-center gap-2 text-sm font-medium transition-all rounded-lg", mode === 'code' ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
            >
              <Code className="w-4 h-4" /> Code
            </button>
            <button 
              onClick={() => setMode('control')}
              className={cn("flex-1 py-2.5 flex items-center justify-center gap-2 text-sm font-medium transition-all rounded-lg", mode === 'control' ? "bg-orange-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground")}
            >
              <Gamepad2 className="w-4 h-4" /> Fly
            </button>
            <button 
              onClick={() => setMode('physics')}
              className={cn("flex-1 py-2.5 flex items-center justify-center gap-2 text-sm font-medium transition-all rounded-lg", mode === 'physics' ? "bg-emerald-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground")}
            >
              <SlidersHorizontal className="w-4 h-4" /> Physics
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col custom-scrollbar">
          {mode === 'build' && (
            <div className="space-y-4">
              <div className="mb-6">
                <h2 className="text-lg font-bold">Assembly Bay</h2>
                <p className="text-sm text-muted-foreground">Click components to install them on the frame.</p>
              </div>

              <div className="flex gap-2 mb-4">
                <button 
                  onClick={() => setDroneType('quadcopter')}
                  className={cn("flex-1 py-2 text-xs font-bold rounded-lg border transition-all", droneType === 'quadcopter' ? "bg-primary/20 border-primary text-primary" : "border-border/50 text-muted-foreground hover:bg-secondary")}
                >
                  Quadcopter
                </button>
                <button 
                  onClick={() => setDroneType('fixed-wing')}
                  className={cn("flex-1 py-2 text-xs font-bold rounded-lg border transition-all", droneType === 'fixed-wing' ? "bg-primary/20 border-primary text-primary" : "border-border/50 text-muted-foreground hover:bg-secondary")}
                >
                  VTOL Fixed-Wing
                </button>
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

              {droneType === 'fixed-wing' && (
                <button 
                  onClick={() => toggleComponent('wings')}
                  className={cn("w-full flex items-center justify-between p-3 rounded-xl border transition-all", buildState.wings ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "bg-secondary/50 border-border/50 text-muted-foreground hover:border-primary/50")}
                >
                  <div className="flex items-center gap-3">
                    {buildState.wings ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                    <span className="font-medium">Aerodynamic Wings & Tail</span>
                  </div>
                  <span className="text-xs font-mono opacity-70">200g</span>
                </button>
              )}
              
              <div className="mt-8 p-4 bg-secondary/30 rounded-xl border border-border/50">
                <h3 className="text-sm font-bold mb-3">Drone Specifications</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-background rounded-lg border border-border/50">
                    <div className="text-xs text-muted-foreground mb-1">Total Weight</div>
                    <div className="font-mono font-bold">{totalWeight}g</div>
                  </div>
                  <div className="p-3 bg-background rounded-lg border border-border/50">
                    <div className="text-xs text-muted-foreground mb-1">Max Thrust</div>
                    <div className="font-mono font-bold">{maxThrust}g</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border/50 mb-4">
                  <div className="text-sm font-medium">Thrust-to-Weight Ratio</div>
                  <div className={cn("font-mono font-bold", parseFloat(twr) < 1.2 ? "text-red-500" : "text-emerald-500")}>
                    {twr} : 1
                  </div>
                </div>

                <h3 className="text-sm font-bold mb-2">Status</h3>
                {isFullyBuilt ? (
                  canFly ? (
                    <p className="text-sm text-emerald-500 flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Ready for flight</p>
                  ) : (
                    <p className="text-sm text-red-500 flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> TWR too low. Drone cannot lift off.</p>
                  )
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
                <div className="flex gap-2">
                  <select 
                    value={activeMission}
                    onChange={(e) => setActiveMission(e.target.value)}
                    className="bg-secondary text-sm rounded-lg px-3 py-1.5 border border-border/50 focus:outline-none focus:border-primary"
                  >
                    <option value="free">Free Flight</option>
                    <option value="hoop">Mission: Hoop Challenge</option>
                  </select>
                  <button 
                    onClick={() => setShowGuide(!showGuide)}
                    className="p-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                    title="Toggle Code Guide"
                  >
                    <BookOpen className="w-5 h-5 text-accent" />
                  </button>
                </div>
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

                    <div>
                      <code className="text-primary font-bold bg-primary/10 px-1 rounded">waypoint(x, z)</code>
                      <p className="text-xs mt-1">Flies directly to the specified X and Z coordinates. E.g., <code>waypoint(0, -5)</code></p>
                    </div>

                    <div>
                      <code className="text-primary font-bold bg-primary/10 px-1 rounded">print_telemetry()</code>
                      <p className="text-xs mt-1">Reads sensor data (Altitude, Battery) and prints it to the terminal.</p>
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
                  <div className="bg-secondary/30 p-5 rounded-xl border border-border/50 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold flex items-center gap-2"><Keyboard className="w-4 h-4 text-primary"/> Keyboard Controls</h3>
                      <button 
                        onClick={() => setKeyboardEnabled(!keyboardEnabled)}
                        className={cn("px-3 py-1 text-xs font-bold rounded-full transition-all", keyboardEnabled ? "bg-emerald-500 text-white" : "bg-secondary text-muted-foreground hover:bg-secondary/80")}
                      >
                        {keyboardEnabled ? 'ENABLED' : 'DISABLED'}
                      </button>
                    </div>
                    {keyboardEnabled && (
                      <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground font-mono bg-background/50 p-3 rounded-lg border border-border/50">
                        <div><strong className="text-foreground">W / S</strong> : Forward / Backward</div>
                        <div><strong className="text-foreground">A / D</strong> : Strafe Left / Right</div>
                        <div><strong className="text-foreground">↑ / ↓</strong> : Takeoff / Land</div>
                        <div><strong className="text-foreground">Q / E</strong> : Yaw Left / Right</div>
                      </div>
                    )}
                  </div>

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
                    <label className="text-sm font-bold flex items-center gap-2"><Target className="w-4 h-4 text-purple-500"/> PID Tuning (P-Gain)</label>
                    <span className="text-sm font-mono text-purple-500">{pGain.toFixed(1)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">Adjust the Proportional gain. Too low = sluggish/wobble. Too high = rapid oscillation.</p>
                  <input 
                    type="range" 
                    min="0.1" max="2.5" step="0.1" 
                    value={pGain} 
                    onChange={(e) => setPGain(parseFloat(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>

                <div className="border-t border-border/50 pt-6">
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
      <div className="flex-1 relative flex flex-col bg-zinc-950/50 backdrop-blur-sm">
        <div className="flex-1 relative">
          <Canvas camera={{ position: [5, 4, 5], fov: 45 }}>
            <color attach="background" args={['transparent']} />
            <ambientLight intensity={0.6} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.5} castShadow />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />
            
            <PhysicsEngine 
              position={dronePos} 
              setPosition={setDronePos} 
              rotation={droneRot}
              setRotation={setDroneRot}
              isHovering={isHovering} 
              windX={windX} 
              windZ={windZ} 
              isRunning={isRunning || isHovering}
              pGain={pGain}
              crashed={crashed}
            />

            <Suspense fallback={
              <Html center>
                <div className="text-primary font-mono animate-pulse bg-background/80 px-4 py-2 rounded-lg backdrop-blur-sm border border-border">Loading Simulation...</div>
              </Html>
            }>
              <DroneModel 
                buildState={buildState} 
                isHovering={isHovering && !crashed} 
                position={dronePos}
                rotation={droneRot}
                type={droneType}
              />
              
              {/* Mission Objects */}
              {activeMission === 'hoop' && (
                <mesh position={[0, 3, -5]}>
                  <torusGeometry args={[1.5, 0.1, 16, 100]} />
                  <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.5} />
                  <Html position={[0, 2, 0]} center>
                    <div className="bg-background/80 backdrop-blur px-2 py-1 rounded border border-orange-500/50 text-orange-500 text-xs font-bold whitespace-nowrap">
                      TARGET WAYPOINT
                    </div>
                  </Html>
                </mesh>
              )}

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
        <div ref={terminalRef} className="h-56 border-t border-border/50 bg-[#0c0c0e]/90 backdrop-blur-xl p-4 font-mono text-xs overflow-y-auto flex flex-col custom-scrollbar shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20">
          <div className="flex items-center justify-between text-muted-foreground mb-3 sticky top-0 bg-[#0c0c0e]/90 backdrop-blur pb-2 border-b border-border/20">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primary" /> 
              <span className="font-bold tracking-wider uppercase text-[10px]">Flight Computer Telemetry</span>
            </div>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
            </div>
          </div>
          <div className="flex-1 space-y-1.5 pl-2 border-l-2 border-border/30">
            {logs.map((log, i) => (
              <div key={i} className={cn(
                "pl-2 relative before:content-['>'] before:absolute before:-left-3 before:text-muted-foreground/50",
                log.includes('ERROR') ? 'text-red-400' : 
                log.includes('Executing') || log.includes('Manual Override') ? 'text-accent' : 
                'text-emerald-400/80'
              )}>
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
