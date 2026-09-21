// pacman.js - Standalone Pac-Man Game
(function() {
    'use strict';

    // Game constants
    const TILE_SIZE = 30;
    const SPEED = 2;
    
    // Colors
    const COLORS = {
        wall: '#0000ff',
        dot: '#ffffff',
        pacman: '#ffff00',
        ghost: '#ff0000',
        bg: '#000000'
    };

    // Maze layout (1=wall, 0=dot, 2=empty)
    const MAZE = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1],
        [1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,0,1],
        [1,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
        [1,1,1,1,1,0,1,1,1,2,1,2,1,1,1,0,1,1,1,1,1],
        [2,2,2,2,1,0,1,2,2,2,2,2,2,2,1,0,1,2,2,2,2],
        [1,1,1,1,1,0,1,2,1,1,2,1,1,2,1,0,1,1,1,1,1],
        [2,2,2,2,2,0,2,2,1,2,2,2,1,2,2,0,2,2,2,2,2],
        [1,1,1,1,1,0,1,2,1,1,1,1,1,2,1,0,1,1,1,1,1],
        [2,2,2,2,1,0,1,2,2,2,2,2,2,2,1,0,1,2,2,2,2],
        [1,1,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1],
        [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
        [1,1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1,1],
        [1,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];

    const ROWS = MAZE.length;
    const COLS = MAZE[0].length;

    // Directions
    const DIR = {
        UP: { x: 0, y: -1 },
        DOWN: { x: 0, y: 1 },
        LEFT: { x: -1, y: 0 },
        RIGHT: { x: 1, y: 0 },
        NONE: { x: 0, y: 0 }
    };

    // Game state
    let canvas, ctx;
    let score = 0;
    let totalDots = 0;
    let gameRunning = true;
    let animationId;

    // Pac-Man
    const pacman = {
        x: 10 * TILE_SIZE,
        y: 15 * TILE_SIZE,
        dir: DIR.NONE,
        nextDir: DIR.NONE,
        mouthOpen: 0,
        mouthSpeed: 0.2
    };

    // Ghosts
    const ghosts = [
        { x: 9 * TILE_SIZE, y: 8 * TILE_SIZE, color: '#ff0000', dir: DIR.LEFT },
        { x: 10 * TILE_SIZE, y: 8 * TILE_SIZE, color: '#ffb8ff', dir: DIR.RIGHT },
        { x: 11 * TILE_SIZE, y: 8 * TILE_SIZE, color: '#00ffff', dir: DIR.UP },
        { x: 10 * TILE_SIZE, y: 9 * TILE_SIZE, color: '#ffb852', dir: DIR.DOWN }
    ];

    // Dots
    const dots = [];

    function init() {
        // Create canvas
        canvas = document.createElement('canvas');
        canvas.width = COLS * TILE_SIZE;
        canvas.height = ROWS * TILE_SIZE;
        canvas.style.border = '2px solid #00f';
        canvas.style.boxShadow = '0 0 20px #00f';
        canvas.style.display = 'block';
        canvas.style.margin = '0 auto';
        
        ctx = canvas.getContext('2d');

        // Create UI elements
        const scoreElement = document.createElement('div');
        scoreElement.id = 'score';
        scoreElement.style.cssText = 'font-family: "Courier New", monospace; font-size: 24px; color: #ff0; text-align: center; margin-bottom: 10px;';
        scoreElement.textContent = `Score: 0/0`;

        const controlsElement = document.createElement('div');
        controlsElement.style.cssText = 'font-family: "Courier New", monospace; font-size: 14px; color: #888; text-align: center; margin-top: 20px;';
        controlsElement.textContent = 'Use Arrow Keys to Move';

        const gameOverElement = document.createElement('div');
        gameOverElement.id = 'gameOver';
        gameOverElement.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); font-family: "Courier New", monospace; font-size: 48px; color: #f00; text-align: center; display: none; text-shadow: 2px 2px 4px #000; z-index: 1000;';
        gameOverElement.innerHTML = 'GAME OVER<div style="font-size: 24px; margin-top: 20px; color: #fff; animation: blink 1s infinite;">Press R to Restart</div>';

        const winElement = document.createElement('div');
        winElement.id = 'win';
        winElement.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); font-family: "Courier New", monospace; font-size: 48px; color: #ff0; text-align: center; display: none; text-shadow: 2px 2px 4px #000; z-index: 1000;';
        winElement.innerHTML = 'YOU WIN!<div style="font-size: 24px; margin-top: 20px; color: #fff; animation: blink 1s infinite;">Press R to Restart</div>';

        // Add blink animation
        const style = document.createElement('style');
        style.textContent = '@keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }';

        // Setup page
        document.body.style.margin = '0';
        document.body.style.padding = '20px';
        document.body.style.background = '#000';
        document.body.style.display = 'flex';
        document.body.style.flexDirection = 'column';
        document.body.style.alignItems = 'center';
        document.body.style.justifyContent = 'center';
        document.body.style.minHeight = '100vh';
        document.body.style.boxSizing = 'border-box';

        document.head.appendChild(style);
        document.body.appendChild(scoreElement);
        document.body.appendChild(canvas);
        document.body.appendChild(controlsElement);
        document.body.appendChild(gameOverElement);
        document.body.appendChild(winElement);

        // Initialize dots
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                if (MAZE[row][col] === 0) {
                    dots.push({
                        x: col * TILE_SIZE + TILE_SIZE / 2,
                        y: row * TILE_SIZE + TILE_SIZE / 2,
                        eaten: false
                    });
                    totalDots++;
                }
            }
        }

        scoreElement.textContent = `Score: 0/${totalDots * 10}`;

        // Input handling
        document.addEventListener('keydown', handleKeyDown);

        // Start game loop
        gameLoop();
    }

    function handleKeyDown(e) {
        const gameOverElement = document.getElementById('gameOver');
        const winElement = document.getElementById('win');

        if (!gameRunning && e.key.toLowerCase() === 'r') {
            resetGame();
            return;
        }
        
        switch(e.key) {
            case 'ArrowUp': 
                e.preventDefault();
                pacman.nextDir = DIR.UP; 
                break;
            case 'ArrowDown': 
                e.preventDefault();
                pacman.nextDir = DIR.DOWN; 
                break;
            case 'ArrowLeft': 
                e.preventDefault();
                pacman.nextDir = DIR.LEFT; 
                break;
            case 'ArrowRight': 
                e.preventDefault();
                pacman.nextDir = DIR.RIGHT; 
                break;
        }
    }

    function isWall(col, row) {
        if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return true;
        return MAZE[row][col] === 1;
    }

    function canMove(x, y, dir) {
        const col = Math.floor((x + TILE_SIZE / 2) / TILE_SIZE);
        const row = Math.floor((y + TILE_SIZE / 2) / TILE_SIZE);
        const nextCol = col + dir.x;
        const nextRow = row + dir.y;
        return !isWall(nextCol, nextRow);
    }

    function isCentered(x, y) {
        return x % TILE_SIZE === 0 && y % TILE_SIZE === 0;
    }

    function updatePacman() {
        // Try to change direction if aligned with grid
        if (isCentered(pacman.x, pacman.y)) {
            if (pacman.nextDir !== DIR.NONE && canMove(pacman.x, pacman.y, pacman.nextDir)) {
                pacman.dir = pacman.nextDir;
            }
            
            // Stop if hitting wall
            if (!canMove(pacman.x, pacman.y, pacman.dir)) {
                pacman.dir = DIR.NONE;
            }
        }

        // Move
        pacman.x += pacman.dir.x * SPEED;
        pacman.y += pacman.dir.y * SPEED;

        // Screen wrap
        if (pacman.x < -TILE_SIZE) pacman.x = canvas.width;
        if (pacman.x > canvas.width) pacman.x = -TILE_SIZE;

        // Animate mouth
        pacman.mouthOpen += pacman.mouthSpeed;
        if (pacman.mouthOpen > 1 || pacman.mouthOpen < 0) {
            pacman.mouthSpeed *= -1;
        }

        // Eat dots
        const pacCenterX = pacman.x + TILE_SIZE / 2;
        const pacCenterY = pacman.y + TILE_SIZE / 2;
        
        dots.forEach(dot => {
            if (!dot.eaten) {
                const dist = Math.hypot(pacCenterX - dot.x, pacCenterY - dot.y);
                if (dist < TILE_SIZE / 3) {
                    dot.eaten = true;
                    score += 10;
                }
            }
        });

        document.getElementById('score').textContent = `Score: ${score}/${totalDots * 10}`;

        // Check win
        if (score >= totalDots * 10) {
            gameRunning = false;
            document.getElementById('win').style.display = 'block';
        }
    }

    function updateGhosts() {
        ghosts.forEach(ghost => {
            // Change direction at intersections or when hitting wall
            if (isCentered(ghost.x, ghost.y)) {
                const directions = [DIR.UP, DIR.DOWN, DIR.LEFT, DIR.RIGHT];
                const validDirs = directions.filter(d => 
                    canMove(ghost.x, ghost.y, d) && 
                    !(d.x === -ghost.dir.x && d.y === -ghost.dir.y)
                );

                if (validDirs.length > 0) {
                    ghost.dir = validDirs[Math.floor(Math.random() * validDirs.length)];
                } else {
                    ghost.dir = { x: -ghost.dir.x, y: -ghost.dir.y };
                }
            }

            ghost.x += ghost.dir.x * (SPEED * 0.8);
            ghost.y += ghost.dir.y * (SPEED * 0.8);

            // Screen wrap
            if (ghost.x < -TILE_SIZE) ghost.x = canvas.width;
            if (ghost.x > canvas.width) ghost.x = -TILE_SIZE;

            // Check collision with Pac-Man
            const dist = Math.hypot(
                (pacman.x + TILE_SIZE/2) - (ghost.x + TILE_SIZE/2),
                (pacman.y + TILE_SIZE/2) - (ghost.y + TILE_SIZE/2)
            );
            
            if (dist < TILE_SIZE * 0.8) {
                gameRunning = false;
                document.getElementById('gameOver').style.display = 'block';
            }
        });
    }

    function drawMaze() {
        ctx.fillStyle = COLORS.bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw walls
        ctx.fillStyle = COLORS.wall;
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                if (MAZE[row][col] === 1) {
                    ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                }
            }
        }

        // Draw dots
        ctx.fillStyle = COLORS.dot;
        dots.forEach(dot => {
            if (!dot.eaten) {
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }

    function drawPacman() {
        const centerX = pacman.x + TILE_SIZE / 2;
        const centerY = pacman.y + TILE_SIZE / 2;
        const radius = TILE_SIZE / 2 - 2;

        ctx.fillStyle = COLORS.pacman;
        ctx.beginPath();

        let startAngle = 0;
        let endAngle = Math.PI * 2;

        if (pacman.dir !== DIR.NONE) {
            const mouthAngle = 0.2 + Math.abs(pacman.mouthOpen) * 0.3;
            
            if (pacman.dir === DIR.RIGHT) {
                startAngle = mouthAngle;
                endAngle = Math.PI * 2 - mouthAngle;
            } else if (pacman.dir === DIR.LEFT) {
                startAngle = Math.PI + mouthAngle;
                endAngle = Math.PI - mouthAngle;
            } else if (pacman.dir === DIR.UP) {
                startAngle = -Math.PI / 2 + mouthAngle;
                endAngle = -Math.PI / 2 - mouthAngle + Math.PI * 2;
            } else if (pacman.dir === DIR.DOWN) {
                startAngle = Math.PI / 2 + mouthAngle;
                endAngle = Math.PI / 2 - mouthAngle;
            }
        }

        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.lineTo(centerX, centerY);
        ctx.fill();
    }

    function drawGhosts() {
        ghosts.forEach(ghost => {
            const centerX = ghost.x + TILE_SIZE / 2;
            const centerY = ghost.y + TILE_SIZE / 2;
            const radius = TILE_SIZE / 2 - 2;

            // Ghost body
            ctx.fillStyle = ghost.color;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, Math.PI, 0);
            ctx.lineTo(centerX + radius, centerY + radius);
            
            // Wavy bottom
            for (let i = 0; i < 3; i++) {
                const x = centerX + radius - (i + 1) * (radius * 2 / 3);
                ctx.quadraticCurveTo(
                    x + radius / 3, centerY + radius - 5,
                    x, centerY + radius
                );
            }
            
            ctx.fill();

            // Eyes
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(centerX - 4, centerY - 2, 4, 0, Math.PI * 2);
            ctx.arc(centerX + 4, centerY - 2, 4, 0, Math.PI * 2);
            ctx.fill();

            // Pupils
            ctx.fillStyle = '#00f';
            ctx.beginPath();
            ctx.arc(centerX - 4 + ghost.dir.x * 2, centerY - 2 + ghost.dir.y * 2, 2, 0, Math.PI * 2);
            ctx.arc(centerX + 4 + ghost.dir.x * 2, centerY - 2 + ghost.dir.y * 2, 2, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    function gameLoop() {
        if (gameRunning) {
            updatePacman();
            updateGhosts();
        }

        drawMaze();
        drawPacman();
        drawGhosts();

        animationId = requestAnimationFrame(gameLoop);
    }

    function resetGame() {
        // Reset Pac-Man
        pacman.x = 10 * TILE_SIZE;
        pacman.y = 15 * TILE_SIZE;
        pacman.dir = DIR.NONE;
        pacman.nextDir = DIR.NONE;

        // Reset Ghosts
        ghosts[0].x = 9 * TILE_SIZE;
        ghosts[0].y = 8 * TILE_SIZE;
        ghosts[1].x = 10 * TILE_SIZE;
        ghosts[1].y = 8 * TILE_SIZE;
        ghosts[2].x = 11 * TILE_SIZE;
        ghosts[2].y = 8 * TILE_SIZE;
        ghosts[3].x = 10 * TILE_SIZE;
        ghosts[3].y = 9 * TILE_SIZE;

        // Reset dots
        dots.forEach(dot => dot.eaten = false);

        // Reset score and state
        score = 0;
        gameRunning = true;
        document.getElementById('gameOver').style.display = 'none';
        document.getElementById('win').style.display = 'none';
        document.getElementById('score').textContent = `Score: 0/${totalDots * 10}`;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
