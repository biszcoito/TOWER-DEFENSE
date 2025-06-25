class UI {
    constructor(game){
        this.game=game; this.selectedTower=null;
        // Pega todos os elementos da UI de uma vez
        this.elements = {
            lives:document.getElementById('lives'), money:document.getElementById('money'),
            wave: document.getElementById('wave'), buildPanel:document.getElementById('build-panel'),
            upgradePanel: document.getElementById('upgrade-panel'), startBtn: document.getElementById('start-wave-btn')
        };
        this.elements.startBtn.onclick = () => { this.game.startNextWave(); this.elements.startBtn.disabled = true; };
        this.createBuildButtons();
        this.update();
    }
    createBuildButtons() {
        this.elements.buildPanel.innerHTML = `<h2>Construir</h2>`;
        for(const type in TOWER_DATA){
            const data=TOWER_DATA[type];
            const btn=document.createElement('button');
            btn.className='build-button'; btn.dataset.type=type;
            btn.textContent=`${data.name} ($${data.cost})`;
            btn.onclick=()=>this.game.setSelectedTowerToBuild(type);
            this.elements.buildPanel.appendChild(btn);
        }
    }
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
            
            this.elements.upgradePanel.style.display = 'block';
            this.elements.upgradePanel.innerHTML = `
                <h2>${t.name} (Lvl ${t.level})</h2>
                <p>Dano: ${t.damage || 'N/A'}</p>
                <p>Alcance: ${t.range}</p>
                <p>Cadência: ${t.fireRate || 'N/A'}</p>
                <button id="upgrade-btn" ${!nextLevel || this.game.money<nextLevel.cost ? 'disabled' : ''}>${upgradeDesc}</button>
                <button id="sell-btn">Vender por $${Math.floor(TOWER_DATA[t.type].cost*0.7)}</button>
            `;
            if(nextLevel) document.getElementById('upgrade-btn').onclick = () => t.upgrade();
            document.getElementById('sell-btn').onclick = () => this.game.sellTower(t);
        } else {
            this.elements.upgradePanel.style.display = 'none';
        }
    }
    draw() { // Desenha coisas sobre o canvas
        this.update(); // Atualiza a UI a cada frame
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
    enableStartWaveButton(){ if(this.elements.startBtn) this.elements.startBtn.disabled = false; }
}