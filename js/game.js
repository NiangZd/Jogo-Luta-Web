const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const canvasWidth = 1024;
const canvasHeight = 576;

canvas.width = canvasWidth;
canvas.height = canvasHeight;

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

function salvarPontuacaoLocal(jogador, pontuacao) {
    const dadosPontuacao = obterPontuacoesSalvas();

    const indiceJogador = dadosPontuacao.findIndex((item) => item.jogador === jogador);

    if (indiceJogador === -1) {
        dadosPontuacao.push({ jogador, pontuacao });
    } else {
        dadosPontuacao[indiceJogador].pontuacao = pontuacao;
    }

    localStorage.setItem('dadosPontuacao', JSON.stringify(dadosPontuacao));
}

function obterPontuacoesSalvas() {
    const dadosPontuacao = localStorage.getItem('dadosPontuacao');
    return dadosPontuacao ? JSON.parse(dadosPontuacao) : [];
}

function obterJogadoresDoLocalStorage() {
    const jogadoresLocalStorage = localStorage.getItem('jogadores');
    return jogadoresLocalStorage ? JSON.parse(jogadoresLocalStorage) : [];
}

function renderizaJogadores() {
    console.log("Renderizando jogadores.");

    const listaPlayers = document.querySelector("#app ul");
    if (listaPlayers) {
        listaPlayers.innerHTML = "";
        const players = obterJogadoresDoLocalStorage();

        console.log("Jogadores obtidos do localStorage:", players);

        players.forEach(function (player) {
            let li = document.createElement("li");
            li.textContent = "Jogador: " + player;
            listaPlayers.appendChild(li);
        });
    } else {
        console.error("Elemento listaPlayers não encontrado.");
    }
}

function atualizarPontuacao(pontuacao, jogadorAtual) {
    const pontosElement = document.getElementById('pontos-atual');
    pontosElement.textContent = pontuacao;

    salvarPontuacaoLocal(jogadorAtual, pontuacao);
}

initLocalStorage();

startTimer();

function resetEnemies() {
    timer=30;
    enemy.setHealth(80);
    enemy2.setHealth(220);
    enemy3.setHealth(400);

    if (currentPhase === 2) {
        enemy = enemy2;
    } else if (currentPhase === 3) {
        enemy = enemy3;
    }
}

let pontuacaoAtual = 0; // Inicialize pontuacaoAtual no escopo global

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

    if (currentPhase > 3) {
        alert("Parabéns! Você venceu o jogo!");
    } else if (player.isDead()) {
        alert("Game Over! Você perdeu!");

        const urlParams = new URLSearchParams(window.location.search);
        const nomeDoJogador = urlParams.get('nickname') || "Jogador Anônimo";

        pontuacaoAtual = parseInt(localStorage.getItem('pontuacao')) || 0;

        console.log(`Pontuação atual do jogador ${nomeDoJogador}: ${pontuacaoAtual}`);

        atualizarPontuacao(pontuacaoAtual, nomeDoJogador);
        salvarPontuacaoLocal(nomeDoJogador, pontuacaoAtual);
    } else {
        if (!enemy.isDead() || (enemy.isDead() && enemy.phaseAdvanced)) {
            window.requestAnimationFrame(animate);
        }
    }
}

animate();
