// js/game.js

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.lastTime = 0;
        
        this.TOWER_DATA = TOWER_DATA;
        this.ENEMY_DATA = ENEMY_DATA;
        this.WAVE_DATA = WAVE_DATA;

        this.lives = 20;
        this.money = 500;
        this.wave = 0;
        this.enemies = [];
        this.towers = [];
        this.projectiles = [];
        this.particles = [];
        this.gameIsOver = false;
        this.waveInProgress = false;

        this.selectedTowerToBuild = null;

        this.ui = new UI(this);
        this.path = [];
        this.mousePos = { x: 0, y: 0 };
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.canvas.addEventListener('click', this.handleCanvasClick.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));

        this.animationFrameId = null; 
        this.gameLoop = this.gameLoop.bind(this);
        this.start();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth - 280;
        this.canvas.height = window.innerHeight;
        this.path = [
            { x: -50, y: this.canvas.height * 0.4 },
            { x: this.canvas.width * 0.2, y: this.canvas.height * 0.4 },
            { x: this.canvas.width * 0.2, y: this.canvas.height * 0.8 },
            { x: this.canvas.width * 0.7, y: this.canvas.height * 0.8 },
            { x: this.canvas.width * 0.7, y: this.canvas.height * 0.2 },
            { x: this.canvas.width + 50, y: this.canvas.height * 0.2 }
        ];
    }

    start() {
        this.gameLoop(0);
    }
    
    gameLoop(timestamp) {
        if (this.gameIsOver) {
            cancelAnimationFrame(this.animationFrameId);
            return;
        }

        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.draw();
        
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }

    handlePlayerDefeat() {
        if(this.gameIsOver) return;
        this.gameIsOver = true;
        
        const finalScore = (this.wave * 500) + this.money;
        this.ui.showScoreModal(finalScore);
    }

    update(deltaTime) {
        if (this.lives <= 0) {
            this.handlePlayerDefeat();
            return;
        }
        
        this.towers.forEach(t => t.update(this.enemies, deltaTime));
        this.enemies.forEach(e => {
            e.update(deltaTime)
            if(e.hasReachedEnd) {
                this.lives--;
                e.health = 0;
                if(this.lives <= 0) this.lives = 0;
            }
        });

        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            if (this.projectiles[i].update(deltaTime)) {
                this.projectiles.splice(i, 1);
            }
        }
        for (let i = this.particles.length - 1; i >= 0; i--) {
            if (this.particles[i].update(deltaTime)) {
                this.particles.splice(i, 1);
            }
        }

        for(let i = this.enemies.length-1; i >= 0; i--){
            if(this.enemies[i].isDead()){
                if(this.enemies[i].health <= 0 && !this.enemies[i].hasReachedEnd) {
                   this.money += this.enemies[i].bounty;
                }
                this.enemies.splice(i, 1);
            }
        }

        if(this.waveInProgress && this.enemies.length === 0){
            this.waveInProgress = false;
            this.ui.enableStartWaveButton();
            if(this.wave >= this.WAVE_DATA.length - 1) {
                this.gameWin();
            }
        }
    }
    
    // ESTA FUNÇÃO ESTAVA FALTANDO
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawPath(); // ESSENCIAL PARA DESENHAR O MAPA
        this.towers.forEach(t => t.draw(this.ctx));
        this.enemies.forEach(e => e.draw(this.ctx));
        this.projectiles.forEach(p => p.draw(this.ctx));
        this.particles.forEach(p => p.draw(this.ctx));
        this.ui.draw();
    }
    
    // ESTA FUNÇÃO ESTAVA FALTANDO
    drawPath() {
        this.ctx.strokeStyle = '#0f3460'; this.ctx.lineWidth = 40;
        this.ctx.beginPath(); this.ctx.moveTo(this.path[0].x, this.path[0].y);
        for(let i=1; i<this.path.length; i++){ this.ctx.lineTo(this.path[i].x, this.path[i].y); }
        this.ctx.stroke();
    }

    setSelectedTowerToBuild(type) {
        this.selectedTowerToBuild = (this.selectedTowerToBuild === type) ? null : type;
        this.ui.selectedTower = null;
        this.ui.update();
    }

    handleCanvasClick(event) {
        if(this.gameIsOver) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (this.selectedTowerToBuild) {
            const towerData = this.TOWER_DATA[this.selectedTowerToBuild];
            if(this.money >= towerData.cost) {
                this.money -= towerData.cost;
                this.towers.push(createTower(this, x, y, this.selectedTowerToBuild));
                this.setSelectedTowerToBuild(null);
            }
        } else {
            let clickedTower = null;
            for (const t of this.towers) {
                if(Math.hypot(t.x-x, t.y-y) < 20) {
                    clickedTower = t;
                    break;
                }
            }
            this.ui.selectedTower = clickedTower;
            this.ui.update();
        }
    }

    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePos.x = event.clientX - rect.left;
        this.mousePos.y = event.clientY - rect.top;
    }
    
    startNextWave(){
        if(this.waveInProgress || this.gameIsOver) return;
        this.wave++;
        this.waveInProgress = true;
        
        const waveInfo = this.WAVE_DATA[this.wave];
        if(!waveInfo) { this.gameWin(); return; }
        
        let enemiesToSpawn = [];
        for (const type in waveInfo) {
            for(let i=0; i < waveInfo[type]; i++){ enemiesToSpawn.push(type); }
        }
        enemiesToSpawn.sort(() => Math.random() - 0.5);
        
        const spawnInterval = setInterval(() => {
            if(this.gameIsOver) {
                clearInterval(spawnInterval);
                return;
            }
            if(enemiesToSpawn.length === 0){ 
                clearInterval(spawnInterval); 
                return; 
            }
            const type = enemiesToSpawn.shift();
            this.enemies.push(new Enemy(this, type));
        }, 500);
    }
    
    getSellValue(tower) {
        let sellValue = 0;
        const baseCost = this.TOWER_DATA[tower.type].cost;
        sellValue += baseCost * 0.7;

        for(let i = 1; i < tower.level; i++){
            sellValue += this.TOWER_DATA[tower.type].levels[i].cost * 0.7;
        }
        return Math.floor(sellValue);
    }
    
    sellTower(towerToSell){
        const sellValue = this.getSellValue(towerToSell);
        this.money += sellValue;
        
        this.towers = this.towers.filter(t => t !== towerToSell);
        this.ui.selectedTower = null;
        this.ui.update();
    }
    
    gameWin() {
        if(this.gameIsOver) return;
        this.gameIsOver = true;

        const finalScore = (this.wave * 500) + this.money + (this.lives * 50);
        this.ui.showScoreModal(finalScore);
    }
}