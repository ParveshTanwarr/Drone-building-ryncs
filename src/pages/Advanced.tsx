import React from 'react';
import { motion } from 'motion/react';
import { Satellite, ShieldCheck, Map, Wifi, BrainCircuit, Rocket, Code, Terminal, Network } from 'lucide-react';

const sections = [
  {
    title: "AI, SLAM & Object Tracking",
    icon: BrainCircuit,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    content: "Advanced tracking utilizes a Companion Computer (Nvidia Jetson Orin) connected to the Flight Controller via MAVLink. For GPS-denied environments, drones use SLAM (Simultaneous Localization and Mapping). Stereo cameras or LiDAR generate a 3D Point Cloud. Algorithms like ICP (Iterative Closest Point) compare sequential point clouds to determine the drone's exact movement (Visual Odometry). For tracking, neural networks (YOLOv8) detect objects, calculate bounding box centroids, and feed error vectors to a PID controller that outputs MAVLink velocity commands to keep the target centered."
  },
  {
    title: "Surveillance, Defense & Swarms",
    icon: ShieldCheck,
    color: "text-red-500",
    bg: "bg-red-500/10",
    content: "Military-grade UAVs use hybrid gas-electric generators for 10+ hour endurance. They carry multi-sensor payloads: EO/IR (Electro-Optical/Infrared) gimbals with laser rangefinders. Communications utilize FHSS (Frequency-Hopping Spread Spectrum) and AES-256 encryption to defeat electronic warfare jamming. Advanced defense systems employ Swarm Intelligence using the Boids algorithm and mesh networking (BATMAN-adv protocol), allowing hundreds of drones to coordinate search patterns without a central server."
  },
  {
    title: "Sensor Fusion & State Estimation",
    icon: Network,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    content: "A drone never trusts a single sensor. It uses an Extended Kalman Filter (EKF). The EKF is a mathematical algorithm that fuses noisy, high-rate data from the IMU (accelerometer/gyro) with accurate, low-rate data from GPS, Barometer, and Magnetometer. It predicts the drone's state, measures the actual state, and calculates the optimal estimate. This is why a drone can maintain a perfect hover even if the GPS signal momentarily drops."
  },
  {
    title: "Payloads: Actuators & Delivery",
    icon: Rocket,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    content: "To physically interact with the world (dropping packages, deploying sensors), drones use PWM-controlled servo motors or electromagnetic latches. In ArduPilot, you assign a logical 'RC Channel' to a physical 'Servo Output' pin. You can trigger this manually via your radio transmitter, or programmatically via a Python script (`vehicle.channels.overrides['8'] = 2000`) when the drone reaches a specific GPS waypoint."
  },
  {
    title: "Beyond Visual Line of Sight (BVLOS)",
    icon: Wifi,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    content: "Flying beyond the horizon requires robust telemetry. While 900MHz UHF links (Crossfire/DragonLink) provide 30km+ range, true BVLOS uses 4G/LTE or 5G cellular modems. The drone connects to the internet, streaming telemetry and video via WebRTC to a Ground Control Station anywhere in the world. Satellite communication (Iridium) is used as a fallback for oceanic or remote flights."
  },
  {
    title: "Languages, Code & ROS",
    icon: Code,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    content: "Flight Controllers run hard-real-time C++ firmware (ArduPilot/PX4). However, researchers write high-level logic in Python or C++ using ROS (Robot Operating System). ROS provides a publish/subscribe architecture. A camera node publishes image data, a vision node subscribes to it and publishes target coordinates, and a MAVROS node translates those coordinates into MAVLink commands sent to the Flight Controller."
  }
];

export default function Advanced() {
  return (
    <div className="container max-w-6xl py-10 px-4 md:px-8 overflow-y-auto">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Advanced UAV Engineering & Autonomy</h1>
        <p className="text-xl text-muted-foreground">
          Research-grade concepts: SLAM, Sensor Fusion, Swarm Intelligence, and ROS Integration.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {sections.map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex gap-6 p-6 rounded-2xl border border-border/50 bg-card hover:border-primary/30 transition-colors"
          >
            <div className={`w-14 h-14 shrink-0 rounded-xl ${section.bg} ${section.color} flex items-center justify-center`}>
              <section.icon className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3">{section.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {section.content}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-16 p-8 rounded-3xl border border-primary/20 bg-primary/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10 max-w-4xl">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Terminal className="text-primary" /> Research Environment Setup
          </h2>
          <div className="space-y-6 text-muted-foreground">
            <p>To develop advanced autonomous systems, you must set up a proper Software In The Loop (SITL) and hardware environment:</p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-background/50 p-5 rounded-xl border border-border">
                <h4 className="font-bold text-foreground mb-2">1. Ground Station Laptop</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>OS: Ubuntu Linux 20.04/22.04 (Native or WSL2).</li>
                  <li>Install <strong>ROS 2 (Robot Operating System)</strong>.</li>
                  <li>Install <strong>QGroundControl</strong> for mission planning.</li>
                  <li>Install <strong>Gazebo</strong> for 3D physics simulation.</li>
                  <li>Python 3 with <code>dronekit</code>, <code>pymavlink</code>, and <code>opencv-python</code>.</li>
                </ul>
              </div>
              
              <div className="bg-background/50 p-5 rounded-xl border border-border">
                <h4 className="font-bold text-foreground mb-2">2. Onboard Hardware</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><strong>Flight Controller:</strong> Pixhawk 6C running ArduPilot (handles low-level PID/EKF).</li>
                  <li><strong>Companion Computer:</strong> Nvidia Jetson Orin Nano (handles AI/Vision).</li>
                  <li><strong>Connection:</strong> Connect Jetson TX/RX pins to Pixhawk TELEM2 port.</li>
                  <li><strong>Sensors:</strong> Intel RealSense Depth Camera connected to Jetson via USB 3.0.</li>
                </ul>
              </div>
            </div>

            <div className="bg-[#1e1e1e] p-4 rounded-xl border border-border font-mono text-xs text-emerald-400 overflow-x-auto">
              <div className="text-muted-foreground mb-1"># Example: Python DroneKit script running on Companion Computer</div>
              <div>from dronekit import connect, VehicleMode</div>
              <div>import time</div>
              <br/>
              <div># Connect to Flight Controller via UART</div>
              <div>vehicle = connect('/dev/ttyTHS1', baud=921600)</div>
              <br/>
              <div># Arm and Takeoff</div>
              <div>vehicle.mode = VehicleMode("GUIDED")</div>
              <div>vehicle.armed = True</div>
              <div>vehicle.simple_takeoff(10) # Take off to 10 meters</div>
              <br/>
              <div># Send velocity vector based on AI vision tracking</div>
              <div># send_ned_velocity(velocity_x, velocity_y, velocity_z)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
