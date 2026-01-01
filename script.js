const gamesApp = {
    state: {
        isProjector: false,
        gameChannel: new BroadcastChannel('game_channel'),
        currentGame: null,
        currentIndex: 0,
        gameState: {},
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
            this.initInteractions();
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
            controlsContainer: document.getElementById('dynamic-controls'),
            header: document.getElementById('active-game-header'),
            title: document.getElementById('current-game-title'),
            clock: document.getElementById('host-clock') || document.getElementById('mini-clock')
        };
    },

    bindEvents() {
        this.state.gameChannel.onmessage = (event) => {
            if (this.state.isProjector) {
                this.handleProjectorMessage(event.data);
            } else {
                // Host listening for Projector requests
                if (event.data.type === 'REQUEST_STATE') {
                    // Re-broadcast current state
                    if (this.state.currentGame) {
                        this.syncState('LOAD_GAME');
                    }
                }
            }
        };
    },

    startClock() {
        setInterval(() => {
            const now = new Date();
            const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            if (document.getElementById('host-clock')) document.getElementById('host-clock').innerText = time;
            if (document.getElementById('mini-clock')) document.getElementById('mini-clock').innerText = time;
        }, 1000);
    },

    /* --- PROJECTOR MODE --- */
    initProjectorMode() {
        document.title = "Game Projector";

        // 1. Initial Waiting Screen
        this.renderProjectorIdle();

        // 2. Persistent Fullscreen Button (Floating)
        const fsBtn = document.createElement('button');
        fsBtn.className = 'btn btn-sm btn-outline';
        fsBtn.innerHTML = '<i class="fas fa-expand"></i>';
        fsBtn.style.position = 'fixed';
        fsBtn.style.bottom = '20px';
        fsBtn.style.right = '20px';
        fsBtn.style.zIndex = '9999';
        fsBtn.style.opacity = '0.5';
        fsBtn.style.transition = 'opacity 0.3s';
        fsBtn.onmouseover = () => fsBtn.style.opacity = '1';
        fsBtn.onmouseout = () => fsBtn.style.opacity = '0.5';
        fsBtn.onclick = () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(e => console.log(e));
                fsBtn.innerHTML = '<i class="fas fa-compress"></i>';
            } else {
                document.exitFullscreen();
                fsBtn.innerHTML = '<i class="fas fa-expand"></i>';
            }
        };
        document.body.appendChild(fsBtn);

        // Double-click to toggle fullscreen
        document.body.addEventListener('dblclick', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(e => console.log(e));
                fsBtn.innerHTML = '<i class="fas fa-compress"></i>';
            } else {
                document.exitFullscreen();
                fsBtn.innerHTML = '<i class="fas fa-expand"></i>';
            }
        });

        // Request current state from Host
        setTimeout(() => {
            this.state.gameChannel.postMessage({ type: 'REQUEST_STATE' });
        }, 500);
    },

    /* --- HOST MODE --- */

    initHostMode() {
        this.renderSidebarList();

        // AUTO-RESTORE STATE
        if (!this.loadLocalState()) {
            this.renderHome();
        }
    },

    saveLocalState() {
        const s = {
            gameId: this.state.currentGame,
            index: this.state.currentIndex
        };
        localStorage.setItem('mfg_state', JSON.stringify(s));
    },

    loadLocalState() {
        try {
            const raw = localStorage.getItem('mfg_state');
            if (!raw) return false;
            const s = JSON.parse(raw);
            if (s && s.gameId && GAMES_DATA[s.gameId]) {
                // Restore
                this.loadGame(s.gameId, null, s.index); // Modified loadGame to accept index
                return true;
            }
        } catch (e) {
            console.error("Load State Error", e);
        }
        return false;
    },

    renderSidebarList() {
        const list = document.getElementById('games-list');
        if (!list || typeof GAMES_DATA === 'undefined') return;

        let html = '';
        Object.keys(GAMES_DATA).forEach(key => {
            const game = GAMES_DATA[key];
            html += `
                <div class="game-card" id="card-${key}" onclick="gamesApp.loadGame('${key}', this)">
                    <div class="gc-icon"><i class="fas ${game.icon}"></i></div>
                    <div class="gc-details">
                        <h4>${game.title}</h4>
                        <p>${game.type.replace('_', ' ')}</p>
                    </div>
                </div>
            `;
        });
        list.innerHTML = html;
    },

    filterGames(query) {
        const term = query.toLowerCase();
        document.querySelectorAll('.game-card').forEach(card => {
            const txt = card.innerText.toLowerCase();
            card.style.display = txt.includes(term) ? 'flex' : 'none';
        });
    },

    loadGame(gameId, el = null, forceIndex = 0) {
        if (!GAMES_DATA[gameId]) return;

        // UI Active State
        document.querySelectorAll('.game-card').forEach(c => c.classList.remove('active'));

        // If el is null (auto-restore), try to find it
        if (!el) el = document.getElementById(`card-${gameId}`);
        if (el) el.classList.add('active');

        // Update State
        this.state.currentGame = gameId;
        // Start at -1 for Title Screen unless forced
        this.state.currentIndex = (forceIndex !== 0) ? forceIndex : -1;

        // Save State
        this.saveLocalState();
        this.state.gameState = {};

        // Update Header
        this.dom.header.classList.remove('hidden');
        this.dom.title.innerText = GAMES_DATA[gameId].title;

        // Render Controls
        this.renderHostControls(gameId);

        // Sync
        this.syncState('LOAD_GAME');
    },

    renderHome() {
        localStorage.removeItem('mfg_state');
        this.state.currentGame = null;
        this.dom.header.classList.add('hidden');
        this.dom.controlsContainer.innerHTML = `
            <div class="empty-state">
                <div class="icon-circle"><i class="fas fa-rocket"></i></div>
                <h1>Ready to Launch</h1>
                <p>Select a game to begin.</p>
                <button class="btn btn-primary" onclick="gamesApp.openProjectorWindow()" style="margin-top:20px;">
                    <i class="fas fa-external-link-alt"></i> Open Projector Window
                </button>
            </div>
        `;
        document.getElementById('game-container').innerHTML = `
            <div class="game-content-outer">
                <h1 style="font-size:3rem; color:var(--primary);">YOUTH ASSEMBLY</h1>
                <p>WAITING FOR CONTENT...</p>
            </div>
        `;
        this.syncState('NAVIGATE_HOME');
    },

    renderHostControls(gameId = this.state.currentGame) {
        const game = GAMES_DATA[gameId];
        let html = '';

        // 1. Navigation Deck
        html += `
            <div class="control-deck">
                <div class="deck-title">NAVIGATION</div>
                <div class="nav-bar" style="grid-column:1/-1">
                    <button class="btn btn-outline" onclick="gamesApp.prevSlide()"><i class="fas fa-chevron-left"></i> Prev</button>
                    <div class="nav-status">
                         <span class="val">${this.state.currentIndex === -1 ? "TITLE" : (this.state.currentIndex + 1) + " / " + game.content.length}</span>
                        <span class="lbl">Slide</span>
                    </div>
                    <button class="btn btn-outline" onclick="gamesApp.nextSlide()">Next <i class="fas fa-chevron-right"></i></button>
                     <div style="width:1px; height:30px; background:var(--border-soft); margin:0 10px;"></div>
                     <button class="btn btn-warning" onclick="gamesApp.syncState('TOGGLE_RULES')" title="Show Rules"><i class="fas fa-info-circle"></i></button>
                </div>
            </div>
        `;

        // 2. Action Deck
        html += `<div class="control-deck"><div class="deck-title">GAME ACTIONS</div><div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">`;

        // ... (Game Specific Logic adapted from previous V1) ...
        const type = game.type;
        if (type === 'slider_reveal') {
            html += `
                <div style="grid-column:1/-1;">
                    <label style="display:block; margin-bottom:10px;">Image Blur</label>
                    <input type="range" style="width:100%;" min="0" max="60" value="60" oninput="gamesApp.syncState('UPDATE_STATE', {blur:this.value})">
                </div>
                <button class="btn btn-xl btn-accent" style="grid-column:1/-1; margin-top:10px;" onclick="gamesApp.syncState('REVEAL_ANSWER')"><i class="fas fa-eye"></i> Reveal Answer</button>
            `;
        } else if (type === 'timed_clues' || type === 'text_complete') {
            html += `
                <button class="btn btn-xl btn-success" onclick="gamesApp.syncState('REVEAL_NEXT_CLUE')"><i class="fas fa-eye"></i> Clue</button>
                <button class="btn btn-xl btn-accent" onclick="gamesApp.syncState('REVEAL_ALL')"><i class="fas fa-star"></i> Answer</button>
            `;
        } else if (type === 'reveal_timer' || type === 'reveal_answer') {
            html += `
                <button class="btn btn-xl btn-accent" style="grid-column:1/-1" onclick="gamesApp.syncState('REVEAL_ANSWER')">Reveal Answer</button>
            `;
        } else if (type === 'challenge_timer') {
            html += `
                <button class="btn btn-xl btn-success" onclick="gamesApp.syncState('START_TIMER'); gamesApp.playSFX('30-Sec')">Start 30s</button>
                <button class="btn btn-xl btn-outline-danger" onclick="gamesApp.syncState('RESET_TIMER'); gamesApp.stopAllSFX()">Reset</button>
            `;
        } else if (type === 'challenge_timer') {
            html += `
                <button class="btn btn-xl btn-success" onclick="gamesApp.syncState('START_TIMER'); gamesApp.playSFX('30-Sec')">Start 30s</button>
                <button class="btn btn-xl btn-outline-danger" onclick="gamesApp.syncState('RESET_TIMER'); gamesApp.stopAllSFX()">Reset</button>
            `;
        } else if (type === 'spin_wheel') {
            html += `
                <button class="btn btn-xl btn-accent" style="grid-column:1/-1" onclick="gamesApp.syncState('SPIN_WHEEL')"><i class="fas fa-sync"></i> SPIN!</button>
            `;
        } else if (type === 'word_chain' || type === 'hot_seat') {
            html += `
                <div class="empty-state" style="grid-column:1/-1; padding:20px;">
                    <p>Use navigation to reveal the next word.</p>
                </div>
            `;
        } else if (type === 'image_display') {
            html += `
                <div class="empty-state" style="grid-column:1/-1; padding:20px;">
                    <p>Image is displayed on Projector.</p>
                </div>
            `;
        } else if (type === 'audio_play') {
            html += `
                <button class="btn btn-xl btn-success" onclick="gamesApp.syncState('PLAY_AUDIO')"><i class="fas fa-play"></i> Play Sound</button>
                <button class="btn btn-xl btn-accent" onclick="gamesApp.syncState('REVEAL_ANSWER')">Reveal Answer</button>
            `;
        } else if (type === 'universal_timer') {
            html += `
                <div style="grid-column:1/-1; display:flex; gap:10px; align-items:center; margin-bottom:15px;">
                    <input type="number" id="cust-min" class="dock-slider" placeholder="Min" style="width:80px; text-align:center;" value="5">
                    <span style="font-size:20px;">:</span>
                    <input type="number" id="cust-sec" class="dock-slider" placeholder="Sec" style="width:80px; text-align:center;" value="00">
                </div>
                <button class="btn btn-xl btn-success" onclick="gamesApp.startUniversalTimer()"><i class="fas fa-play"></i> Start</button>
                <button class="btn btn-xl btn-outline-danger" onclick="gamesApp.syncState('RESET_TIMER')"><i class="fas fa-undo"></i> Reset</button>
            `;
        }


        html += `</div></div>`;
        this.dom.controlsContainer.innerHTML = html;
    },

    nextSlide() {
        const game = GAMES_DATA[this.state.currentGame];
        if (!game) return;
        if (this.state.currentIndex < game.content.length - 1) {
            this.state.currentIndex++;
            this.syncState('LOAD_GAME');
            this.renderHostControls(); // Re-render controls to update progress
            this.saveLocalState();
        }
    },

    prevSlide() {
        if (this.state.currentIndex > -1) {
            this.state.currentIndex--;
            this.syncState('LOAD_GAME');
            this.renderHostControls();
            this.saveLocalState();
        }
    },

    updateIdxDisplay() {
        const el = document.getElementById('ctrl-idx');
        if (el) el.innerText = this.state.currentIndex === -1 ? 'TITLE' : this.state.currentIndex + 1;
    },

    onlineProjector() {
        window.open(window.location.href + '?mode=projector', 'Projector', 'width=1280,height=720');
    },

    // --- UI INTERACTION (Drag & Resize) ---

    initInteractions() {
        const widget = document.getElementById('preview-widget');
        const header = document.querySelector('.preview-bar');
        const widgetHandle = document.getElementById('resize-handle');

        // Preview Widget Interactions
        if (widget && header) this.makeDraggable(widget, header);
        if (widget && widgetHandle) this.makeWidgetResizable(widget, widgetHandle);

        // Dock Resizer
        const dockHandle = document.getElementById('dock-resizer');
        const appGrid = document.getElementById('app');
        if (dockHandle && appGrid) this.makeDockResizable(dockHandle, appGrid);
    },

    makeDockResizable(handle, grid) {
        let isResizing = false;
        let startY, startHeight;

        handle.addEventListener('mousedown', (e) => {
            isResizing = true;
            startY = e.clientY;
            // Get current grid row height (2nd row)
            const style = window.getComputedStyle(grid);
            const rows = style.gridTemplateRows.split(' ');
            // The dock is the second row. It might be in pixels.
            startHeight = parseFloat(rows[1]) || 120;

            document.body.style.cursor = 'row-resize';
            handle.style.background = 'var(--primary)';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            const dy = startY - e.clientY; // Dragging up increases height
            let newH = startHeight + dy;

            // Constraints
            if (newH < 80) newH = 80;
            if (newH > 400) newH = 400;

            grid.style.gridTemplateRows = `1fr ${newH}px`;
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = '';
                handle.style.background = '';
            }
        });
    },

    makeDraggable(el, handle) {
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;

        handle.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialLeft = el.offsetLeft;
            initialTop = el.offsetTop;
            handle.style.cursor = 'grabbing';
            e.preventDefault(); // Prevent text selection
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            el.style.left = `${initialLeft + dx}px`;
            el.style.top = `${initialTop + dy}px`;
            // Unset right/bottom to allow free movement via left/top
            el.style.right = 'auto';
            el.style.bottom = 'auto';
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            handle.style.cursor = 'grab';
        });
    },

    makeWidgetResizable(el, handle) {
        let isResizing = false;
        let startX, startWidth;

        handle.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            startWidth = parseInt(getComputedStyle(el).width, 10);
            e.preventDefault();
            e.stopPropagation();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            const dx = e.clientX - startX;
            const newWidth = startWidth + dx;

            // Smooth resizing
            if (newWidth > 200 && newWidth < 1000) {
                el.style.width = `${newWidth}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            isResizing = false;
        });
    },


    renderProjectorIdle() {
        const container = document.getElementById('game-container');
        if (container) {
            container.innerHTML = `
                <div class="game-content-outer" style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100%; gap:20px;">
                    <img src="logo/logo.png" style="max-height:200px; margin-bottom:20px; animation: fadeIn 2s;">
                    <h1 style="background: linear-gradient(135deg, #FFF 0%, var(--primary) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size:5rem; font-weight:900; text-transform:uppercase; letter-spacing:2px; filter: drop-shadow(0 0 15px rgba(99,102,241,0.6)); margin-bottom: 0;">Hariprabodham Youth Assembly</h1>
                    <div style="font-size:2rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:10px; border-top:1px solid rgba(255,255,255,0.2); padding-top:10px;">Satellite</div>
                </div>
            `;
        }
    },

    // --- SHARED RENDERER (Preview + Projector) ---

    renderGameContent(gameId, index) {
        const game = GAMES_DATA[gameId];
        this.state.currentGame = gameId; // Ensure sync

        const container = document.getElementById('game-container');
        if (!container) return; // Should not happen

        // 1. Title Screen
        if (index === -1) {
            container.innerHTML = `
                <div class="game-content-outer fade-in">
                    <i class="fas ${game.icon}" style="font-size:6rem; color:var(--accent); margin-bottom:2rem;"></i>
                    <h1 class="game-txt-huge">${game.title}</h1>
                    <div class="game-txt-med">${game.type.replace('_', ' ')}</div>
                </div>
            `;
            return;
        }

        // 2. Game Content
        const item = game.content[index];
        let html = `
            <div class="proj-title-overlay">
                <i class="fas ${game.icon}"></i> ${game.title}
            </div>
            <div class="game-content-outer fade-in">
        `;

        if (game.type === 'slider_reveal') {
            html += `<div style="position:relative; overflow:hidden; border-radius:12px; padding: 40px;">
                        <div id="blur-target" class="emoji-reveal" style="filter:blur(60px); transition:filter 0.1s;">${item.image}</div>
                     </div>
                     <div id="answer-box" class="answer-overlay hidden">
                        <span class="answer-label">MOOD</span>
                        <div class="answer-text">${item.answer}</div>
                     </div>`;
        } else if (game.type === 'timed_clues' || game.type === 'text_complete') {
            if (game.type === 'text_complete') {
                html += `<h1 class="game-txt-huge">${item.sentence.replace('____', '<span style="border-bottom:4px solid white; display:inline-block; width:100px;"></span>')}</h1>`;
            } else {
                // GUESS THE WORD SPECIFIC
                // 1. Category
                if (item.category) {
                    html += `<div style="font-size:2rem; color:var(--accent); margin-bottom:1rem; letter-spacing:2px; text-transform:uppercase;">CATEGORY: ${item.category}</div>`;
                }
                // 2. Word Blanks (Masked)
                const masked = item.word.replace(/[a-zA-Z]/g, '_');
                html += `<div style="font-size:5rem; letter-spacing:15px; font-family:monospace; margin-bottom:2rem; color:rgba(255,255,255,0.5);">${masked}</div>`;
            }

            html += `<div id="clues-area" class="clues-grid"></div>`;
            html += `<div id="answer-box" class="answer-overlay hidden">
                        <span class="answer-label">ANSWER</span>
                        <div class="answer-text">${item.word || item.answer}</div>
                     </div>`;
        } else if (game.type === 'reveal_answer' || game.type === 'reveal_timer') {
            html += `<h1 class="game-txt-huge">${item.question || item.puzzle}</h1>`;
            if (item.image) html += `<img src="${item.image}" style="max-height:40vh; margin:20px 0; border-radius:12px;">`;
            html += `<div id="answer-box" class="answer-overlay hidden"><div class="answer-text">${item.answer}</div></div>`;
        } else if (game.type === 'challenge_timer') {
            html += `<h1 class="game-txt-huge">${item.challenge}</h1>
                      <div id="timer-disp" class="timer-huge">30</div>`;
        } else if (game.type === 'spin_wheel') {
            // Generate conic gradient based on items
            const count = item.outcomes.length;
            const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#1A535C', '#F7FFF7'];
            let gradientStr = '';
            const degPerSlice = 360 / count;

            item.outcomes.forEach((opt, i) => {
                const start = i * degPerSlice;
                const end = (i + 1) * degPerSlice;
                const color = colors[i % colors.length];
                gradientStr += `${color} ${start}deg ${end}deg, `;
            });
            gradientStr = gradientStr.slice(0, -2); // trim trailing comma

            html += `
                </div>
                <div id="wheel-result" class="wheel-result opacity-0">...</div>
            `;
        } else if (game.type === 'word_chain') {
            const isLatest = index === game.content.length - 1;
            html += `
                <div style="display:flex; flex-direction:column; align-items:center; gap:20px;">
                    <div style="font-size:2rem; color:rgba(255,255,255,0.6); text-transform:uppercase; letter-spacing:4px;">Previous: ${index > 0 ? game.content[index - 1].start_word : 'START'}</div>
                    <div class="game-txt-huge" style="font-size: 8rem; color: var(--accent); animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);">${item.start_word}</div>
                    <div style="font-size: 1.5rem; color: rgba(255,255,255,0.4); margin-top: 20px;">${isLatest ? 'FINAL WORD' : 'Chain Reaction...'}</div>
                </div>
            `;
        } else if (game.type === 'image_display') {
            html += `
                <div style="display:flex; justify-content:center; align-items:center; height:100%;">
                    <img src="${item.image}" style="max-height:80vh; max-width:100%; border-radius:12px; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
                </div>
            `;
        } else if (game.type === 'audio_play') {
            html += `
                <div style="display:flex; flex-direction:column; align-items:center; gap:30px;">
                    <div id="audio-visualizer" style="font-size:8rem; color:var(--accent); animation: pulse 1s infinite;">
                        <i class="fas fa-volume-up"></i>
                    </div>
                    <h2 style="font-size:2rem; opacity:0.7;">Listen Carefully...</h2>
                     <div id="answer-box" class="answer-overlay hidden">
                        <div class="answer-text">${item.answer}</div>
                    </div>
                     <!-- Audio handled by Howler.js now -->
                </div>
            `;
        } else if (game.type === 'universal_timer') {
            html += `
                <div style="display:flex; flex-direction:column; align-items:center; gap:20px;">
                    <h1 class="game-txt-huge" style="font-size:4rem;">TIMER</h1>
                    <div id="timer-disp" class="timer-huge" style="font-size:12rem;">00:00</div>
                </div>
            `;
        } else if (game.type === 'hot_seat') {
            html += `
                <div style="display:flex; flex-direction:column; align-items:center; gap:20px;">
                    <div style="font-size:2rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:4px;">THE WORD IS</div>
                    <div class="game-txt-huge" style="font-size: 9rem; color: var(--accent); margin:0;">${item.start_word}</div>
                </div>
            `;
        } // End 


        html += `</div > `; // Close outer
        container.innerHTML = html;

        // Restore State if any
        if (game.type === 'timed_clues') {
            // If we wanted to persist clue state, we'd need more complex state syncing. 
            // For now, reset clues on slide change is expected behavior.
        }
    },

    // --- LOGIC: AUDIO & TIMERS ---


    audio: { bgm: null, sfx: {}, current: null },
    initAudio() {
        if (this.audio.bgm) return;

        // Local BGM
        this.audio.bgm = new Howl({
            src: ['audio/bgm.mp3'],
            loop: true,
            volume: 0.3,
            html5: true, // Use HTML5 Audio for larger files like BGM
            onplay: () => {
                // Start sync interval
                requestAnimationFrame(this.stepBGM.bind(this));
            },
            onload: () => {
                // Set Duration
                const dur = this.audio.bgm.duration();
                const el = document.getElementById('bgm-total');
                const seek = document.getElementById('bgm-seek');
                if (el) el.innerText = this.fmtTime(dur);
                if (seek) seek.max = dur;
            },
            onplayerror: function () {
                this.audio.bgm.once('unlock', function () {
                    this.audio.bgm.play();
                });
            }
        });

        const sfxUrls = {
            correct: 'audio/correct.mp3',
            wrong: 'audio/wrong.mp3',
            applause: 'audio/applause.mp3',
            drumroll: 'audio/drumroll.mp3',
            laugh: 'audio/laugh.mp3',
            boo: 'audio/boo.mp3',
            airhorn: 'audio/air-horn.mp3',
            fanfare: 'audio/fanfare.mp3',
            '30-Sec': 'audio/30-sec.mp3',
            '60-Sec': 'audio/60-sec.mp3'
        };


        for (let k in sfxUrls) {
            this.audio.sfx[k] = new Howl({ src: [sfxUrls[k]] });
        }
    },

    toggleBGM() {
        this.initAudio(); // Ensure init
        const btn = document.getElementById('bgm-btn');

        if (!this.audio.bgm) return;

        if (this.audio.bgm.playing()) {
            this.audio.bgm.pause();
            if (btn) {
                btn.classList.remove('active');
                btn.innerHTML = '<i class="fas fa-play"></i>';
            }
        } else {
            this.audio.bgm.play();
            if (btn) {
                btn.classList.add('active');
                btn.innerHTML = '<i class="fas fa-pause"></i>';
            }
        }
    },

    stepBGM() {
        if (!this.audio.bgm || !this.audio.bgm.playing()) return;

        const seek = this.audio.bgm.seek() || 0;
        document.getElementById('bgm-current').innerText = this.fmtTime(seek);
        document.getElementById('bgm-seek').value = seek;

        if (this.audio.bgm.playing()) {
            requestAnimationFrame(this.stepBGM.bind(this));
        }
    },

    seekBGM(val) {
        if (this.audio.bgm) {
            this.audio.bgm.seek(val);
        }
    },

    setBGMVolume(val) {
        if (this.audio.bgm) this.audio.bgm.volume(val);
    },

    playSFX(key) {
        if (!this.audio.bgm) this.initAudio(); // ensure init
        // Duck BGM
        if (this.audio.bgm && this.audio.bgm.playing()) this.audio.bgm.volume(0.1);

        const s = this.audio.sfx[key];
        if (s) {
            s.stop();
            s.play();
            s.on('end', () => { if (this.audio.bgm) this.audio.bgm.volume(document.querySelector('.dock-slider').value); });
        }
    },

    stopAllSFX() {
        for (let k in this.audio.sfx) {
            if (this.audio.sfx[k]) this.audio.sfx[k].stop();
        }
    },

    // --- SYNC ENGINE ---

    syncState(type, payload = {}) {
        const msg = { type, gameId: this.state.currentGame, index: this.state.currentIndex, ...payload };
        // 1. Send to Projector
        this.state.gameChannel.postMessage(msg);
        // 2. Update Self (Preview)
        this.handleProjectorMessage(msg);
    },

    handleProjectorMessage(data) {
        switch (data.type) {
            case 'NAVIGATE_HOME':
                this.renderProjectorIdle();
                break;
            case 'LOAD_GAME':
                this.renderGameContent(data.gameId, data.index);
                break;
            case 'UPDATE_STATE':
                if (data.blur && document.getElementById('blur-target')) {
                    document.getElementById('blur-target').style.filter = `blur(${data.blur}px)`;
                }
                break;
            case 'REVEAL_NEXT_CLUE':
                const clues = document.getElementById('clues-area');
                if (clues) {
                    const game = GAMES_DATA[this.state.currentGame];
                    const item = game.content[this.state.currentIndex];
                    const idx = clues.children.length;
                    if (item.clues && idx < item.clues.length) {
                        const div = document.createElement('div');
                        div.className = 'clue-box';
                        div.innerText = item.clues[idx];
                        clues.appendChild(div);
                        setTimeout(() => div.classList.add('revealed'), 10);
                    }
                }
                break;
            case 'REVEAL_ANSWER':
            case 'REVEAL_ALL':
                const box = document.getElementById('answer-box');
                if (box) box.classList.remove('hidden');
                // Confetti
                this.spawnConfetti();
                break;
            case 'START_TIMER':
                const timer = document.getElementById('timer-disp');
                if (timer) {
                    let t = data.duration || 30;
                    // Format function
                    const fmt = (sec) => {
                        const m = Math.floor(sec / 60);
                        const s = sec % 60;
                        // If it's the challenge timer (usually just 30s), existing behavior just showed seconds if <60?
                        // The existing code just showed 't'. Let's be smart.
                        if (sec > 59) return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')} `;
                        return sec;
                    };

                    if (this.state.timerInt) clearInterval(this.state.timerInt);
                    this.state.timerInt = setInterval(() => {
                        t--;
                        timer.innerText = fmt(t);
                        if (t <= 10) timer.classList.add('urgent');
                        if (t <= 0) clearInterval(this.state.timerInt);
                    }, 1000);
                }
                break;
            case 'RESET_TIMER':
                if (this.state.timerInt) clearInterval(this.state.timerInt);
                const t2 = document.getElementById('timer-disp');
                if (t2) { t2.innerText = "30"; t2.classList.remove('urgent'); }
                break;
            case 'TOGGLE_RULES':
                const existing = document.getElementById('rules-overlay');
                if (existing) {
                    existing.remove();
                } else {
                    const game = GAMES_DATA[data.gameId];
                    const rulesList = game.rules || [game.description, "Watch the screen.", "Wait for clues.", "Have fun!"];
                    const overlay = document.createElement('div');
                    overlay.id = 'rules-overlay';
                    overlay.className = 'rules-modal fade-in';
                    overlay.innerHTML = `
                    <div class="rules-content">
                        <h1><i class="fas fa-book"></i> HOW TO PLAY</h1>
                        <h2>${game.title}</h2>
                        <ul>${rulesList.map(r => `<li>${r}</li>`).join('')}</ul>
                    </div>
                `;
                    document.getElementById('game-container').appendChild(overlay);
                }
                break;
            case 'SPIN_WHEEL':
                const wheel = document.getElementById('the-wheel');
                const resultBox = document.getElementById('wheel-result');
                if (wheel && resultBox) {
                    // Reset
                    wheel.style.transition = 'none';
                    wheel.style.transform = 'rotate(0deg)';
                    resultBox.classList.add('opacity-0');
                    resultBox.innerText = "...";

                    // Force reflow
                    void wheel.offsetWidth;

                    // Spin
                    const spins = 5 + Math.random() * 5; // 5 to 10 full spins
                    const degrees = spins * 360;
                    // We need to calculate where it lands to show the text, 
                    // but for visual fun random is fine. To show accurate text we'd need to match the rotation.
                    // Let's pick a random item index first, then rotate TO it.

                    const game = GAMES_DATA[this.state.currentGame];
                    const items = game.content[this.state.currentIndex].outcomes;
                    const winningIdx = Math.floor(Math.random() * items.length);
                    const winningItem = items[winningIdx];

                    // Segment arc
                    const arc = 360 / items.length;
                    // Target angle (center of the winning slice). 
                    // 0deg is top (pointer). The slices are drawn clockwise. 
                    // To get slice i to top, we rotate COUNTER-CLOCKWISE by (i * arc + arc/2).
                    // Or CLOCKWISE by 360 - (i * arc + arc/2).

                    const sliceCenter = (winningIdx * arc) + (arc / 2);
                    const targetRotation = (360 - sliceCenter) + (360 * 5); // +5 full spins

                    wheel.style.transition = 'transform 4s cubic-bezier(0.1, 0, 0.2, 1)';
                    wheel.style.transform = `rotate(${targetRotation}deg)`;

                    // Show result after spin
                    setTimeout(() => {
                        resultBox.innerText = winningItem;
                        resultBox.classList.remove('opacity-0');
                        this.playSFX('fanfare');
                    }, 4000);
                }
                break;
            case 'PLAY_AUDIO':
                const game = GAMES_DATA[this.state.currentGame];
                const item = game.content[this.state.currentIndex];
                if (item && item.audio) {
                    // Stop previous if any
                    if (this.audio.current) this.audio.current.stop();

                    this.audio.current = new Howl({
                        src: [item.audio],
                        html5: true, // Force HTML5 Audio to allow streaming large files/local files if needed
                        onloaderror: (id, err) => {
                            console.error("Audio Load Error", err);
                            alert("Error loading audio: " + item.audio);
                        },
                        onplayerror: (id, err) => {
                            console.error("Audio Play Error", err);
                            this.audio.current.once('unlock', () => {
                                this.audio.current.play();
                            });
                        }
                    });
                    this.audio.current.play();

                    const viz = document.getElementById('audio-visualizer');
                    if (viz) {
                        viz.style.transform = 'scale(1.2)';
                        setTimeout(() => viz.style.transform = 'scale(1)', 200);
                    }
                }
                break;
            case 'SET_TIMER':
                const t3 = document.getElementById('timer-disp');
                if (t3 && data.timeStr) {
                    t3.innerText = data.timeStr;
                    if (this.state.timerInt) clearInterval(this.state.timerInt);
                }
                break;
        }
    },

    spawnConfetti() {
        // Simple visual particles
    },

    triggerSpin() {
        // Calculate physics HERE (Host only) so everyone gets same result
        const game = GAMES_DATA[this.state.currentGame];
        if (!game || game.type !== 'spin_wheel') return;

        const items = game.content[this.state.currentIndex].outcomes;
        const winningIdx = Math.floor(Math.random() * items.length);
        const winningItem = items[winningIdx];

        // Calculate Rotation
        const arc = 360 / items.length;
        const sliceCenter = (winningIdx * arc) + (arc / 2);
        // Add random extra spins (5 to 10)
        const extraSpins = 360 * (5 + Math.floor(Math.random() * 5));
        const targetRotation = (360 - sliceCenter) + extraSpins;

        // Broadcast the result
        this.syncState('SPIN_WHEEL', { rotation: targetRotation, result: winningItem });
    },

    openProjectorWindow() {
        window.open(window.location.href + '?mode=projector', 'Projector', 'width=1280,height=720');
    },

    togglePreview() {
        const widget = document.getElementById('preview-widget');
        const icon = document.getElementById('min-icon');
        if (widget) {
            widget.classList.toggle('minimized');
            if (icon) {
                if (widget.classList.contains('minimized')) {
                    icon.className = 'fas fa-window-maximize';
                } else {
                    icon.className = 'fas fa-minus';
                }
            }
        }
    },

    startUniversalTimer() {
        const minEl = document.getElementById('cust-min');
        const secEl = document.getElementById('cust-sec');
        if (!minEl || !secEl) return;

        let m = parseInt(minEl.value) || 0;
        let s = parseInt(secEl.value) || 0;
        let total = m * 60 + s;

        // Sync initial display
        this.syncState('SET_TIMER', { time: total, timeStr: this.fmtTime(total) });
        this.syncState('START_TIMER', { duration: total });
    },

    fmtTime(sec) {
        if (!sec || isNaN(sec)) return "00:00";
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
};

// Init
gamesApp.init();
