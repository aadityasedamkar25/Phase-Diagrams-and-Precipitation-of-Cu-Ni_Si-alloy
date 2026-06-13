const canvas = document.getElementById('gameBoard');
const ctx = canvas.getContext('2d');
const rollBtn = document.getElementById('rollBtn');
const resetBtn = document.getElementById('resetBtn');
const diceDisplay = document.getElementById('dice');
const messageDisplay = document.getElementById('message');
const p1PosDisplay = document.getElementById('p1-pos');
const p2PosDisplay = document.getElementById('p2-pos');
const p1Status = document.getElementById('player1-status');
const p2Status = document.getElementById('player2-status');
const gameLog = document.getElementById('gameLog');

// Game Constants
const BOARD_SIZE = 10;
const SQUARE_SIZE = canvas.width / BOARD_SIZE;

// Refined Snakes and Ladders
const boardObjects = {
    // Ladders
    2: 38,
    7: 14,
    8: 31,
    15: 26,
    21: 42,
    28: 84,
    36: 44,
    51: 67,
    71: 91,
    78: 98,
    87: 94,

    // Snakes
    16: 6,
    46: 25,
    49: 11,
    62: 19,
    64: 60,
    74: 53,
    89: 68,
    92: 88,
    95: 75,
    99: 80
};

let players = [
    { id: 1, pos: 1, color: '#e74c3c', name: 'Player 1' },
    { id: 2, pos: 1, color: '#3498db', name: 'CPU' }
];

let currentPlayerIndex = 0;
let isGameOver = false;
let isMoving = false;
let gameSessionId = 0; // To track and cancel animations on reset

// Initialize Board positions
function getCoordinates(pos) {
    let row = Math.floor((pos - 1) / BOARD_SIZE);
    let col = (pos - 1) % BOARD_SIZE;

    // Standard Boustrophedon (snake-like) board layout
    if (row % 2 !== 0) {
        col = BOARD_SIZE - 1 - col;
    }

    let x = col * SQUARE_SIZE + SQUARE_SIZE / 2;
    let y = canvas.height - (row * SQUARE_SIZE + SQUARE_SIZE / 2);

    return { x, y };
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Squares
    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
        let row = Math.floor(i / BOARD_SIZE);
        let col = i % BOARD_SIZE;

        // Alternating colors
        ctx.fillStyle = (row + col) % 2 === 0 ? '#ecf0f1' : '#bdc3c7';
        ctx.fillRect(col * SQUARE_SIZE, canvas.height - (row + 1) * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);

        // Square numbers
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 14px Arial';
        let displayCol = (row % 2 === 0) ? col : (BOARD_SIZE - 1 - col);
        let num = row * BOARD_SIZE + displayCol + 1;
        ctx.fillText(num, col * SQUARE_SIZE + 5, canvas.height - (row * SQUARE_SIZE) - SQUARE_SIZE + 18);
    }

    // Draw Ladders
    for (let start in boardObjects) {
        if (boardObjects[parseInt(start)] > parseInt(start)) {
            drawObject(start, boardObjects[start]);
        }
    }

    // Draw Snakes
    for (let start in boardObjects) {
        if (boardObjects[parseInt(start)] < parseInt(start)) {
            drawObject(start, boardObjects[start]);
        }
    }

    // Draw Players
    players.forEach((player, index) => {
        let { x, y } = getCoordinates(player.pos);

        // Offset if on same square
        if (players[0].pos === players[1].pos && players[0].pos !== 1) {
            x += (index === 0 ? -12 : 12);
        }

        ctx.beginPath();
        ctx.arc(x, y, SQUARE_SIZE / 3.5, 0, Math.PI * 2);
        ctx.fillStyle = player.color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Add shadow to player
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.stroke();
        ctx.shadowColor = 'transparent';

        ctx.closePath();
    });
}

function drawObject(start, end, color) {
    const startCoord = getCoordinates(parseInt(start));
    const endCoord = getCoordinates(parseInt(end));

    const isLadder = parseInt(end) > parseInt(start);

    if (isLadder) {
        drawLadder(startCoord, endCoord);
    } else {
        drawSnake(startCoord, endCoord);
    }
}

function drawLadder(start, end) {
    const steps = 5;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const angle = Math.atan2(dy, dx);
    const length = Math.sqrt(dx * dx + dy * dy);
    const width = 15;

    ctx.save();
    ctx.translate(start.x, start.y);
    ctx.rotate(angle);

    ctx.strokeStyle = '#795548';
    ctx.lineWidth = 4;

    // Sides
    ctx.beginPath();
    ctx.moveTo(0, -width);
    ctx.lineTo(length, -width);
    ctx.moveTo(0, width);
    ctx.lineTo(length, width);
    ctx.stroke();

    // Rungs
    for (let i = 1; i < steps; i++) {
        let px = (length / steps) * i;
        ctx.beginPath();
        ctx.moveTo(px, -width);
        ctx.lineTo(px, width);
        ctx.stroke();
    }

    ctx.restore();
}

function drawSnake(start, end) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    ctx.save();
    ctx.translate(start.x, start.y);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(0, 0);

    const segments = 20;
    const amplitude = 10;
    for (let i = 0; i <= segments; i++) {
        let x = (length / segments) * i;
        let y = Math.sin((i / segments) * Math.PI * 4) * amplitude;
        ctx.lineTo(x, y);
    }

    ctx.strokeStyle = '#2ecc71';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Head
    ctx.fillStyle = '#2ecc71';
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-2, -2, 2, 0, Math.PI * 2);
    ctx.arc(-2, 2, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

async function movePlayer(playerIndex, steps, currentSessionId) {
    isMoving = true;
    let player = players[playerIndex];
    let oldPos = player.pos;
    let newPos = oldPos + steps;

    if (newPos > 100) {
        addToLog(`${player.name} needs exact roll to win. Stay at ${oldPos}`);
        isMoving = false;
        return;
    }

    // Animate step by step
    for (let i = 1; i <= steps; i++) {
        if (currentSessionId !== gameSessionId) return; // Cancel if reset
        player.pos++;
        drawBoard();
        updateUI();
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    if (currentSessionId !== gameSessionId) return;

    // Check for snake or ladder
    if (boardObjects[player.pos]) {
        let destination = boardObjects[player.pos];
        let type = destination > player.pos ? 'Ladder' : 'Snake';
        addToLog(`${player.name} hit a ${type}! Move to ${destination}`);

        await new Promise(resolve => setTimeout(resolve, 500));
        if (currentSessionId !== gameSessionId) return;
        player.pos = destination;
        drawBoard();
        updateUI();
    }

    if (player.pos === 100) {
        isGameOver = true;
        messageDisplay.innerText = `${player.name} wins!`;
        addToLog(`${player.name} wins the game!`);
        rollBtn.disabled = true;
    }

    isMoving = false;
}

function addToLog(msg) {
    const p = document.createElement('p');
    p.innerText = msg;
    gameLog.prepend(p);
}

function updateUI() {
    p1PosDisplay.innerText = players[0].pos;
    p2PosDisplay.innerText = players[1].pos;

    if (currentPlayerIndex === 0) {
        p1Status.classList.add('active');
        p2Status.classList.remove('active');
    } else {
        p2Status.classList.add('active');
        p1Status.classList.remove('active');
    }
}

async function animateDice(currentSessionId) {
    return new Promise(resolve => {
        let count = 0;
        const interval = setInterval(() => {
            if (currentSessionId !== gameSessionId) {
                clearInterval(interval);
                return;
            }
            diceDisplay.innerText = Math.floor(Math.random() * 6) + 1;
            count++;
            if (count > 10) {
                clearInterval(interval);
                let finalRoll = Math.floor(Math.random() * 6) + 1;
                diceDisplay.innerText = finalRoll;
                resolve(finalRoll);
            }
        }, 50);
    });
}

async function handleRoll() {
    if (isGameOver || isMoving) return;

    let currentSessionId = gameSessionId;
    rollBtn.disabled = true;
    let roll = await animateDice(currentSessionId);

    if (currentSessionId !== gameSessionId) return;

    let currentPlayer = players[currentPlayerIndex];
    addToLog(`${currentPlayer.name} rolled a ${roll}`);

    await movePlayer(currentPlayerIndex, roll, currentSessionId);

    if (currentSessionId !== gameSessionId) return;

    if (!isGameOver) {
        // If roll is 6, same player goes again
        if (roll === 6) {
            addToLog(`${currentPlayer.name} rolled a 6! Extra turn.`);
        } else {
            currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        }

        messageDisplay.innerText = `${players[currentPlayerIndex].name}'s turn`;
        updateUI();

        // If CPU turn, auto-roll
        if (currentPlayerIndex === 1 && !isGameOver) {
            rollBtn.disabled = true;
            setTimeout(() => {
                if (currentSessionId === gameSessionId) {
                    handleRoll();
                }
            }, 1000);
        } else {
            rollBtn.disabled = false;
        }
    }
}

resetBtn.addEventListener('click', () => {
    gameSessionId++; // Increment to cancel any ongoing async actions
    players[0].pos = 1;
    players[1].pos = 1;
    currentPlayerIndex = 0;
    isGameOver = false;
    isMoving = false;
    rollBtn.disabled = false;
    diceDisplay.innerText = '?';
    messageDisplay.innerText = "Player 1's turn";
    gameLog.innerHTML = '<p>Game Reset!</p>';
    updateUI();
    drawBoard();
});

rollBtn.addEventListener('click', handleRoll);

// Initial Draw
drawBoard();
updateUI();
