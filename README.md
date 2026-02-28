# VTOL Drone Project (Rynx)

I started this project to understand how real drones work — not just simulations.

Current goal:
→ Build a working quadplane VTOL system from scratch

Status:
- Frame design: Not finalized
- Flight controller: Learning phase
- Simulation: Planned
- Hardware: Not purchased yet

Why I'm building this:
I want to move into aerospace / robotics and eventually build advanced autonomous systems.

What I know:
- Basic Python
- Basic electronics (learning)

What I don't know (yet):
- Flight control tuning
- PX4 / ArduPilot setup
- Sensor fusion
to be contuined 
more changes soon ig



Insturctions:
  install git
  install python
  vs code also
  ubnantu for better running

now:
  git clone https://github.com/ParveshTanwarr/Drone-building-ryncs.git
cd Drone-building-ryncs

create python virtual enviorment:
  python -m venv venv

install dependcies:
  pip install -r requirements.txt
if not presenet then manually:
    pip install mavsdk asyncio numpy matplotlib

running PID
go to control folder
   cd control
  run PID simulation
  python pid_test.py


  etcetc
