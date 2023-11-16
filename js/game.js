const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const canvasWidth = 1024
const canvasHeight = 576

canvas.width = canvasWidth
canvas.height = canvasHeight

const desiredFPS = 120;
const frameTime = 1000 / desiredFPS;

let prevTime = performance.now();
let lag = 0;

let currentPhase = 1;

function resetEnemies() {
    // Reinicie as propriedades de cada inimigo para a próxima fase
    enemy.setHealth(80);
    enemy2.setHealth(220);
    enemy3.setHealth(400);

    // Altere o inimigo para enemy2 ou enemy3 conforme a fase
    if (currentPhase === 2) {
        enemy = enemy2;
    } else if (currentPhase === 3) {
        enemy = enemy3;
    }
}

function animate() {
    const currentTime = performance.now();
    const elapsed = currentTime - prevTime;
    prevTime = currentTime;
    lag += elapsed;

    handleControls();

    while (lag >= frameTime) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        background.update(ctx);
        player.update(ctx);
        enemy.update(ctx);

        lag -= frameTime;
    }

    // Verifique se o jogador ganhou (derrotou todos os inimigos)
    if (currentPhase > 3) {
        // Adicione lógica aqui para lidar com a vitória do jogador
        alert("Parabéns! Você venceu o jogo!");
        // Ou reinicie o jogo se necessário
        // location.reload();
    } else {
        // Caso contrário, continue para a próxima fase apenas se a animação de morte estiver concluída
        if (!enemy.isDead() || (enemy.isDead() && enemy.phaseAdvanced)) {
            window.requestAnimationFrame(animate);
        }
    }
}

animate();
