import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, Plane, Cpu, Wrench } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="relative w-full h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Grid & Glow */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-50 pointer-events-none"></div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm"
            >
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              Interactive Drone Engineering Academy
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter max-w-4xl"
            >
              Master the Art of <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                Drone Engineering
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto max-w-[700px] text-muted-foreground md:text-xl"
            >
              From basic aerodynamics to advanced autonomous UAVs. Build, simulate, and understand every component with our ultra-realistic interactive platform.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                to="/learn"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-12 px-8"
              >
                Start Learning Path
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                to="/simulator"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-12 px-8"
              >
                Launch 3D Simulator
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary/30 border-t border-border/50">
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-background p-6 hover:border-primary/50 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                <Plane className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Aerodynamics & Physics</h3>
              <p className="text-muted-foreground mb-4">
                Understand thrust, lift, drag, and torque. Interactive visualizations of airflow and stability principles.
              </p>
              <Link to="/learn" className="inline-flex items-center text-sm font-medium text-primary group-hover:underline">
                Explore Physics <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-background p-6 hover:border-accent/50 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent mb-4">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Component Breakdown</h3>
              <p className="text-muted-foreground mb-4">
                Deep dive into Motors, ESCs, Flight Controllers, and Sensors. Learn how to choose and integrate them.
              </p>
              <Link to="/components" className="inline-flex items-center text-sm font-medium text-accent group-hover:underline">
                View Components <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-background p-6 hover:border-emerald-500/50 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 mb-4">
                <Wrench className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Step-by-Step Build</h3>
              <p className="text-muted-foreground mb-4">
                From frame assembly to first flight testing. Detailed guides on soldering, wiring, and firmware setup.
              </p>
              <Link to="/build" className="inline-flex items-center text-sm font-medium text-emerald-500 group-hover:underline">
                Start Building <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
