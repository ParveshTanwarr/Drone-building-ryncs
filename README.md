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


## Detailed Installation Guide

### 1. Prerequisites

Ensure you have the following installed on your system:
- Node.js (v18 or higher)
- Git
- A Code Editor (Notepad can also work)

### 2. Clone the Repository

Open your terminal (command prompt) and run:

```
git clone https://github.com/ParveshTanwarr/Drone-building-ryncs.git
cd Drone-Building-ryncs
```
### 3. Environment Configuration

This project requires a Gemini API Key to function.

- Navigate to `C:\Users\"your-username"\Drone-Building-ryncs`
- Open the `.env.example` file using Notepad
- Obtain your key from Google AI Studio by going to `https://aistudio.google.com/` and creating an API key
- Update the following lines in the .env file:
```
GEMINI_API_KEY=your_key_here

APP_URL="http://localhost:3000"
```
- Rename the file to `.env` 

### 4. Install Dependencies

Download the necessary libraries by running this command in the command prompt:
```
npm install
```
### 5. Run the Application

Start the development server:

```
npm run dev
```
The app will be available at `http://localhost:3000`.

`npm run dev`
