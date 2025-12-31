const gamesApp = {
    state: {
        isProjector: false,
        gameChannel: new BroadcastChannel('game_channel'),
        currentGame: null,
        currentIndex: 0,
        gameState: {}, // For dynamic things like timers, slider values
    },

    init() {
        this.checkMode();
        this.cacheDOM();
        this.bindEvents();
        this.startClock();

        if (this.state.isProjector) {
            this.initProjectorMode();
        } else {
            this.initHostMode();
        }
    },

    checkMode() {
        const urlParams = new URLSearchParams(window.location.search);
        this.state.isProjector = urlParams.get('mode') === 'projector';
        if (this.state.isProjector) {
            document.body.classList.add('mode-projector');
        }
    },

    cacheDOM() {
        this.dom = {
            app: document.getElementById('app'),
            gameContainer: document.getElementById('game-container'),
            hostPanel: document.getElementById('host-panel-container'),
            dynamicControls: document.getElementById('dynamic-host-controls'),
            clock: document.getElementById('main-clock'),
            currentGameIndicator: document.getElementById('current-game-indicator'),
            projectorOverlay: document.getElementById('projector-overlay')
        };
    },

    bindEvents() {
        this.state.gameChannel.onmessage = (event) => {
            if (this.state.isProjector) {
                this.handleProjectorMessage(event.data);
            }
        };

        if (this.state.isProjector) {
            this.dom.projectorOverlay.addEventListener('click', () => {
                this.dom.projectorOverlay.classList.add('hidden');
                // Could init audio context here if needed
            });
        }
    },

    // --- Host Logic ---

    initHostMode() {
        this.renderSidebarGameList();
        this.renderHome();

        // Add preview label to main display
        const mainDisp = document.querySelector('.main-display');
        if (mainDisp && !mainDisp.querySelector('.preview-label')) {
            const label = document.createElement('div');
            label.className = 'preview-label';
            label.innerText = 'Live Preview';
            mainDisp.appendChild(label);
        }
    },

    switchTab(tabName) {
        // Toggle buttons
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        const btn = document.querySelector(`.tab-btn[onclick*="${tabName}"]`);
        if (btn) btn.classList.add('active');

        // Toggle content
        document.querySelectorAll('.sidebar-tab-content').forEach(c => c.classList.remove('active'));
        const content = document.getElementById(`tab-${tabName}`);
        if (content) content.classList.add('active');
    },

    renderSidebarGameList() {
        const list = document.getElementById('sidebar-games-list');
        if (!list) return;

        let html = '';
        if (typeof GAMES_DATA !== 'undefined') {
            Object.keys(GAMES_DATA).forEach(key => {
                const game = GAMES_DATA[key];
                html += `
                    <div class="mini-game-card" onclick="gamesApp.loadGame('${key}')">
                        <i class="fas ${game.icon}"></i>
                        <div style="text-align:left;">
                            <h4>${game.title}</h4>
                            <small class="text-muted" style="font-size:0.7em;">${game.type.replace('_', ' ')}</small>
                        </div>
                    </div>
                `;
            });
        }
        list.innerHTML = html;
    },


    filterGames(query) {
        const term = query.toLowerCase();
        const items = document.querySelectorAll('.mini-game-card');
        items.forEach(item => {
            const title = item.querySelector('h4').innerText.toLowerCase();
            if (title.includes(term)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    },

    openProjectorWindow() {
        window.open(window.location.href + '?mode=projector', 'ProjectorWindow', 'width=1280,height=720');
    },

    syncState(type, payload = {}) {
        const message = {
            type: type,
            gameId: this.state.currentGame,
            index: this.state.currentIndex,
            ...payload
        };
        this.state.gameChannel.postMessage(message);

        // Host also needs to reflect changes in its "Preview" area (Main Display)
        // We reuse the projector handler for preview consistency
        this.handleProjectorMessage(message);
    },

    renderHome() {
        this.state.currentGame = null;
        this.state.currentIndex = 0;

        // Update Sidebar: Switch to Games tab, Hide "Now Playing"
        this.switchTab('games');
        const header = document.getElementById('current-game-header');
        if (header) header.style.display = 'none';

        // Render Splash Screen in Preview
        const splashHtml = `
            <div class="splash-screen fade-in">
                <div class="splash-icon"><i class="fas fa-rocket"></i></div>
                <h1 class="splash-title">Youth Assembly</h1>
                <div class="splash-subtitle">Games Platform</div>
                <p class="text-muted mt-4">Waiting for activity...</p>
            </div>
        `;

        this.dom.gameContainer.innerHTML = splashHtml;
        this.syncState('NAVIGATE_HOME');
    },



    loadGame(gameId) {
        if (!GAMES_DATA[gameId]) return;
        this.state.currentGame = gameId;
        this.state.currentIndex = -1; // Start at Title Screen
        this.state.gameState = {}; // Reset local game state

        const game = GAMES_DATA[gameId];

        /* Update Sidebar Headers */
        const header = document.getElementById('current-game-header');
        if (header) {
            header.style.display = 'block';
            const title = document.getElementById('active-game-title');
            if (title) title.innerText = game.title;
        }

        // Switch to Controls Tab automatically
        this.switchTab('controls');

        // Render Controls first
        this.renderHostControls(gameId);

        // Sync to Projector (and Self Preview)
        this.syncState('LOAD_GAME');
    },

    renderHostControls(gameId) {
        const game = GAMES_DATA[gameId];
        let html = '';

        // 1. Navigation Deck (Prominent)
        html += `
            <div class="control-deck">
                <div class="deck-header">Navigation</div>
                <div class="transport-bar">
                    <button class="btn btn-lg btn-outline flex-1" onclick="gamesApp.prevItem()">
                        <i class="fas fa-chevron-left"></i> Prev
                    </button>
                    <div class="transport-status">
                        <span class="ts-label">Item</span>
                        <span class="ts-val" id="ctrl-current-index">${this.state.currentIndex === -1 ? 'Title' : this.state.currentIndex + 1}</span>
                        <span class="ts-total">/ ${game.content.length}</span>
                    </div>
                    <button class="btn btn-lg btn-primary flex-1" onclick="gamesApp.nextItem()">
                        Next <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        `;

        // 2. Actions Deck (Game Specific)
        html += `<div class="control-deck"><div class="deck-header">Game Actions</div><div class="actions-grid">`;

        if (game.type === 'slider_reveal') {
            html += `
                <div class="action-card full-width">
                    <label>Blur Level</label>
                    <input type="range" min="0" max="60" value="60" class="custom-range" 
                           oninput="gamesApp.syncState('UPDATE_STATE', { blur: this.value })">
                </div>
            `;
        }
        else if (game.type === 'timed_clues') {
            html += `
                <button class="btn btn-xl btn-success" onclick="gamesApp.syncState('REVEAL_NEXT_CLUE')">
                    <i class="fas fa-eye"></i> Reveal Clue
                </button>
                <button class="btn btn-xl btn-accent" onclick="gamesApp.syncState('REVEAL_ALL')">
                    <i class="fas fa-lightbulb"></i> Show Answer
                </button>
            `;
        }
        else if (game.type === 'reveal_timer' || game.type === 'reveal_answer') {
            html += `
                <button class="btn btn-xl btn-accent full-width" onclick="gamesApp.syncState('REVEAL_ANSWER')">
                    <i class="fas fa-magic"></i> Reveal Answer
                </button>
            `;
        }
        else if (game.type === 'image_display') { // Meme
            html += `
                <div class="action-card full-width" style="gap:10px; display:flex; flex-direction:column;">
                    <input type="text" class="form-control" placeholder="Type caption..." 
                           oninput="gamesApp.syncState('UPDATE_STATE', { caption: this.value })">
                    <button class="btn btn-outline" onclick="gamesApp.syncState('CLEAR_CAPTION')">Clear Caption</button>
                </div>
            `;
        }
        else if (game.type === 'audio_play') {
            html += `
                <button class="btn btn-xl btn-success" onclick="gamesApp.syncState('PLAY_AUDIO')">
                    <i class="fas fa-play"></i> Play
                </button>
                <button class="btn btn-xl btn-danger" onclick="gamesApp.syncState('STOP_AUDIO')">
                    <i class="fas fa-stop"></i> Stop
                </button>
            `;
        }
        else if (game.type === 'text_complete' || game.type === 'word_chain') {
            if (game.type === 'text_complete') {
                html += `
                    <button class="btn btn-xl btn-success" onclick="gamesApp.syncState('REVEAL_NEXT_CLUE')">
                        <i class="fas fa-eye"></i> Reveal Clue
                    </button>
                    <button class="btn btn-xl btn-accent" onclick="gamesApp.syncState('REVEAL_ALL')">
                        <i class="fas fa-font"></i> Show Answer
                    </button>
                `;
            } else {
                html += `<div class="text-muted text-center full-width">Use Navigation to control words.</div>`;
            }
        }
        else if (game.type === 'challenge_timer') {
            html += `
                <button class="btn btn-xl btn-success" onclick="gamesApp.syncState('START_TIMER')">
                    <i class="fas fa-stopwatch"></i> Start 30s
                </button>
                <button class="btn btn-xl btn-outline-danger" onclick="gamesApp.syncState('RESET_TIMER')">
                    <i class="fas fa-undo"></i> Reset
                </button>
             `;
        }
        else if (game.type === 'spin_wheel') {
            html += `
                <button class="btn btn-xl btn-warning full-width" onclick="gamesApp.syncState('SPIN_WHEEL')">
                    <i class="fas fa-sync fa-spin-hover"></i> SPIN THE WHEEL!
                </button>
             `;
        }
        else if (game.type === 'universal_timer') {
            html += `
                <div class="action-card full-width">
                    <div style="display:flex; gap:10px; margin-bottom:10px;">
                        <input type="number" id="host-timer-min" placeholder="Min" class="form-control">
                        <input type="number" id="host-timer-sec" placeholder="Sec" class="form-control">
                    </div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                        <button class="btn btn-success" onclick="gamesApp.triggerUnivTimer()">Start</button>
                        <button class="btn btn-danger" onclick="gamesApp.syncState('STOP_TIMER')">Stop</button>
                    </div>
                </div>
             `;
        }

        html += `</div></div>`; // Close actions-grid and control-deck
        this.dom.dynamicControls.innerHTML = html;
    },

    triggerUnivTimer() {
        // ... (unchanged)
        const min = document.getElementById('host-timer-min').value || 0;
        const sec = document.getElementById('host-timer-sec').value || 0;
        this.syncState('START_TIMER', { min, sec });
    },

    nextItem() {
        if (!this.state.currentGame) return;
        const game = GAMES_DATA[this.state.currentGame];
        // Allow moving from -1 (Title) to 0
        if (this.state.currentIndex < game.content.length - 1) {
            this.state.currentIndex++;
            this.updateHostIndexDisplay();
            this.syncState('LOAD_GAME');
        }
    },

    prevItem() {
        if (!this.state.currentGame) return;
        // Allow going back to Title (-1)
        if (this.state.currentIndex > -1) {
            this.state.currentIndex--;
            this.updateHostIndexDisplay();
            this.syncState('LOAD_GAME');
        }
    },

    updateHostIndexDisplay() {
        const el = document.getElementById('ctrl-current-index');
        const game = GAMES_DATA[this.state.currentGame];
        if (el) {
            if (this.state.currentIndex === -1) {
                el.innerText = "Title Screen";
            } else {
                el.innerText = `Item ${this.state.currentIndex + 1}`;
            }
        }
    },

    // ... (Projector Logic) ...

    initProjectorMode() {
        console.log("Projector Mode Initialized");
    },

    handleProjectorMessage(data) {
        // ... (standard handling) ...
        switch (data.type) {
            // ... (cases) ...
            case 'NAVIGATE_HOME':
                this.dom.gameContainer.innerHTML = `
            <div class="splash-screen fade-in">
                <div class="splash-icon"><i class="fas fa-rocket"></i></div>
                <h1 class="splash-title">Youth Assembly</h1>
                <div class="splash-subtitle">Games Platform</div>
            </div>`;
                break;
            case 'LOAD_GAME':
                this.renderGameContent(data.gameId, data.index);
                break;
            case 'UPDATE_STATE':
                this.updateGameState(data);
                break;
            case 'REVEAL_NEXT_CLUE':
                this.revealClue();
                break;
            case 'REVEAL_ALL':
                this.revealAnswer();
                break;
            case 'REVEAL_ANSWER':
                this.revealAnswer();
                break;
            case 'PLAY_AUDIO':
                this.playAudio();
                break;
            case 'STOP_AUDIO':
                this.stopAudio();
                break;
            case 'START_TIMER':
                this.startTimer(data);
                break;
            case 'RESET_TIMER':
            case 'STOP_TIMER':
                this.stopTimer();
                break;
            case 'SPIN_WHEEL':
                this.spinWheel();
                break;
            case 'CLEAR_CAPTION':
                const cap = document.getElementById('caption-output');
                if (cap) cap.innerText = "";
                break;
        }
    },

    renderGameContent(gameId, index) {
        const game = GAMES_DATA[gameId];
        this.state.currentGame = gameId;
        this.state.currentIndex = index;

        this.stopAudio();
        this.stopTimer();

        // 1. Check for TITLE SCREEN (index -1)
        if (index === -1) {
            const titleHtml = `
                <div class="game-content-wrapper fade-in" style="justify-content:center;">
                    <div style="text-align:center;">
                        <i class="fas ${game.icon}" style="font-size:8rem; color:var(--accent); margin-bottom:2rem; text-shadow:0 0 50px rgba(34,211,238,0.5);"></i>
                        <h1 style="font-size:6rem; font-weight:900; color:white; text-transform:uppercase; margin:0; line-height:1.1;">${game.title}</h1>
                        <div style="font-size:2rem; color:var(--text-muted); margin-top:1rem; letter-spacing:4px; text-transform:uppercase;">${game.type.replace('_', ' ')}</div>
                    </div>
                </div>
            `;
            this.dom.gameContainer.innerHTML = titleHtml;
            return; // Stop here, don't render game content
        }

        // 2. Standard Game Rendering (Index >= 0)
        const item = game.content[index];

        // Common Small Title Overlay for active game (corner)
        const cornerTitleHtml = `
            <div class="projector-game-title fade-in">
                <i class="fas ${game.icon}"></i> ${game.title}
            </div>
        `;

        let html = cornerTitleHtml;

        if (game.type === 'slider_reveal') {
            html += `
                <div class="mood-game-container fade-in">
                    <div class="blur-wrapper">
                        <div class="blur-content" id="blur-target">${item.image}</div>
                    </div>
                </div>`;
        }
        else if (game.type === 'timed_clues' || game.type === 'text_complete') {
            html += `
                <div class="game-content-wrapper fade-in">
                    ${game.type === 'text_complete' ? `
                        <div class="sentence-container">
                            <h1 class="game-sentence">
                                ${item.sentence.replace('____', '<span class="sentence-blank"></span>')}
                            </h1>
                        </div>`
                    : ''}
                    
                    <div id="clues-area" class="clues-grid">
                        <!-- Clues injected here -->
                    </div>
                    
                    ${(game.type === 'timed_clues' || game.type === 'text_complete') ?
                    `<div id="answer-reveal" class="answer-overlay hidden">
                            <div class="answer-content">
                                <span class="answer-label">ANSWER</span>
                                <div class="answer-text">${item.word || item.answer}</div>
                            </div>
                         </div>`
                    : ''}
                </div>
             `;
        }
        else if (game.type === 'reveal_timer' || game.type === 'reveal_answer') {
            html += `
                <div class="fade-in text-center" style="width:100%; height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center;">
                    <div class="riddle-text">${item.question || item.puzzle}</div>
                    ${item.image ? `<img src="${item.image}" style="max-height:40vh; margin:20px 0; border-radius:10px;">` : ''}
                    <div id="answer-box" class="answer-box">${item.answer}</div>
                </div>
            `;
        }
        else if (game.type === 'image_display') {
            html += `
                <div class="fade-in text-center" style="position:relative; width:100%; height:100%; display:flex; justify-content:center; align-items:center;">
                     <img src="${item.image}" class="meme-image">
                     <div id="caption-output" class="caption-display"></div>
                </div>
            `;
        }
        else if (game.type === 'audio_play') {
            html += `
                <div class="fade-in text-center" style="width:100%; height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center;">
                    <i class="fas fa-music" style="font-size:10rem; color:var(--bg-card); text-shadow:0 0 50px var(--primary);"></i>
                    <h2 class="mt-4">Guess the Sound</h2>
                    <div id="audio-viz" class="audio-viz"></div>
                </div>
            `;
        }
        else if (game.type === 'word_chain') {
            html += `
                <div class="fade-in text-center" style="width:100%; height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center;">
                    <h1 style="font-size:8rem; font-weight:800; color:var(--accent);">${item.start_word}</h1>
                </div>
             `;
        }
        else if (game.type === 'challenge_timer') {
            html += `
                <div class="fade-in text-center" style="width:100%; height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center;">
                     <h2 class="riddle-text">${item.challenge}</h2>
                     <div id="timer-display" class="timer-big">30</div>
                </div>
             `;
        }
        else if (game.type === 'spin_wheel') {
            html += `
                 <div class="fade-in text-center" style="width:100%; height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center;">
                    <div class="wheel-container margin-auto">
                        <div class="wheel-pointer"></div>
                        <div class="wheel" id="game-wheel"></div>
                    </div>
                    <h2 id="wheel-result" class="mt-4" style="height:2em;"></h2>
                 </div>
             `;
        }
        else if (game.type === 'universal_timer') {
            html += `
                <div class="fade-in text-center" style="width:100%; height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center;">
                    <div id="univ-timer-display" class="timer-big" style="font-size:20rem;">00:00</div>
                </div>
             `;
        }

        this.dom.gameContainer.innerHTML = html;
    },

    // --- State Updaters ---

    updateGameState(data) {
        if (data.blur !== undefined) {
            const target = document.getElementById('blur-target');
            if (target) target.style.filter = `blur(${data.blur}px)`;
        }
        if (data.caption !== undefined) {
            const cap = document.getElementById('caption-output');
            if (cap) cap.innerText = data.caption;
        }
    },

    revealClue() {
        const game = GAMES_DATA[this.state.currentGame];
        const item = game.content[this.state.currentIndex];
        const container = document.getElementById('clues-area');
        if (!container || !item.clues) return;

        const currentCount = container.children.length;
        if (currentCount < item.clues.length) {
            const clue = document.createElement('div');
            clue.className = 'clue-box fade-in';
            clue.innerText = item.clues[currentCount];
            container.appendChild(clue);
            setTimeout(() => clue.classList.add('revealed'), 10);
        }
    },

    revealAnswer() {
        const ans = document.getElementById('answer-reveal') || document.getElementById('answer-box');
        if (ans) ans.classList.add('show', 'revealed', 'hidden' === 'hidden' ? 'dummy' : ''); // handling different classes
        if (ans) ans.classList.remove('hidden');
    },

    // --- Media & Timers ---

    playAudio() {
        const game = GAMES_DATA[this.state.currentGame];
        const item = game.content[this.state.currentIndex];
        if (!item.audio) return;

        if (this.state.audioObj) this.state.audioObj.pause();
        this.state.audioObj = new Audio(item.audio);
        this.state.audioObj.play().catch(e => console.log("Audio play failed (interact first):", e));
    },

    stopAudio() {
        if (this.state.audioObj) {
            this.state.audioObj.pause();
            this.state.audioObj = null;
        }
    },

    startTimer(data) {
        const display = document.getElementById('timer-display') || document.getElementById('univ-timer-display');
        if (!display) return;

        let seconds = 30;
        if (data.min || data.sec) {
            seconds = (parseInt(data.min) || 0) * 60 + (parseInt(data.sec) || 0);
        } else if (display.id === 'timer-display') {
            seconds = 30; // default challenge
        }

        if (this.state.timerInt) clearInterval(this.state.timerInt);

        const update = () => {
            if (display.id === 'univ-timer-display') {
                const m = Math.floor(seconds / 60).toString().padStart(2, '0');
                const s = (seconds % 60).toString().padStart(2, '0');
                display.innerText = `${m}:${s}`;
            } else {
                display.innerText = seconds;
                if (seconds <= 10) display.classList.add('urgent');
            }
        };

        update();
        this.state.timerInt = setInterval(() => {
            seconds--;
            update();
            if (seconds <= 0) {
                clearInterval(this.state.timerInt);
                display.classList.remove('urgent');
                // Could play buzz sound
            }
        }, 1000);
    },

    stopTimer() {
        if (this.state.timerInt) clearInterval(this.state.timerInt);
        const display = document.getElementById('timer-display');
        if (display) {
            display.innerText = "30";
            display.classList.remove('urgent');
        }
        const univ = document.getElementById('univ-timer-display');
        if (univ) univ.innerText = "00:00";
    },

    spinWheel() {
        const wheel = document.getElementById('game-wheel');
        const res = document.getElementById('wheel-result');
        if (!wheel) return;

        res.innerText = "";
        const rot = Math.floor(Math.random() * 720) + 720;
        wheel.style.transition = "transform 3s cubic-bezier(0.2, 0.8, 0.2, 1)";
        wheel.style.transform = `rotate(${rot}deg)`;

        setTimeout(() => {
            const game = GAMES_DATA[this.state.currentGame];
            const item = game.content[0]; // Wheel only has 1 config usually
            if (item && item.outcomes) {
                const pick = item.outcomes[Math.floor(Math.random() * item.outcomes.length)];
                res.innerText = pick;
            }
        }, 3000);
    },

    startClock() {
        setInterval(() => {
            if (this.dom.clock) {
                this.dom.clock.innerText = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
        }, 1000);
    }

};

document.addEventListener('DOMContentLoaded', () => {
    gamesApp.init();
});
