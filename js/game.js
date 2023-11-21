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

// Função para inicializar o LocalStorage com a pontuação do jogador
function initLocalStorage() {
    if (!localStorage.getItem('pontuacao')) {
        localStorage.setItem('pontuacao', '0');
    }
}

// Função para atualizar a pontuação na interface do usuário e salvá-la no localStorage
function atualizarPontuacao(pontuacao) {
    const pontosElement = document.getElementById('pontos-atual');
    pontosElement.textContent = pontuacao; // Atualiza o conteúdo com os pontos do jogador

    // Obtém o jogador atual (você pode substituir isso pelo jogador real)
    const jogadorAtual = "jogador_teste"; // Substitua pelo jogador real

    // Salva a pontuação associada ao jogador no localStorage
    salvarPontuacaoLocal(jogadorAtual, pontuacao);
}

// ... (seu código anterior)

initLocalStorage(); // Chame esta função antes do loop principal do jogo



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
    } else if (player.isDead()) {

        alert("Game Over! Você perdeu!!")
        // Adicione aqui a lógica para quando o jogador morrer
        console.log("O jogador morreu!");

        // Dentro da condição de derrota do jogador
        const pontuacaoAtual = atualizarPontuacao();
        console.log(`Pontuação atual do jogador: ${pontuacaoAtual}`);

        // Ou use a função de atualização de pontuação
        atualizarPontuacao(pontuacaoAtual);

        // Pode exibir uma mensagem na tela, reiniciar o jogo, etc.
        alert("Game Over! O jogador morreu!")

    } else {
        // Caso contrário, continue para a próxima fase apenas se a animação de morte estiver concluída
        if (!enemy.isDead() || (enemy.isDead() && enemy.phaseAdvanced)) {
            window.requestAnimationFrame(animate);
        }
    }

}

animate();
