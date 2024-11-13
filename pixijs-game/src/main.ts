import { Application, Sprite, Graphics, Text, Container } from 'pixi.js';

// Create the application
const app = new Application({
    width: 800,
    height: 600,
    backgroundColor: 0x1099bb,
});

// Add the canvas to the HTML document
document.body.appendChild(app.view as HTMLCanvasElement);

// Create player sprite
const player = Sprite.from('https://pixijs.io/examples/examples/assets/bunny.png');
player.anchor.set(0.5);
player.x = app.screen.width / 2;
player.y = app.screen.height / 2;
app.stage.addChild(player);

// Create enemy balls
interface Ball {
    graphic: Graphics;
    speedX: number;
    speedY: number;
}

const balls: Ball[] = [];
const ballCount = 5;
const ballRadius = 10;
const ballSpeed = 3;

// Create multiple balls
for (let i = 0; i < ballCount; i++) {
    const ball = new Graphics();
    ball.beginFill(0xff0000);  // Red color
    ball.drawCircle(0, 0, ballRadius);
    ball.endFill();
    
    // Random position
    ball.x = Math.random() * app.screen.width;
    ball.y = Math.random() * app.screen.height;
    
    // Random direction
    const angle = Math.random() * Math.PI * 2;
    const speedX = Math.cos(angle) * ballSpeed;
    const speedY = Math.sin(angle) * ballSpeed;
    
    balls.push({
        graphic: ball,
        speedX,
        speedY
    });
    
    app.stage.addChild(ball);
}

// Movement speed
const speed = 5;
const keys: { [key: string]: boolean } = {};

// Set up keyboard listeners
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Collision detection function
function checkCollision(player: Sprite, ball: Graphics): boolean {
    const dx = player.x - ball.x;
    const dy = player.y - ball.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (player.width / 2 + ballRadius);
}

let isGameOver = false;

// Create alert container
function createAlert() {
    const alertContainer = new Container();
    
    // Background overlay
    const overlay = new Graphics();
    overlay.beginFill(0x000000, 0.7);
    overlay.drawRect(0, 0, app.screen.width, app.screen.height);
    overlay.endFill();
    alertContainer.addChild(overlay);
    
    // Alert box
    const alertBox = new Graphics();
    alertBox.beginFill(0x333333);
    alertBox.lineStyle(2, 0xffffff);
    alertBox.drawRect(-200, -150, 400, 300);
    alertBox.endFill();
    alertBox.x = app.screen.width / 2;
    alertBox.y = app.screen.height / 2;
    alertContainer.addChild(alertBox);
    
    // Alert text
    const alertText = new Text('You Lose!', {
        fontFamily: 'Arial',
        fontSize: 48,
        fill: 0xff0000,
        align: 'center'
    });
    alertText.anchor.set(0.5);
    alertText.x = app.screen.width / 2;
    alertText.y = app.screen.height / 2 - 50;
    alertContainer.addChild(alertText);
    
    // Create buttons
    const buttonStyle = {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 0xffffff,
    };
    
    // Restart button
    const restartButton = new Container();
    const restartBg = new Graphics();
    restartBg.beginFill(0x4CAF50);
    restartBg.drawRoundedRect(0, 0, 150, 50, 10);
    restartBg.endFill();
    const restartText = new Text('Play Again', buttonStyle);
    restartText.anchor.set(0.5);
    restartText.x = 75;
    restartText.y = 25;
    restartButton.addChild(restartBg, restartText);
    restartButton.x = app.screen.width / 2 - 160;
    restartButton.y = app.screen.height / 2 + 50;
    restartButton.eventMode = 'static';
    restartButton.cursor = 'pointer';
    
    // Quit button
    const quitButton = new Container();
    const quitBg = new Graphics();
    quitBg.beginFill(0xf44336);
    quitBg.drawRoundedRect(0, 0, 150, 50, 10);
    quitBg.endFill();
    const quitText = new Text('Quit', buttonStyle);
    quitText.anchor.set(0.5);
    quitText.x = 75;
    quitText.y = 25;
    quitButton.addChild(quitBg, quitText);
    quitButton.x = app.screen.width / 2 + 10;
    quitButton.y = app.screen.height / 2 + 50;
    quitButton.eventMode = 'static';
    quitButton.cursor = 'pointer';
    
    alertContainer.addChild(restartButton, quitButton);
    
    // Add button handlers
    restartButton.on('pointerdown', () => {
        restartGame();
        app.stage.removeChild(alertContainer);
    });
    
    quitButton.on('pointerdown', () => {
        window.close();
        // If window.close() doesn't work (due to browser restrictions),
        // redirect to a blank page
        window.location.href = "about:blank";
    });
    
    return alertContainer;
}

// Game loop
app.ticker.add(() => {
    if (isGameOver) return;

    // Move player based on key presses
    if (keys['ArrowLeft']) {
        player.x -= speed;
    }
    if (keys['ArrowRight']) {
        player.x += speed;
    }
    if (keys['ArrowUp']) {
        player.y -= speed;
    }
    if (keys['ArrowDown']) {
        player.y += speed;
    }
    
    // Keep player within bounds
    player.x = Math.max(player.width / 2, Math.min(app.screen.width - player.width / 2, player.x));
    player.y = Math.max(player.height / 2, Math.min(app.screen.height - player.height / 2, player.y));

    // Update balls
    for (const ball of balls) {
        // Move ball
        ball.graphic.x += ball.speedX;
        ball.graphic.y += ball.speedY;

        // Bounce off walls
        if (ball.graphic.x <= ballRadius || ball.graphic.x >= app.screen.width - ballRadius) {
            ball.speedX *= -1;
        }
        if (ball.graphic.y <= ballRadius || ball.graphic.y >= app.screen.height - ballRadius) {
            ball.speedY *= -1;
        }

        // Check collision with player
        if (checkCollision(player, ball.graphic)) {
            isGameOver = true;
            app.stage.addChild(createAlert());
        }
    }
});

// Function to restart the game
function restartGame() {
    isGameOver = false;
    // Reset player position
    player.x = app.screen.width / 2;
    player.y = app.screen.height / 2;
    
    // Reset balls
    balls.forEach(ball => {
        ball.graphic.x = Math.random() * app.screen.width;
        ball.graphic.y = Math.random() * app.screen.height;
        const angle = Math.random() * Math.PI * 2;
        ball.speedX = Math.cos(angle) * ballSpeed;
        ball.speedY = Math.sin(angle) * ballSpeed;
    });
}

// Remove the keyboard 'R' restart listener since we now have buttons