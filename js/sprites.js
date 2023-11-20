const gravity = 0.2;
const floorHeight = 50;
const backgroundSpritePath = "./assets/background/bg.png";
const defaultObjectSpritePath = "file:///C:/xampp/htdocs/assets/objects/square.svg";

const fireSound = new Audio('https://raw.githubusercontent.com/NiangZd/Jogo-Luta-Web/main/assets/sounds/soundAtk/bolaDeFogo.mp3');

const swordSound = new Audio('https://raw.githubusercontent.com/NiangZd/Jogo-Luta-Web/main/assets/sounds/soundAtk/ataqueEspada.mp3');


class Sprite {
    constructor({ position, velocity, source, scale, offset, sprites }) {
        this.position = position;
        this.velocity = velocity;

        this.scale = scale || 1;
        this.image = new Image();
        this.image.src = source || defaultObjectSpritePath;
        this.width = this.image.width * this.scale;
        this.height = this.image.height * this.scale;

        this.offset = offset || {
            x: 0,
            y: 0,
        };

        this.sprites = sprites || {
            idle: {
                src: this.image.src,
                totalSpriteFrames: 1,
                framesPerSpriteFrame: 1,
            },
        };

        this.currentSprite = this.sprites.idle;

        this.currentSpriteFrame = 0;
        this.elapsedTime = 0;
        this.totalSpriteFrames = this.sprites.idle.totalSpriteFrames;
        this.framesPerSpriteFrame = this.sprites.idle.framesPerSpriteFrame;
    }

    setSprite(sprite) {
        this.currentSprite = this.sprites[sprite];

        if (!this.currentSprite) {
            this.currentSprite = this.sprites.idle;
        }
    }
    

    loadSprite() {
        let previousSprite = this.image.src;

        this.image = new Image();
        this.image.src = this.currentSprite.src;
        this.width = this.image.width * this.scale;
        this.height = this.image.height * this.scale;

        this.totalSpriteFrames = this.currentSprite.totalSpriteFrames;
        this.framesPerSpriteFrame = this.currentSprite.framesPerSpriteFrame;

        let newSprite = this.image.src;

        if (previousSprite !== newSprite) {
            // Corrects the sprite's position when switching sprites
            console.log(
                "Detected sprite change: ",
                previousSprite.split("/").pop(),
                " -> ",
                newSprite.split("/").pop()
            );

            let previousSpriteImage = new Image();
            previousSpriteImage.src = previousSprite;

            // Corrects the sprite's position:
            this.position.y += (previousSpriteImage.height - this.image.height) * this.scale;
        }
    }


    draw(ctx) {
        ctx.imageSmoothingEnabled = false;

        // Determine the x-scale based on the facing direction
        const xScale = this.facing === "left" ? -1 : 1;

        this.drawHealthBar(ctx);

        ctx.save();
        ctx.translate(this.position.x + this.offset.x, this.position.y + this.offset.y);
        ctx.scale(xScale, 1); // Flip the image horizontally if facing left

        ctx.drawImage(
            this.image,
            (this.currentSpriteFrame * this.image.width) / this.totalSpriteFrames,
            0,
            this.image.width / this.totalSpriteFrames,
            this.image.height,
            0,
            0,
            (this.width / this.totalSpriteFrames) * xScale, // Adjust the width with x-scale
            this.height
        );

        ctx.restore();
    }

    animate() {
        this.elapsedTime += 1;

        if (this.elapsedTime >= this.framesPerSpriteFrame) {
            this.currentSpriteFrame += 1;

            if (this.currentSpriteFrame >= this.totalSpriteFrames) {
                this.currentSpriteFrame = 0;
            }

            this.elapsedTime = 0;
        }
    }

    update(ctx) {
        this.draw(ctx);
        this.animate();
    }

    drawHealthBar(ctx) {
        // Placeholder drawHealthBar for the base class
    }
}

class Fighter extends Sprite {
    constructor({
        position,
        velocity,
        attackBox,
        sprites,
        scale,
        maxHealth = 200,
        currentHealth = 200,
        attackCooldown = 500,
        fireAttackCooldown = 5000,
        pontos = 0,

    }) {
        super({
            position,
            velocity,
            scale,
            sprites,
        });

        this.velocity = velocity;
        this.pontos = pontos;
        this.attackBox = {
            position: {
                x: this.position.x + (this.width - 125) / 2, // Ajuste para o centro do tronco
                y: this.position.y + this.height - 50, // Ajuste para a parte inferior do tronco
            },
            width: 125,
            height: 150,
        };
        this.maxHealth = maxHealth;
        this.currentHealth = currentHealth;
        this.isAttacking;
        this.isFire;
        this.attackCooldown = attackCooldown;
        this.fireAttackCooldown = fireAttackCooldown;
        this.lastKeyPressed;
        this.onGround;
    }

    takeDamage(amount) {
        this.currentHealth -= amount;
        if (this.currentHealth < 0) {
            this.currentHealth = 0;
        }
    }


    drawHealthBar(ctx) {
        // Largura fixa da barra de vida
        const healthBarWidth = 50;

        // Calcula a largura proporcional com base na vida atual
        const currentHealthWidth = (this.currentHealth / this.maxHealth) * healthBarWidth;

        // Atualiza a barra de vida no HTML
        document.querySelector('#playerVida').style.width = (this.currentHealth / this.maxHealth) * 100 + '%';

    }

    gravity() {
        if (this.position.y + this.height >= canvas.height - floorHeight) {
            this.onGround = true;
        } else {
            this.onGround = false;
        }

        if (this.position.y + this.height > canvas.height - floorHeight) {
            this.position.y = canvas.height - this.height - floorHeight;
            this.velocity.y = 0;
        } else {
            if (!this.onGround) this.velocity.y += gravity;
        }

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        this.attackBox.position.x = this.position.x;
        this.attackBox.position.y = this.position.y;
    }

    update(ctx) {
        this.gravity();
        this.loadSprite();
        this.draw(ctx);
        this.animate();
    }

    attack() {

        swordSound.play();

        if (this.onAttackCooldown) return;

        this.isAttacking = true;
        this.onAttackCooldown = true;

        // Check for collision with the enemy's position and dimensions
        if (
            this.position.x < enemy.position.x + enemy.width &&
            this.position.x + this.attackBox.width > enemy.position.x &&
            this.position.y < enemy.position.y + enemy.height &&
            this.position.y + this.attackBox.height > enemy.position.y

        ) {
            // Deal damage only if there is a collision
            enemy.takeDamage(12);
        }

        if (
            this.position.x < enemy2.position.x + enemy2.width &&
            this.position.x + this.attackBox.width > enemy2.position.x &&
            this.position.y < enemy2.position.y + enemy2.height &&
            this.position.y + this.attackBox.height > enemy2.position.y

        ) {
            // Deal damage only if there is a collision
            enemy2.takeDamage(12);
        }

        setTimeout(() => {
            this.isAttacking = false;
        }, 400);

        setTimeout(() => {
            this.onAttackCooldown = false;
        }, this.attackCooldown);
    }

    

    fireAttack() {
        if (this.onFireAttackCooldown) return;

        fireSound.play();

        this.isFire = true;
        this.onFireAttackCooldown = true;

        // Check for collision with the enemy's position and dimensions
        if (
            this.position.x < enemy.position.x + enemy.width &&
            this.position.x + this.attackBox.width > enemy.position.x &&
            this.position.y < enemy.position.y + enemy.height &&
            this.position.y + this.attackBox.height > enemy.position.y

        ) {
            enemy.takeDamage(50);
        }

        if (
            this.position.x < enemy2.position.x + enemy2.width &&
            this.position.x + this.attackBox.width > enemy2.position.x &&
            this.position.y < enemy2.position.y + enemy2.height &&
            this.position.y + this.attackBox.height > enemy2.position.y

        ) {
            enemy2.takeDamage(50);
        }

        setTimeout(() => {
            this.isFire = false;
        }, 400);

        setTimeout(() => {
            this.onFireAttackCooldown = false;
        }, this.fireAttackCooldown);
    }

    jump() {
        if (!this.onGround) return;
        this.velocity.y = -8.5;
    }
}



class Enemy extends Fighter {
    constructor({
        position,
        velocity,
        attackBox,
        sprites,
        scale,
        attackCooldown,
        attackAnimationCooldown = attackCooldown,
        maxHealth = 80,
        currentHealth = 80,
        nextPhase, // Adicione nextPhase como um parâmetro
    }) {
        super({
            position,
            velocity,
            scale,
            sprites,
        });

        this.maxHealth = maxHealth;
        this.currentHealth = currentHealth;
        this.aiCooldown = 30;
        this.elapsedAiTime = 0;
        this.aiDirection = 1;
        this.attackCooldown = attackCooldown || 700;
        this.attackAnimationCooldown;
        this.isAttacking = false;
        this.elapsedDeathTime = 500;
        this.phaseAdvanced = false;

        this.sprites.dead = {
            src: "file:///C:/xampp/htdocs/assets/enemy1/Dead.png",
            totalSpriteFrames: 3,
            framesPerSpriteFrame: 8,
        };

        this.attackBox = {
            position: {
                x: this.position.x, // Ajuste para o centro do tronco
                y: this.position.y, // Ajuste para a parte inferior do tronco
            },
            width: 125,
            height: 150,
        };
        this.nextPhase = nextPhase; // Armazene a função nextPhase
    }

    setHealth(newHealth) {
        this.currentHealth = newHealth;
    }

    setAttackDamage(newDamage) {
        this.attackDamage = newDamage;
    }

    isDead() {
        if (this.currentHealth <= 0) {
            return true;
        }
        return false;
    }

    update(ctx) {
        if (this.isDead()) {
            this.setSprite("dead");

            // Mova a chamada para animateDeath fora da condição if
            this.animateDeath();

            // Lógica adicional para lidar com a conclusão da animação de morte
            if (this.currentSpriteFrame >= this.sprites.dead.totalSpriteFrames) {
                // A animação de morte está completa
                // Lógica adicional pode ser adicionada aqui, se necessário

                // Atraso antes de exibir alertas ou reiniciar o jogo
                setTimeout(() => {
                    // Exibir um alerta
                    alert("Você passou de fase!");

                    // Ou mostrar uma mensagem no console
                    console.log("Você passou de fase!");
                }, 700);
                nextPhase();
            }
        } else {
            this.gravity();
            this.loadSprite();
            this.handleAI();
            this.draw(ctx);
            this.animate();
        }
    }

    animateDeath() {
        this.elapsedDeathTime += 1;

        if (this.elapsedDeathTime >= this.sprites.dead.framesPerSpriteFrame) {
            this.currentSpriteFrame += 1;

            if (this.currentSpriteFrame >= this.sprites.dead.totalSpriteFrames) {
                // A animação de morte está completa
                // Lógica adicional pode ser adicionada aqui, se necessário
                console.log(this.phaseAdvanced);
                console.log("Animação de morte concluída!");

                // Verifique se o inimigo está morto e avance para a próxima fase
                if (this.isDead() && !this.phaseAdvanced) {
                    this.phaseAdvanced = true;

                    // Chame a função ganhador aqui
                    ganhador({ player, enemy, timerID });

                    // Reinicie o jogo ou faça qualquer outra ação necessária após a morte do inimigo
                }
            }

            this.elapsedDeathTime = 0;
        }
    }


    attack() {
        if (this.onAttackCooldown || this.onAttackAnimationCooldown) return;
        this.isAttacking = true;
        this.onAttackCooldown = true;

        // Check for collision with the player's position and dimensions
        if (
            this.position.x < player.position.x + player.width &&
            this.position.x + this.attackBox.width > player.position.x &&
            this.position.y < player.position.y + player.height &&
            this.position.y + this.attackBox.height > player.position.y
        ) {
            // Deal damage only if there is a collision
            player.takeDamage(this.attackDamage);  // Use o dano do ataque configurado
        }

        setTimeout(() => {
            this.isAttacking = false;
            this.onAttackCooldown = false;
            this.onAttackAnimationCooldown = true;  // Ativa o cooldown da animação de ataque
        }, this.attackCooldown);

        setTimeout(() => {
            this.onAttackAnimationCooldown = false;  // Desativa o cooldown da animação de ataque após 1 segundo
        }, this.attackCooldown);
    }

    takeDamage(amount) {
        this.currentHealth -= amount;
        if (this.currentHealth < 0) {
            this.currentHealth = 0;
        }

        if (amount === 12) {
            player.pontos += 20;
        } else if (amount === 50) {
            player.pontos += 70;
        }

        console.log('Enemy took damage. Current health:', this.currentHealth);

        document.querySelector('#enemyVida').style.width = (this.currentHealth / this.maxHealth) * 100 + '%';

        // Atualiza imediatamente a barra de vida no HTML após o dano
        this.drawHealthBar();

        atualizarPontos();
    }



    drawHealthBar(ctx) {
        if (!this.isDead()) {
            // Largura fixa da barra de vida
            const healthBarWidth = 50;

            // Calcula a largura proporcional com base na vida atual
            const currentHealthWidth = (this.currentHealth / this.maxHealth) * healthBarWidth;

            // Atualiza a barra de vida no HTML
            const newWidth = Math.min(currentHealthWidth, healthBarWidth); // Garante que não ultrapasse o limite
            document.querySelector('#enemyVida').style.width = (newWidth / healthBarWidth) * 100 + '%';
        }
    }




    handleAI() {
        this.elapsedAiTime += 1;

        if (this.elapsedAiTime >= this.aiCooldown) {
            const horizontalDifference = player.position.x - this.position.x;

            if (horizontalDifference < -5) {
                this.facing = "left";
            } else if (horizontalDifference > 5) {
                this.facing = "right";
            }

            if (Math.abs(horizontalDifference) < this.attackBox.width) {
                this.attack();
                this.velocity.x = 0;
                this.setSprite("attacking");
            } else {
                this.velocity.x = 1.2 * 2 * (horizontalDifference > 0 ? 1 : -1);

                if (!this.onGround) {
                    this.setSprite("jumping");
                } else if (this.velocity.x !== 0) {
                    this.setSprite("running");
                } else {
                    this.setSprite("idle");
                }
            }

            this.elapsedAiTime = 0;
        }
    }
}

const player = new Fighter({
    position: {
        x: 100,
        y: 0,
    },
    velocity: {
        x: 0,
        y: 10,
    },
    scale: 4,
    sprites: {
        idle: {
            src: "https://i.imgur.com/z7vdDUQ.png",
            totalSpriteFrames: 7,
            framesPerSpriteFrame: 12,
        },
        running: {
            src: "https://i.imgur.com/tSB5k8h.png",
            totalSpriteFrames: 8,
            framesPerSpriteFrame: 8,
        },
        jumping: {
            src: "https://i.imgur.com/asslML4.png",
            totalSpriteFrames: 9,
            framesPerSpriteFrame: 12,
        },
        fireAttacking: {
            src: "https://i.imgur.com/ctlwa5H.png",
            totalSpriteFrames: 14,
            framesPerSpriteFrame: 10,
        },
        attacking: {
            src: "https://i.imgur.com/U6PZsgh.png",
            totalSpriteFrames: 4,
            framesPerSpriteFrame: 8,
        },
    },
});

let enemy = new Enemy({
    position: {
        x: 500,
        y: 0,
    },
    velocity: {
        x: 0,
        y: 10,
    },
    scale: 4,
    sprites: {
        idle: {
            src: "https://i.imgur.com/dRbQjkS.png",
            totalSpriteFrames: 6,
            framesPerSpriteFrame: 8,
        },
        running: {
            src: "https://i.imgur.com/lVhZWP3.png",
            totalSpriteFrames: 8,
            framesPerSpriteFrame: 8,
        },
        jumping: {
            src: "https://i.imgur.com/6Rrg3WG.png",
            totalSpriteFrames: 10,
            framesPerSpriteFrame: 8,
        },
        attacking: {
            src: "https://i.imgur.com/eCKDndO.png",
            totalSpriteFrames: 4,
            framesPerSpriteFrame: 8,
        },
        dead: {
            src: "https://i.imgur.com/bPsx2Wi.png",
            totalSpriteFrames: 3,
            framesPerSpriteFrame: 3,
        },
    },
    attackCooldown: 1200,
    attackAnimationCooldown: 2000,
    nextPhase: nextPhase,
});

enemy.setAttackDamage(8);
enemy.setHealth(80);

let enemy2 = new Enemy({
    position: {
        x: 500,
        y: 0,
    },
    velocity: {
        x: 0,
        y: 10,
    },
    scale: 4,
    sprites: {
        idle: {
            src: "https://i.imgur.com/ERntUbV.png",
            totalSpriteFrames: 7,
            framesPerSpriteFrame: 8,
        },
        running: {
            src: "https://i.imgur.com/SPP2VID.png",
            totalSpriteFrames: 8,
            framesPerSpriteFrame: 8,
        },
        jumping: {
            src: "https://i.imgur.com/QEzta57.png",
            totalSpriteFrames: 8,
            framesPerSpriteFrame: 8,
        },
        attacking: {
            src: "https://i.imgur.com/O907q7R.png",
            totalSpriteFrames: 10,
            framesPerSpriteFrame: 10,
        },
        dead: {
            src: "https://i.imgur.com/p16WUZw.png",
            totalSpriteFrames: 5,
            framesPerSpriteFrame: 8,
        },
    },
    attackCooldown: 1200,
    attackAnimationCooldown: 2000,
    nextPhase: nextPhase,
});

enemy2.setAttackDamage(8);
enemy2.setHealth(220);

let enemy3 = new Enemy({
    position: {
        x: 500,
        y: 0,
    },
    velocity: {
        x: 0,
        y: 10,
    },
    scale: 4,
    sprites: {
        idle: {
            src: "https://i.imgur.com/koJyixx.png",
            totalSpriteFrames: 8,
            framesPerSpriteFrame: 8,
        },
        running: {
            src: "https://i.imgur.com/otrLCpH.png",
            totalSpriteFrames: 8,
            framesPerSpriteFrame: 8,
        },
        jumping: {
            src: "https://i.imgur.com/tdNBiUo.png",
            totalSpriteFrames: 8,
            framesPerSpriteFrame: 8,
        },
        attacking: {
            src: "https://i.imgur.com/bLjLxZ0.png",
            totalSpriteFrames: 7,
            framesPerSpriteFrame: 8,
        },
        dead: {
            src: "https://i.imgur.com/hLU8UKs.png",
            totalSpriteFrames: 4,
            framesPerSpriteFrame: 8,
        },
    },
    attackCooldown: 1200,
    attackAnimationCooldown: 2000,
    nextPhase: nextPhase,
});

enemy3.setAttackDamage(8);
enemy3.setHealth(400);

const background = new Sprite({
    position: {
        x: 0,
        y: 0,
    },
    source: backgroundSpritePath,
});

function resetEnemies() {
    // Reinicialize as posições e estados dos inimigos
    enemy.position = { x: 500, y: 0 };
    enemy.velocity = { x: 0, y: 10 };
    enemy.setHealth(80);
    enemy.setAttackDamage(8);
    enemy.isAttacking = false;
    enemy.onAttackCooldown = false;
    enemy.onAttackAnimationCooldown = false;
    enemy.elapsedAiTime = 0;
    enemy.elapsedDeathTime = 500;
    enemy.phaseAdvanced = false;
    enemy.setSprite("idle");

    // Faça o mesmo para o enemy2 e enemy3, se necessário
    enemy2.position = { x: 500, y: 0 };
    enemy2.velocity = { x: 0, y: 10 };
    enemy2.setHealth(220);
    enemy2.setAttackDamage(8);
    enemy2.isAttacking = false;
    enemy2.onAttackCooldown = false;
    enemy2.onAttackAnimationCooldown = false;
    enemy2.elapsedAiTime = 0;
    enemy2.elapsedDeathTime = 500;
    enemy2.phaseAdvanced = false;
    enemy2.setSprite("idle");

    enemy3.position = { x: 500, y: 0 };
    enemy3.velocity = { x: 0, y: 10 };
    enemy3.setHealth(400);
    enemy3.setAttackDamage(8);
    enemy3.isAttacking = false;
    enemy3.onAttackCooldown = false;
    enemy3.onAttackAnimationCooldown = false;
    enemy3.elapsedAiTime = 0;
    enemy3.elapsedDeathTime = 500;
    enemy3.phaseAdvanced = false;
    enemy3.setSprite("idle");

    // Atualiza a barra de saúde do inimigo no HTML
    document.querySelector('#enemyVida').style.width = '100%';
}

function nextPhase() {
    currentPhase ++;
    resetEnemies();

    // Reinicia o temporizador ao avançar para a próxima fase
    timer;
    startTimer();

    // Atualiza a barra de saúde do inimigo no HTML
    document.querySelector('#enemyVida').style.width = '100%';
}


function ganhador({ player, enemy, timerID }) {
    clearTimeout(timerID);
    document.querySelector('#displayText').style.display = 'flex';

    if (player.currentHealth === enemy.currentHealth) {
        document.querySelector('#displayText').innerHTML = 'Empate';
    } else if (player.currentHealth > enemy.currentHealth) {
        document.querySelector('#displayText').innerHTML = 'Player 1 ganhou';
    } else if (player.currentHealth < enemy.currentHealth) {
        document.querySelector('#displayText').innerHTML = 'BOT ganhou';
    }
}


let timer = 30;
let timerID

function startTimer() {
    if (timer > 0) {
        timerID = setTimeout(startTimer, 1000);
        timer--;
        document.querySelector('#timer').innerHTML = timer;
    }

    if (timer === 0) {
        ganhador({ player, enemy, timerID })
    }
}

startTimer();

function atualizarPontos() {

    const pontosElement = document.getElementById('pontos-atual');
    pontosElement.textContent = player.pontos; // Atualiza o conteúdo com os pontos do jogador
}





// APENAS VERIFICAÇÃO DE HITBOX


/*function drawHitbox(ctx, hitbox) {
    ctx.beginPath();
    ctx.rect(hitbox.position.x, hitbox.position.y, hitbox.width, hitbox.height);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
}

// Modificação na função draw do Sprite para desenhar hitboxes
Sprite.prototype.draw = function (ctx) {
    ctx.imageSmoothingEnabled = false;

    // Determine the x-scale based on the facing direction
    const xScale = this.facing === 'left' ? -1 : 1;

    this.drawHealthBar(ctx);

    ctx.save();
    ctx.translate(this.position.x + this.offset.x, this.position.y + this.offset.y);
    ctx.scale(xScale, 1); // Flip the image horizontally if facing left

    ctx.drawImage(
        this.image,
        (this.currentSpriteFrame * this.image.width) / this.totalSpriteFrames,
        0,
        this.image.width / this.totalSpriteFrames,
        this.image.height,
        0,
        0,
        (this.width / this.totalSpriteFrames) * xScale, // Adjust the width with x-scale
        this.height
    );

    // Desenhe a hitbox do sprite (adicionei esta linha)
    drawHitbox(ctx, this);

    ctx.restore();
};

// Modificação na função update do Fighter para desenhar a hitbox da attackBox
Fighter.prototype.update = function (ctx) {
    this.gravity();
    this.loadSprite();

    // Desenhe a hitbox do jogador (adicionei esta linha)
    drawHitbox(ctx, this.attackBox);

    this.draw(ctx);
    this.animate();
};

// Modificação na função update do Enemy para desenhar a hitbox da attackBox
Enemy.prototype.update = function (ctx) {
    if (this.isDead()) {
        this.setSprite('dead');
        this.animateDeath();

        // Lógica adicional pode ser adicionada aqui

    } else {
        this.gravity();
        this.loadSprite();
        this.handleAI();

        // Desenhe a hitbox do inimigo (adicionei esta linha)
        drawHitbox(ctx, this.attackBox);

        this.draw(ctx);
        this.animate();
    }
};*/


