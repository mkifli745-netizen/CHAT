// Canvas setup
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game variables
const paddleWidth = 15;
const paddleHeight = 100;
const ballSize = 8;
const paddleSpeed = 6;
const ballSpeed = 5;
const computerSpeed = 4.5;

let playerScore = 0;
let computerScore = 0;

// Keyboard input
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Mouse input
let mouseY = canvas.height / 2;
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Paddle object
const playerPaddle = {
    x: 20,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    draw: function() {
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        // Paddle glow effect
        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = 20;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    },
    update: function() {
        // Keyboard input
        if (keys['ArrowUp'] || keys['w']) {
            this.y -= paddleSpeed;
        }
        if (keys['ArrowDown'] || keys['s']) {
            this.y += paddleSpeed;
        }

        // Mouse input
        const centerY = mouseY - this.height / 2;
        const distance = centerY - this.y;
        if (Math.abs(distance) > 5) {
            this.y += distance * 0.15; // Smooth mouse following
        }

        // Boundary collision
        if (this.y < 0) this.y = 0;
        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
        }
    }
};

const computerPaddle = {
    x: canvas.width - 20 - paddleWidth,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    draw: function() {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        // Paddle glow effect
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 20;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    },
    update: function() {
        const paddleCenter = this.y + this.height / 2;
        const ballCenter = ball.y;

        // AI logic with slight imperfection
        if (ballCenter < paddleCenter - 35) {
            this.y -= computerSpeed;
        } else if (ballCenter > paddleCenter + 35) {
            this.y += computerSpeed;
        }

        // Boundary collision
        if (this.y < 0) this.y = 0;
        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
        }
    }
};

// Ball object
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: ballSpeed,
    dy: ballSpeed * 0.5,
    radius: ballSize,
    draw: function() {
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        // Ball glow effect
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    },
    update: function() {
        this.x += this.dx;
        this.y += this.dy;

        // Top and bottom wall collision
        if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) {
            this.dy = -this.dy;
            // Keep ball in bounds
            if (this.y - this.radius < 0) this.y = this.radius;
            if (this.y + this.radius > canvas.height) this.y = canvas.height - this.radius;
        }

        // Left wall (computer scores)
        if (this.x - this.radius < 0) {
            computerScore++;
            document.getElementById('computerScore').textContent = computerScore;
            this.reset();
        }

        // Right wall (player scores)
        if (this.x + this.radius > canvas.width) {
            playerScore++;
            document.getElementById('playerScore').textContent = playerScore;
            this.reset();
        }

        // Paddle collision - Player
        if (
            this.dx < 0 &&
            this.x - this.radius < playerPaddle.x + playerPaddle.width &&
            this.y > playerPaddle.y &&
            this.y < playerPaddle.y + playerPaddle.height
        ) {
            this.dx = -this.dx;
            // Add spin based on where the ball hits the paddle
            const hitPos = (this.y - playerPaddle.y) / playerPaddle.height - 0.5;
            this.dy += hitPos * 4;
            // Keep ball from getting stuck
            this.x = playerPaddle.x + playerPaddle.width + this.radius;
        }

        // Paddle collision - Computer
        if (
            this.dx > 0 &&
            this.x + this.radius > computerPaddle.x &&
            this.y > computerPaddle.y &&
            this.y < computerPaddle.y + computerPaddle.height
        ) {
            this.dx = -this.dx;
            // Add spin based on where the ball hits the paddle
            const hitPos = (this.y - computerPaddle.y) / computerPaddle.height - 0.5;
            this.dy += hitPos * 4;
            // Keep ball from getting stuck
            this.x = computerPaddle.x - this.radius;
        }

        // Speed limit
        const maxSpeed = 10;
        if (this.dy > maxSpeed) this.dy = maxSpeed;
        if (this.dy < -maxSpeed) this.dy = -maxSpeed;
    },
    reset: function() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.dx = (Math.random() > 0.5 ? 1 : -1) * ballSpeed;
        this.dy = (Math.random() - 0.5) * ballSpeed;
    }
};

// Draw center line
function drawCenterLine() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

// Game loop
function gameLoop() {
    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    drawCenterLine();

    // Update and draw game objects
    playerPaddle.update();
    playerPaddle.draw();

    computerPaddle.update();
    computerPaddle.draw();

    ball.update();
    ball.draw();

    // Continue game loop
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();

