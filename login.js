document.addEventListener("DOMContentLoaded", function () {
    let nicknameInput = document.querySelector("#nickname");
    let entrarBtn = document.getElementById("entrarBtn");

    entrarBtn.addEventListener("click", function () {
        let permissao = true;

        if (nicknameInput.value === '') {
            permissao = false;
            alert("Digite algum nome");
        }

        if (permissao) {
            // Adiciona o jogador ao localStorage antes de redirecionar
            adicionarJogadorAoLocalStorage(nicknameInput.value);

            // Redireciona para a página destino com o nome do jogador como parâmetro
            window.location.href = "index.html?nickname=" + encodeURIComponent(nicknameInput.value);
        }
    });

    // Função para adicionar jogador ao localStorage
    function adicionarJogadorAoLocalStorage(nickname) {
        let players = obterJogadoresDoLocalStorage();
        players.push(nickname);
        localStorage.setItem('jogadores', JSON.stringify(players));
    }

    // Função para obter jogadores do localStorage
    function obterJogadoresDoLocalStorage() {
        const jogadoresLocalStorage = localStorage.getItem('jogadores');
        return jogadoresLocalStorage ? JSON.parse(jogadoresLocalStorage) : [];
    }
});
