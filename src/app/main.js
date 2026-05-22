let gameSceneInstance = null;

export function dropPlinko(betAmount) {
    if (!gameSceneInstance) return;

    const scene = gameSceneInstance;
    const betAmountNum = parseFloat(betAmount);

    if (betAmountNum === 0 || isNaN(betAmountNum)) {
        return;
    }

    try { scene.sound.play('mouseClick', { volume: 3.0 }); } catch { }
    const BALL_RADIUS = scene.BALL_RADIUS;
    const BASE_WIDTH = scene.BASE_WIDTH;

    if (!scene.textures.exists('ball')) {
        const ballGraphics = scene.add.graphics();
        ballGraphics.fillStyle(0xff0000, 1);
        ballGraphics.fillCircle(BALL_RADIUS, BALL_RADIUS, BALL_RADIUS);
        ballGraphics.generateTexture('ball', BALL_RADIUS * 2, BALL_RADIUS * 2);
        ballGraphics.destroy();
    }

    const CATEGORY_BALL = 1;
    const CATEGORY_OBSTACLE = 2;
    const rand_x = Phaser.Math.Between(1, 20) * (Phaser.Math.Between(0, 1) ? 1 : -1);
    const ball = scene.matter.add.image(BASE_WIDTH / 2 + rand_x, -10, 'ball');
    ball.setCircle(BALL_RADIUS);
    ball.setBounce(0.3);
    ball.setDensity(10000);
    ball.setMass(1000);
    ball.body.collisionFilter.category = CATEGORY_BALL;
    ball.body.collisionFilter.mask = CATEGORY_OBSTACLE;
    ball.setData('betAmount', betAmountNum);
}

export function initGame(container) {
    // Fixed base dimensions - these will be our reference sizes
    const BASE_WIDTH = 1229;  // Minimum width
    const BASE_HEIGHT = 591;  // Minimum height

    // Initialize game with base dimensions
    const config = {
        type: Phaser.AUTO,
        width: BASE_WIDTH,
        height: BASE_HEIGHT,
        backgroundColor: '#0F212E',
        parent: container,
        resolution: window.devicePixelRatio,
        scale: {
            mode: Phaser.Scale.NONE
        },
        scene: {
            preload: preload,
            create: create,
            update: update
        },
        physics: {
            default: 'matter',
            matter: {
                gravity: { y: 1 }
            }
        },
        fps: {
            target: 60,
            forceSetTimeOut: true,
        },
        audio: {
            noAudio: false,
        },
    };

    // Create game instance
    const game = new Phaser.Game(config);

    // Constants using BASE dimensions
    const OBSTACLE_RADIUS = Math.trunc(BASE_WIDTH / 210);
    const OBSTACLE_PAD = Math.ceil(BASE_HEIGHT / 20);
    const INIT_ROW_COUNT = 3;
    const FINAL_ROW_COUNT = 18;
    const OBSTACLE_START = {
        x: Math.trunc((BASE_WIDTH / 2) - OBSTACLE_PAD),
        y: Math.trunc(BASE_HEIGHT * 0.07)
    };
    const BALL_RADIUS = OBSTACLE_RADIUS * 1.9;
    const MULTI_WIDTH = OBSTACLE_PAD - OBSTACLE_RADIUS * 0.01;
    const MULTI_HEIGHT = OBSTACLE_PAD;
    const MULTI_PAD = OBSTACLE_PAD;
    const MULTI_HISTORY_HEIGHT = 60;
    const MULTI_HISTORY_INIT_Y = BASE_HEIGHT / 2 - 150;

    const CATEGORY_BALL = 1;
    const CATEGORY_OBSTACLE = 2;
    const CATEGORY_MULTI = 3;

    const MULTI_CONFIG = {
        0: { multiplier: 1000, color: [255, 0, 0] },
        1: { multiplier: 130, color: [255, 30, 0] },
        2: { multiplier: 26, color: [255, 60, 0] },
        3: { multiplier: 9, color: [255, 90, 0] },
        4: { multiplier: 4, color: [255, 120, 0] },
        5: { multiplier: 2, color: [255, 150, 0] },
        6: { multiplier: 0.2, color: [255, 180, 0] },
        7: { multiplier: 0.2, color: [255, 210, 0] },
        8: { multiplier: 0.2, color: [255, 240, 0] },
        9: { multiplier: 0.2, color: [255, 210, 0] },
        10: { multiplier: 0.2, color: [255, 180, 0] },
        11: { multiplier: 2, color: [255, 150, 0] },
        12: { multiplier: 4, color: [255, 120, 0] },
        13: { multiplier: 9, color: [255, 90, 0] },
        14: { multiplier: 26, color: [255, 60, 0] },
        15: { multiplier: 130, color: [255, 30, 0] },
        16: { multiplier: 1000, color: [255, 0, 0] }
    };

    const NUM_MULTIS = 17;
    let multiHistory = [];
    const maxHistoryDisplay = 4;
    let prevCnt = 0;


    // Modify your existing functions to use BASE dimensions
    function preload() {
        // WebFont.load({
        //     custom: {
        //         families: ['plinko_bold', 'plinko_m'],
        //     }
        // });
        this.load.audio('mouseClick', '/assets/audio/mouseClick.mp3');
        this.load.audio('ballBounce', '/assets/audio/ballBounce.mp3');
        const betButton = document.getElementById('bet-btn');
        const handleBetClick = () => {
            const betAmount = parseFloat(document.getElementById('betAmount').value);
            if (betAmount === 0 || isNaN(betAmount)) {
                return;
            }
            try { this.sound.play('mouseClick', { volume: 3.0 }); } catch { }
            if (!this.textures.exists('ball')) {
                const ballGraphics = this.add.graphics();
                ballGraphics.fillStyle(0xff0000, 1);
                ballGraphics.fillCircle(BALL_RADIUS, BALL_RADIUS, BALL_RADIUS);
                ballGraphics.generateTexture('ball', BALL_RADIUS * 2, BALL_RADIUS * 2);
                ballGraphics.destroy();
            }

            const rand_x = Phaser.Math.Between(1, 20) * (Phaser.Math.Between(0, 1) ? 1 : -1);
            const ball = this.matter.add.image(BASE_WIDTH / 2 + rand_x, -10, 'ball');
            ball.setCircle(BALL_RADIUS);
            ball.setBounce(0.3);
            ball.setDensity(10000);
            ball.setMass(1000);
            ball.body.collisionFilter.category = CATEGORY_BALL;
            ball.body.collisionFilter.mask = CATEGORY_OBSTACLE;
            ball.setData('betAmount', betAmount);
        };
        betButton.addEventListener('click', handleBetClick);
        // Remove listener when this scene is destroyed so stale handlers
        // from React StrictMode double-invoke don't fire on the dead scene.
        this.events.once('shutdown', () => betButton.removeEventListener('click', handleBetClick));
    }

    function create() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        gameSceneInstance = this;
        this.BALL_RADIUS = BALL_RADIUS;
        this.BASE_WIDTH = BASE_WIDTH;
        const graphics = this.add.graphics();
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(OBSTACLE_RADIUS, OBSTACLE_RADIUS, OBSTACLE_RADIUS);
        graphics.generateTexture('obstacle', OBSTACLE_RADIUS * 2, OBSTACLE_RADIUS * 2);
        graphics.destroy();

        let pos = OBSTACLE_START;
        for (let row = INIT_ROW_COUNT; row <= FINAL_ROW_COUNT; row++) {
            for (let col = 0; col < row; col++) {
                const obstacle = this.matter.add.image(pos.x, pos.y, 'obstacle');
                obstacle.setCircle(OBSTACLE_RADIUS);
                obstacle.setStatic(true);
                obstacle.setFriction(0.6);
                obstacle.setBounce(0);
                obstacle.body.collisionFilter.category = CATEGORY_OBSTACLE;
                obstacle.body.collisionFilter.mask = CATEGORY_BALL;
                obstacle.setOnCollide(() => {
                    // const ball = pair.bodyA.gameObject === obstacle ? pair.bodyB.gameObject : pair.bodyA.gameObject;
                    const shadowGraphics = this.add.graphics();
                    shadowGraphics.fillStyle(0xffffff, 0.5);
                    shadowGraphics.fillCircle(OBSTACLE_RADIUS, OBSTACLE_RADIUS, OBSTACLE_RADIUS);
                    shadowGraphics.generateTexture('shadow', OBSTACLE_RADIUS * 2, OBSTACLE_RADIUS * 2);
                    shadowGraphics.destroy();
                    if (!obstacle.shadow || !obstacle.shadow.active) {
                        const shadow = this.add.image(obstacle.x, obstacle.y, 'shadow');
                        shadow.setDepth(obstacle.depth - 1);
                        obstacle.shadow = shadow;
                        this.tweens.add({
                            targets: shadow,
                            scaleX: 1.8,
                            scaleY: 1.8,
                            alpha: 0,
                            duration: 300,
                            ease: 'Power1',
                            onComplete: () => {
                                shadow.destroy();
                                obstacle.shadow = null;
                            }
                        });
                    }
                });

                pos.x += OBSTACLE_PAD;
            }
            pos.x = BASE_WIDTH - pos.x + 0.5 * OBSTACLE_PAD;
            pos.y += OBSTACLE_PAD;
        }

        pos.x += OBSTACLE_PAD;
        for (let i = 0; i < NUM_MULTIS; i++) {
            const multiGraphics = this.add.graphics();
            const shadowColor = Phaser.Display.Color.Interpolate.ColorWithColor(
                new Phaser.Display.Color(MULTI_CONFIG[i].color[0], MULTI_CONFIG[i].color[1], MULTI_CONFIG[i].color[2]),
                new Phaser.Display.Color(0, 0, 0),
                100,
                50
            );
            multiGraphics.fillStyle(Phaser.Display.Color.GetColor(shadowColor.r, shadowColor.g, shadowColor.b), 1);
            multiGraphics.fillRoundedRect(0, 0, MULTI_WIDTH, MULTI_HEIGHT, 5);
            multiGraphics.fillStyle(Phaser.Display.Color.GetColor(MULTI_CONFIG[i].color[0], MULTI_CONFIG[i].color[1], MULTI_CONFIG[i].color[2]), 1);
            multiGraphics.fillRoundedRect(0, 0, MULTI_WIDTH, MULTI_HEIGHT - 5, 5);
            multiGraphics.generateTexture(`multi${i}`, MULTI_WIDTH, MULTI_HEIGHT);
            multiGraphics.destroy();
            const multi = this.matter.add.image(pos.x, pos.y, `multi${i}`);
            multi.setRectangle(MULTI_WIDTH, MULTI_HEIGHT + 10, { chamfer: { radius: 5 } });
            multi.setStatic(true);

            const multiplierText = MULTI_CONFIG[i].multiplier >= 100 ? `${MULTI_CONFIG[i].multiplier}` : `${MULTI_CONFIG[i].multiplier}x`;
            const scoreText = this.add.text(pos.x, pos.y, multiplierText, { font: '14px plinko_bold', fill: '#000000', fontWeight: 'bold' });
            scoreText.setOrigin(0.5, 0.6);

            pos.x += MULTI_PAD;
            multi.setCollisionCategory(CATEGORY_MULTI);
            multi.setCollidesWith(CATEGORY_BALL);
            multi.setOnCollide((pair) => {
                const ball = pair.bodyA.gameObject === multi ? pair.bodyB.gameObject : pair.bodyA.gameObject;
                // read this first before getting destroyed
                const betAmount = parseFloat(ball.getData('betAmount'));
                ball.destroy();
                try { this.sound.play('ballBounce', { volume: 1.0, detune: Phaser.Math.Between(-100, 200) }); } catch { }
                const originalY = pos.y;
                const targetY = Math.min(multi.y + 10, originalY + 10);
                this.tweens.add({
                    targets: [multi, scoreText],
                    y: targetY,
                    duration: 100,
                    yoyo: true,
                    ease: 'Power1',
                    onComplete: () => {
                        multi.y = originalY;
                        scoreText.y = originalY;
                        const multiplier = MULTI_CONFIG[i].multiplier;
                        const event = new CustomEvent('updateBalance', {
                            detail: {
                                changeAmount: parseFloat((betAmount * multiplier).toFixed(2))
                            }
                        });
                        window.dispatchEvent(event);
                    }
                });
                multiHistory.push(i);
            });
        }

        const historyX = BASE_WIDTH - 200;
        const historyY = MULTI_HISTORY_INIT_Y;

        const historyBackground = this.add.graphics();
        historyBackground.setDepth(10);
        historyBackground.fillStyle(0x0F212E, 1);
        historyBackground.fillRect(historyX, historyY - MULTI_HISTORY_HEIGHT, MULTI_HISTORY_HEIGHT, MULTI_HISTORY_HEIGHT);

        const carveGraphics = this.add.graphics();
        carveGraphics.setDepth(1000);
        carveGraphics.fillStyle(0x0F212E, 1);
        carveGraphics.beginPath();
        carveGraphics.moveTo(historyX, historyY + 10);
        carveGraphics.arc(historyX + 10, historyY + 10, 10, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(270), false);
        carveGraphics.lineTo(historyX + MULTI_HISTORY_HEIGHT - 10, historyY);
        carveGraphics.arc(historyX + MULTI_HISTORY_HEIGHT - 10, historyY + 10, 10, Phaser.Math.DegToRad(270), Phaser.Math.DegToRad(360), false);
        carveGraphics.lineTo(historyX + MULTI_HISTORY_HEIGHT, historyY);
        carveGraphics.lineTo(historyX, historyY);
        carveGraphics.closePath();
        carveGraphics.fillPath();

        const historyBackgroundBottom = this.add.graphics();
        historyBackgroundBottom.setDepth(10);
        historyBackgroundBottom.fillStyle(0x0F212E, 1);
        historyBackgroundBottom.fillRect(historyX, historyY + 4 * MULTI_HISTORY_HEIGHT, MULTI_HISTORY_HEIGHT, MULTI_HISTORY_HEIGHT);

        const carveGraphicsBottom = this.add.graphics();
        carveGraphicsBottom.setDepth(1000);
        carveGraphicsBottom.fillStyle(0x0F212E, 1);
        carveGraphicsBottom.beginPath();
        carveGraphicsBottom.moveTo(historyX, historyY + 4 * MULTI_HISTORY_HEIGHT - 10);
        carveGraphicsBottom.arc(historyX + 10, historyY + 4 * MULTI_HISTORY_HEIGHT - 10, 10, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(90), true);
        carveGraphicsBottom.lineTo(historyX + MULTI_HISTORY_HEIGHT - 10, historyY + 4 * MULTI_HISTORY_HEIGHT);
        carveGraphicsBottom.arc(historyX + MULTI_HISTORY_HEIGHT - 10, historyY + 4 * MULTI_HISTORY_HEIGHT - 10, 10, Phaser.Math.DegToRad(90), Phaser.Math.DegToRad(0), true);
        carveGraphicsBottom.lineTo(historyX + MULTI_HISTORY_HEIGHT, historyY + 4 * MULTI_HISTORY_HEIGHT);
        carveGraphicsBottom.lineTo(historyX, historyY + 4 * MULTI_HISTORY_HEIGHT);
        carveGraphicsBottom.closePath();
        carveGraphicsBottom.fillPath();
    }

    function update() {
        if (prevCnt != multiHistory.length) {
            prevCnt = multiHistory.length;

            const historyX = BASE_WIDTH - 200;
            const historyY = MULTI_HISTORY_INIT_Y;
            const historyWidth = MULTI_HISTORY_HEIGHT;
            const historyHeight = MULTI_HISTORY_HEIGHT;

            const historyToShow = multiHistory.slice(-maxHistoryDisplay);
            for (let i = historyToShow.length - 1; i >= 0; i--) {
                const multiIndex = historyToShow[i];
                const x = historyX;
                const y = historyY + (historyHeight) * i;
                const color = MULTI_CONFIG[multiIndex].color;
                const multiplierText = `${MULTI_CONFIG[multiIndex].multiplier}x`;
                const historyGraphics = this.add.graphics();
                historyGraphics.fillStyle(Phaser.Display.Color.GetColor(color[0], color[1], color[2]), 1);

                const isFirst = i === 0 && historyToShow.length <= 4;
                const isLast = i === historyToShow.length - 1 && historyToShow.length <= 4;
                const radius = 10;

                if (isFirst || isLast) {
                    historyGraphics.fillRoundedRect(x, y, historyWidth, historyHeight, { tl: isFirst ? radius : 0, tr: isFirst ? radius : 0, bl: isLast ? radius : 0, br: isLast ? radius : 0 });
                } else {
                    historyGraphics.fillRect(x, y, historyWidth, historyHeight);
                }

                const historyText = this.add.text(x + historyWidth / 2, y + historyHeight / 2, multiplierText, { font: '15px plinko_bold', fill: '#000000', fontWeight: 'bold' });
                historyText.setOrigin(0.5, 0.5);

                if (multiHistory.length > 4) {
                    this.tweens.add({
                        targets: [historyText, historyGraphics],
                        y: `-=${historyHeight}`,
                        duration: 100,
                        ease: "Linear",
                        onComplete: () => {
                            if (historyText.y < historyY) {
                                historyGraphics.destroy();
                                historyText.destroy();
                            } else {
                                historyGraphics.fillRect(x, y, historyWidth, historyHeight);
                            }
                        }
                    });
                }
            }

            if (multiHistory.length > 4) {
                multiHistory = multiHistory.slice(-4);
                prevCnt = 4;
            }
        }
    }

    return game;
}