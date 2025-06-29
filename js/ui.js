// ui.js (Versão Corrigida)
class UI {
    constructor(game){
        this.game=game; 
        this.selectedTower=null;
        
        // ★ MUDANÇA: Mapeamos mais elementos internos do painel de upgrade
        this.elements = {
            lives: document.getElementById('lives'), 
            money: document.getElementById('money'),
            wave: document.getElementById('wave'), 
            score: document.getElementById('score'),
            buildPanel: document.getElementById('build-panel'),
            upgradePanel: document.getElementById('upgrade-panel'),
            upgradeTitle: document.getElementById('upgrade-title'),
            upgradeStats: document.getElementById('upgrade-stats'),
            upgradeButtons: document.getElementById('upgrade-buttons'),
            upgradeBtn: document.getElementById('upgrade-btn'),
            sellBtn: document.getElementById('sell-btn'),
            startBtn: document.getElementById('start-wave-btn'),
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

        // ★ MUDANÇA: Adicionamos os eventos aos botões UMA VEZ, no início.
        this.elements.upgradeBtn.onclick = () => this.handleUpgradeClick();
        this.elements.sellBtn.onclick = () => this.handleSellClick();

        this.createBuildButtons();
        this.update();
    }
    
    // ★ MUDANÇA: Nova função para lidar com o clique de upgrade
    handleUpgradeClick() {
        if (this.selectedTower) {
            this.selectedTower.upgrade();
        }
    }

    // ★ MUDANÇA: Nova função para lidar com o clique de venda
    handleSellClick() {
        if (this.selectedTower) {
            const t = this.selectedTower;
            this.game.particles.push(new Particle(this.game, t.x, t.y, 25, 'rgba(255, 223, 0, 0.8)', 500, true));
            this.game.sellTower(t);
        }
    }

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
    
    // ★ MUDANÇA: A lógica de 'update' foi completamente reescrita
    update() {
        // Status do jogo (sempre atualiza)
        this.elements.lives.textContent = this.game.lives;
        this.elements.money.textContent = this.game.money;
        this.elements.wave.textContent = this.game.wave;
        this.elements.score.textContent = this.game.score;
        
        this.elements.buildPanel.querySelectorAll('.build-button').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.type === this.game.selectedTowerToBuild);
        });
        
        // Painel de Upgrade
        if (this.selectedTower) {
            const t = this.selectedTower;
            const towerStaticData = TOWER_DATA[t.type];
            const currentLevelData = towerStaticData.levels[t.level - 1];
            const nextLevelData = towerStaticData.levels[t.level];
            const sellPrice = this.game.getSellValue(t);

            // Apenas atualiza o conteúdo, não recria o HTML
            this.elements.upgradeTitle.textContent = `${t.name} (Nível ${t.level})`;
            
            let statsHTML = `
                <div class="stats-comparison">
                    <div class="stat"><span>Dano:</span> ${currentLevelData.damage || 'N/A'}</div>
                    ${nextLevelData ? `<div class="stat-next">→ ${nextLevelData.damage || 'N/A'}</div>` : ''}
                </div>
                <div class="stats-comparison">
                    <div class="stat"><span>Alcance:</span> ${currentLevelData.range || 'N/A'}</div>
                    ${nextLevelData ? `<div class="stat-next">→ ${nextLevelData.range || 'N/A'}</div>` : ''}
                </div>
                 <div class="stats-comparison">
                    <div class="stat"><span>Cadência:</span> ${(60 / (currentLevelData.fireRate || 60)).toFixed(1)}/s</div>
                    ${nextLevelData ? `<div class="stat-next">→ ${(60 / (nextLevelData.fireRate || 60)).toFixed(1)}/s</div>` : ''}
                </div>
            `;
            this.elements.upgradeStats.innerHTML = statsHTML;
            
            if (nextLevelData) {
                const canAfford = this.game.money >= nextLevelData.cost;
                this.elements.upgradeBtn.style.display = 'block';
                this.elements.upgradeBtn.disabled = !canAfford;
                this.elements.upgradeBtn.innerHTML = `
                    Melhorar ($${nextLevelData.cost})
                    ${nextLevelData.description ? `<br><small>"${nextLevelData.description}"</small>` : ''}
                `;
            } else {
                this.elements.upgradeBtn.style.display = 'block';
                this.elements.upgradeBtn.disabled = true;
                this.elements.upgradeBtn.innerHTML = `Nível Máximo Atingido!`;
            }

            this.elements.sellBtn.textContent = `Vender por $${sellPrice}`;
            this.elements.upgradePanel.style.display = 'block';
        } else {
            this.elements.upgradePanel.style.display = 'none';
        }
    }
    
    // Função que desenha elementos da UI sobre o canvas
    draw() {
        this.update(); // Atualiza os textos da UI a cada frame
        
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
        
        if(this.selectedTower){
             const {x,y,range} = this.selectedTower;
             const ctx = this.game.ctx;
             ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'; ctx.lineWidth=2;
             ctx.beginPath(); ctx.arc(x,y,range,0,Math.PI*2); ctx.stroke();
        }
    }
    
    showScoreModal(score) {
        this.elements.finalScore.textContent = score;
        this.elements.scoreModal.style.display = 'flex';
    }

    submitScore() {
        const playerName = this.elements.playerNameInput.value.trim();
        const score = this.game.score; 

        if(!playerName) {
            alert('Por favor, digite um nome!'); return;
        }
        if (isNaN(score)) {
            console.error("Tentativa de enviar score inválido:", score);
            alert("Ocorreu um erro ao calcular a pontuação. Não foi possível enviar."); return;
        }
        this.elements.submitScoreBtn.disabled = true;
        this.elements.submitScoreBtn.textContent = 'Enviando...';

        db.collection("highscores").add({
            name: playerName, score: score, timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            this.elements.scoreModal.style.display = 'none';
            this.fetchAndDisplayRanking();
        }).catch((error) => {
            console.error("Erro ao salvar pontuação: ", error);
            this.elements.submitScoreBtn.disabled = false;
            this.elements.submitScoreBtn.textContent = 'Enviar Pontuação';
        });
    }
    
    async fetchAndDisplayRanking() {
        this.elements.rankingList.innerHTML = '<li>Carregando...</li>';
        this.elements.rankingModal.style.display = 'flex';
        try {
            const querySnapshot = await db.collection("highscores").orderBy("score", "desc").limit(10).get();
            this.elements.rankingList.innerHTML = '';
            if(querySnapshot.empty) {
                this.elements.rankingList.innerHTML = '<li>Ainda não há pontuações!</li>'; return;
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