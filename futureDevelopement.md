# 🚀 Future Development Roadmap: Youth Assembly Games

This document outlines a strategic plan to elevate the platform from a simple game collection to an immersive, professional-grade event system.

---

## 🎨 Phase 1: Immersion & Polish (The "Wow" Factor)
*Focus: Improving the look and feel to keep engagement high.*

### 1. Audio Atmosphere Experience
Currently, games are silent unless they are specific audio games.
- **Background Music (BGM) Engine**: 
    - Auto-fade BGM when a video/audio clue plays.
    - Theme-based playlists (e.g., "High Energy", "Suspense", "Chill").
- **Integrated SFX Board**: 
    - A "Soundboard" in the Host Dashboard (separate from game controls) with instant triggers:
    - *Airhorn, Drumroll, Correct (Ding), Incorrect (Buzzer), Applause, Cricket Chirps.*

### 2. High-Fidelity Visuals
- **Animated Backgrounds**: Replace static gradients with slow-moving particle systems (Pixi.js or CSS canvas) that react to game intensity.
- **Transition Systems**: "TV Style" transitions between games (e.g., a logo wipe or shutter effect) instead of instant jumps.
- **Victory States**: When an answer is revealed, trigger a "Confetti Cannon" or "Particles" effect on the projector.

### 3. "Idle Mode" Screensaver
- When no game is active, display a loop of event photos, upcoming schedule, or a dynamic "Waiting for Players..." animation to prevent a black screen.

---

## 🏆 Phase 2: Competition & Interaction
*Focus: structured gameplay and audience participation.*

### 1. Global Scoreboard System
- **Team Management**: Allow defining Teams (e.g., "Red Team vs Blue Team" or dynamic names).
- **Persistent Overlay**: A toggleable visual overlay on the projector showing the current score.
- **Host Controls**: Simple "+10" / "-5" buttons on the sidebar to award points during any game.

### 2. The "Buzzer" App (Big Feature)
- **Concept**: Allow mobile phones to act as buzzers.
- **Tech**: Users scan a QR code projected on screen -> join a room -> get a big button on their phone.
- **Function**: The Host sees *who* buzzed first with millisecond precision. Great for trivia.

---

## 🎲 Phase 3: New Game Concepts
*Expanding the library with TV-show style formats.*

### 1. "Survey Says" (Family Feud Style)
- **Mechanic**: A question with top 5 answers hidden on a board.
- **Host View**: See all answers.
- **Projector View**: Blank slots. Reveal one by one. Include the "X" buzzer for wrong guesses.

### 2. "Grid Trivia" (Jeopardy Style)
- **Mechanic**: A 5x5 grid of categories and point values (100-500).
- **Flow**: User picks "History for 300" -> Card flips to question -> Reveal Answer -> Award points to team.

### 3. "Zoom In" (Visual Mystery)
- **Mechanic**: Show an extreme close-up of an everyday object.
- **Controls**: Host has a slider to "Zoom Out" slowly.
- **Goal**: Teams shout out the object before it's fully clear.

### 4. "Memory Matrix"
- **Mechanic**: A grid of 12-16 cards face down.
- **Flow**: Player picks two numbers -> Cards flip. If match, leave face up. If not, flip back.

### 5. "Decibel Meter" (Crowd Control)
- **Mechanic**: Use the host laptop's microphone.
- **Visual**: A vertical bar/gauge on the projector.
- **Goal**: "Let's see which side of the room is louder!" -> The gauge fills up and breaks "glass" at max volume.

---

## 🛠 Phase 4: Host Productivity (Quality of Life)
*Making the host's job stress-free.*

### 1. Playlist / Run of Show Builder
- Instead of clicking games randomly, allow the host to build a **Queue**:
    1. Welcome Screen
    2. Ice Breaker (Meme)
    3. Main Event (Trivia)
    4. Winner Announcement
- Host just clicks "Next Event" to proceed through the night.

### 2. Search & Filter (Expanded)
- Tag games by: "High Energy", "Ice Breaker", "Team Based", "Visual Only".

### 3. Keyboard Shortcuts
- `Space`: Next Slide
- `Backspace`: Previous Slide
- `R`: Reveal Answer
- `1-9`: Trigger Sound Effects


---

## 🎭 Phase 5: Engagement & Interactive Activities (Non-Game)
*Tools to engage the crowd beyond standard gameplay.*

### 1. Live "Pulse" Polling
- **Concept**: Ask the room a question (e.g., "Pizza or Burgers?").
- **Tech**: Users scan QR -> Tap an option.
- **Visual**: Bars grow in real-time on the projector. Instant feedback loop.

### 2. The Digital Raffle / Lucky Draw
- **Concept**: Pick a random winner efficiently.
- **Input**: Paste a list of names or generate numbers (1-500).
- **Animation**: A rapid-fire cycling of names that slows down and stops on the winner with a celebration effect. Safe, transparent, and exciting.

### 3. Live Q&A Wall
- **Concept**: Audience members submit questions via phone for a speaker/panel.
- **Moderation**: Host receives them, approves the good ones.
- **Projector**: Approved questions appear as cards on the big screen.

### 4. Social Photo Mosaic
- **Concept**: Create a shared memory of the event.
- **Flow**: Users upload photos via a local link.
- **Display**: Photos drift across the screen or form a logo/shape (Mosaic) in real-time.

### 5. "Hotseat" Randomizer
- **Concept**: Select a random person for a stage activity without a full raffle.
- **Mechanic**: "Row 5, Seat 12" generator, or if names are known, a quick "Spotlight" spinner.

### 6. Event Timer / Break Screen
- **Concept**: A dedicated, beautiful countdown for intermission.
- **Features**: "We will resume in: 05:00". Background music auto-plays.

---

## 💡 Quick Wins (Can do now)
1. **Host Notes**: Add a small text field to game data objects (`host_note: "Ask John to come up for this one"`) that only appears on the Host Dashboard.
2. **Timer Presets**: Add buttons for "1 min", "30 sec", "10 sec" instead of just one default timer.
