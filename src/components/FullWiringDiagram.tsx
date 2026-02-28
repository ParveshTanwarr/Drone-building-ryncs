import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Info } from 'lucide-react';

const nodes = [
  { id: 'lipo', label: 'LiPo Battery', x: 50, y: 250, width: 100, height: 60, color: '#ef4444', desc: 'Provides raw power (e.g., 22.2V for 6S). Connects to ESC via XT60 connector.' },
  { id: 'esc', label: '4-in-1 ESC', x: 250, y: 250, width: 120, height: 80, color: '#3b82f6', desc: 'Distributes power to motors and FC. Converts DC to 3-phase AC. Contains MOSFETs.' },
  { id: 'fc', label: 'Flight Controller', x: 500, y: 250, width: 120, height: 80, color: '#10b981', desc: 'The brain. Runs PID loops, reads sensors, sends DShot signals to ESC.' },
  { id: 'm1', label: 'Motor 1', x: 250, y: 100, width: 60, height: 60, color: '#eab308', desc: 'Brushless Motor (Back Right). Driven by 3 phases from ESC.' },
  { id: 'm2', label: 'Motor 2', x: 350, y: 100, width: 60, height: 60, color: '#eab308', desc: 'Brushless Motor (Front Right). Driven by 3 phases from ESC.' },
  { id: 'm3', label: 'Motor 3', x: 250, y: 400, width: 60, height: 60, color: '#eab308', desc: 'Brushless Motor (Back Left). Driven by 3 phases from ESC.' },
  { id: 'm4', label: 'Motor 4', x: 350, y: 400, width: 60, height: 60, color: '#eab308', desc: 'Brushless Motor (Front Left). Driven by 3 phases from ESC.' },
  { id: 'rx', label: 'Receiver (RX)', x: 750, y: 150, width: 100, height: 50, color: '#a855f7', desc: 'Receives radio commands. Uses UART (TX/RX) to talk to FC. Watch out for inverted signals (SBUS) requiring hardware inverters on F4 FCs.' },
  { id: 'vtx', label: 'VTX & Cam', x: 750, y: 250, width: 100, height: 50, color: '#06b6d4', desc: 'Transmits video. FC overlays OSD. Uses UART for SmartAudio/Tramp control. Ground loops here cause video noise!' },
  { id: 'gps', label: 'GPS + Mag', x: 750, y: 350, width: 100, height: 50, color: '#f97316', desc: 'Provides position (UART) and heading (I2C: SDA/SCL). I2C requires pull-up resistors (usually built-in).' },
];

const connections = [
  { from: 'lipo', to: 'esc', label: 'VBAT / GND', color: '#ef4444', path: 'M 150 280 L 250 280' },
  { from: 'esc', to: 'fc', label: 'VBAT / GND / DShot / Curr', color: '#9ca3af', path: 'M 370 290 L 500 290' },
  { from: 'esc', to: 'm1', label: '3-Phase', color: '#fbbf24', path: 'M 280 250 L 280 160' },
  { from: 'esc', to: 'm2', label: '3-Phase', color: '#fbbf24', path: 'M 340 250 L 380 160' },
  { from: 'esc', to: 'm3', label: '3-Phase', color: '#fbbf24', path: 'M 280 330 L 280 400' },
  { from: 'esc', to: 'm4', label: '3-Phase', color: '#fbbf24', path: 'M 340 330 L 380 400' },
  { from: 'fc', to: 'rx', label: 'UART (5V, GND, TX, RX)', color: '#a855f7', path: 'M 620 260 L 680 260 L 680 175 L 750 175' },
  { from: 'fc', to: 'vtx', label: 'Video / UART', color: '#06b6d4', path: 'M 620 290 L 750 290' },
  { from: 'fc', to: 'gps', label: 'UART + I2C', color: '#f97316', path: 'M 620 320 L 680 320 L 680 375 L 750 375' },
];

export default function FullWiringDiagram() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  return (
    <div className="bg-black/60 border border-border/50 rounded-2xl p-6 relative overflow-hidden mt-12">
      <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Info className="w-6 h-6 text-blue-400" />
        Complete Drone Architecture & Wiring
      </h3>
      <p className="text-muted-foreground mb-6">
        Hover over any component to understand its role and connections in the full system.
      </p>
      
      <div className="w-full overflow-x-auto pb-8">
        <svg viewBox="0 0 900 500" className="min-w-[800px] w-full h-auto font-mono text-xs">
          {/* Connections */}
          {connections.map((conn, i) => (
            <g key={i} className={`transition-opacity duration-300 ${hoveredNode && hoveredNode !== conn.from && hoveredNode !== conn.to ? 'opacity-20' : 'opacity-100'}`}>
              <path d={conn.path} stroke={conn.color} strokeWidth="3" fill="none" strokeDasharray={conn.label.includes('I2C') ? '4 4' : 'none'} />
              <text x="0" y="0" fill={conn.color} fontSize="10" transform={`translate(${getMidpoint(conn.path).x}, ${getMidpoint(conn.path).y - 5})`} textAnchor="middle">
                {conn.label}
              </text>
            </g>
          ))}

          {/* Nodes */}
          {nodes.map((node) => (
            <g 
              key={node.id}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              className="cursor-pointer transition-all duration-300"
              style={{ opacity: hoveredNode && hoveredNode !== node.id ? 0.4 : 1 }}
            >
              <rect 
                x={node.x} 
                y={node.y} 
                width={node.width} 
                height={node.height} 
                rx="8" 
                fill="#1f2937" 
                stroke={node.color} 
                strokeWidth={hoveredNode === node.id ? "4" : "2"} 
              />
              <text x={node.x + node.width/2} y={node.y + node.height/2 + 4} fill={node.color} textAnchor="middle" className="font-bold pointer-events-none">
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Info Panel */}
      <AnimatePresence>
        {hoveredNode && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-6 left-6 right-6 bg-secondary/95 backdrop-blur-md border border-border p-4 rounded-xl shadow-xl pointer-events-none z-10"
          >
            <h4 className="font-bold text-lg" style={{ color: nodes.find(n => n.id === hoveredNode)?.color }}>
              {nodes.find(n => n.id === hoveredNode)?.label}
            </h4>
            <p className="text-foreground/80 mt-1">
              {nodes.find(n => n.id === hoveredNode)?.desc}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getMidpoint(path: string) {
  const parts = path.split(' ');
  if (parts.length === 7) { 
    return { x: (parseFloat(parts[1]) + parseFloat(parts[4])) / 2, y: (parseFloat(parts[2]) + parseFloat(parts[5])) / 2 };
  } else if (parts.length === 10) { 
    return { x: parseFloat(parts[4]), y: parseFloat(parts[5]) };
  }
  return { x: 0, y: 0 };
}
