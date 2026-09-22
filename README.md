# SocioSolve — Smart Community Safety Platform

SocioSolve is a polished civic issue reporting and response platform designed for a strong hackathon/demo presentation. It connects citizens, smart issue triage, authority workflows, safety alerts and community impact in one interface.

## What's new in this version

### Premium UI/UX
- Modern dark glassmorphism interface
- Gradient brand identity and polished cards
- Responsive desktop/mobile layouts
- Clear visual hierarchy and micro-interactions
- Community Pulse dashboard strip

### New judge-friendly features
- **Community Hub:** impact points, milestones and civic participation actions
- **Privacy-first reporting:** anonymous reporter toggle
- **Save Draft:** keep an unfinished report locally
- **Live report metadata:** character count, estimated report time and privacy indicator
- **Impact analytics:** participation, safety awareness and community activity
- **Live Safety Broadcast concept:** highlights emergency awareness and resolution progress
- Existing AI-assisted category/priority suggestions
- Existing GPS-style location capture
- Existing offline-first local queue
- Existing risk map and authority command center

## Run frontend

```bash
cd frontend
npm install
npm run dev
```

Or on Windows use `RUN_FRONTEND.bat`.

## Run backend

Use `RUN_BACKEND.bat` or follow `backend/README.md`.

> Production integrations such as Firebase FCM, a real map provider, database credentials and ML services remain intentionally configurable rather than hard-coded into the demo package.
