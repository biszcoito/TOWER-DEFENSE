// ui.js
class UI {
    constructor(game){
        this.game=game; this.selectedTower=null;
        
        this.elements = {
            lives: document.getElementById('lives'), money: document.getElementById('money'),
            wave: document.getElementById('wave'), buildPanel:document.getElementById('build-panel'),
            upgradePanel: document.getElementById('upgrade-panel'), startBtn: document.getElementById('start-wave-btn'),
            scoreModal: document.getElementById('score-modal'),
            finalScore: document.getElementById('final-score'),
            playerNameInput: document.getElementById('player-name-input'),
            submitScoreBtn: document.getElementById('submit-score-btn'),
            rankingModal: document.getElementById('ranking-modal'),
            rankingList: document.getElementById('ranking-list'),
            showRankingBtn: document.getElementById('show-ranking-btn'),
            closeRankingBtn: document.getElementById('close-ranking-btn'),
        };

        this.elements.startBtn.onclick = () => { this.game.startNextWave(); this.elements.startBtn.disabled = true; };
        this.elements.submitScoreBtn.onclick = () => this.submitScore();
        this.elements.showRankingBtn.onclick = () => this.fetchAndDisplayRanking();
        this.elements.closeRankingBtn.onclick = () => this.elements.rankingModal.style.display = 'none';

        this.createBuildButtons();
        this.update();
    }
    
    // Função para criar os botões de construção das torres
    createBuildButtons() {
        this.elements.buildPanel.innerHTML = `<h2>Construir</h2>`;
        for(const type in TOWER_DATA){
            const data=TOWER_DATA[type];
            const btn=document.createElement('button');
            btn.className='build-button'; btn.dataset.type=type;
            btn.innerHTML = `
                <div>${data.name}</div>
                <div class="cost">$${data.cost}</div>
            `;
            btn.onclick=()=>this.game.setSelectedTowerToBuild(type);
            this.elements.buildPanel.appendChild(btn);
        }
    }

    // Função que atualiza toda a informação da interface
    update() {
        // Status do jogo
        this.elements.lives.textContent = this.game.lives;
        this.elements.money.textContent = this.game.money;
        this.elements.wave.textContent = this.game.wave;
        
        // Destaque do botão de construção
        this.elements.buildPanel.querySelectorAll('.build-button').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.type === this.game.selectedTowerToBuild);
        });
        
        // Painel de Upgrade
        if(this.selectedTower) {
            const t = this.selectedTower;
            const nextLevel = TOWER_DATA[t.type].levels[t.level];
            let upgradeDesc = nextLevel ? `Melhorar p/ Lvl ${t.level+1} ($${nextLevel.cost})` : "Nível Máximo";
            const sellPrice = this.game.getSellValue(t);

            this.elements.upgradePanel.style.display = 'block';
            this.elements.upgradePanel.innerHTML = `
                <h2>${t.name} (Lvl ${t.level})</h2>
                <p>Dano: ${t.damage || 'N/A'}</p>
                <p>Alcance: ${t.range || 'N/A'}</p>
                <p>Cadência: ${t.fireRate || 'N/A'}</p>
                <button id="upgrade-btn" ${!nextLevel || this.game.money < nextLevel.cost ? 'disabled' : ''}>${upgradeDesc}</button>
                <button id="sell-btn">Vender por $${sellPrice}</button>
            `;
            if(nextLevel) document.getElementById('upgrade-btn').onclick = () => t.upgrade();
            document.getElementById('sell-btn').onclick = () => this.game.sellTower(t);
        } else {
            this.elements.upgradePanel.style.display = 'none';
        }
    }

    // Função que desenha elementos da UI sobre o canvas
    draw() {
        this.update(); // Atualiza os textos da UI a cada frame
        
        // Desenha o preview da torre no cursor
        if(this.game.selectedTowerToBuild){
            const data = TOWER_DATA[this.game.selectedTowerToBuild];
            const {x,y} = this.game.mousePos;
            const ctx = this.game.ctx;
            ctx.globalAlpha = 0.5;
            ctx.fillStyle=data.color; ctx.beginPath(); ctx.arc(x,y,18,0,Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#fff'; ctx.lineWidth=2; ctx.beginPath();
            ctx.arc(x,y,data.levels[0].range,0,Math.PI*2); ctx.stroke();
            ctx.globalAlpha = 1.0;
        }
        
        // Desenha o alcance da torre selecionada para upgrade
        if(this.selectedTower){
             const {x,y,range} = this.selectedTower;
             const ctx = this.game.ctx;
             ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'; ctx.lineWidth=2;
             ctx.beginPath(); ctx.arc(x,y,range,0,Math.PI*2); ctx.stroke();
        }
    }

    // Função para mostrar o modal de pontuação
    showScoreModal(score) {
        this.elements.finalScore.textContent = score;
        this.elements.scoreModal.style.display = 'flex';
    }

    // Função para enviar a pontuação para o Firebase
    submitScore() {
        const playerName = this.elements.playerNameInput.value.trim();
        const score = parseInt(this.elements.finalScore.textContent, 10);

        if(!playerName) {
            alert('Por favor, digite um nome!');
            return;
        }

        this.elements.submitScoreBtn.disabled = true;
        this.elements.submitScoreBtn.textContent = 'Enviando...';

        db.collection("highscores").add({
            name: playerName,
            score: score,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            console.log("Pontuação salva com sucesso!");
            this.elements.scoreModal.style.display = 'none';
            this.fetchAndDisplayRanking();
        })
        .catch((error) => {
            console.error("Erro ao salvar pontuação: ", error);
            this.elements.submitScoreBtn.disabled = false;
            this.elements.submitScoreBtn.textContent = 'Enviar Pontuação';
        });
    }
    
    // Função para buscar e exibir o ranking do Firebase
    async fetchAndDisplayRanking() {
        this.elements.rankingList.innerHTML = '<li>Carregando...</li>';
        this.elements.rankingModal.style.display = 'flex';

        try {
            const querySnapshot = await db.collection("highscores")
                                         .orderBy("score", "desc")
                                         .limit(10)
                                         .get();
            
            this.elements.rankingList.innerHTML = '';
            if(querySnapshot.empty) {
                this.elements.rankingList.innerHTML = '<li>Ainda não há pontuações!</li>';
                return;
            }

            querySnapshot.forEach((doc, index) => {
                const data = doc.data();
                const li = document.createElement('li');
                li.innerHTML = `<span>#${index + 1} ${data.name}</span> <span class="score">${data.score}</span>`;
                this.elements.rankingList.appendChild(li);
            });
        } catch(error) {
            console.error("Erro ao buscar ranking: ", error);
            this.elements.rankingList.innerHTML = '<li>Erro ao carregar o ranking.</li>';
        }
    }

    enableStartWaveButton(){ 
        if(this.elements.startBtn) this.elements.startBtn.disabled = false; 
    }
}