// --- DADOS CENTRAIS DAS TORRES ---
const TOWER_DATA = {
    gatling: { name: 'Metralhadora', cost: 100, color: '#3a86ff', projectile: { type:'bullet', color:'#fff', size:3}, levels:[
        {damage: 8, range: 150, fireRate: 8, cost:0},
        {damage:12, range: 170, fireRate: 6, cost:80},
        {damage:18, range: 190, fireRate: 4, cost:150, description:"Munição Perfurante"}]},
    cannon: { name: 'Canhão', cost: 250, color: '#ffbe0b', projectile: { type:'shell', color:'#ff9f1c', size:8}, levels:[
        {damage:40, range: 200, fireRate: 60, splashRadius:40, cost:0},
        {damage:65, range: 220, fireRate: 55, splashRadius:45, cost:200},
        {damage:90, range: 240, fireRate: 50, splashRadius:50, cost:350, description:"Chamas Residuais"}]},
    frost: { name: 'Torre de Gelo', cost: 175, color: '#00d4ff', levels:[
        {range: 130, slow: 0.3, cost:0},
        {range: 145, slow: 0.4, cost:150},
        {range: 160, slow: 0.5, cost:225, description:"Chance de Congelar"}]},
    drone_carrier: { name: 'Porta-Drone', cost: 400, color: '#ccc', projectile: { type:'bullet', color:'#f6e58d', size:3}, levels:[
        {cost:0, drones:1, orbitRadius: 80, droneDamage: 15, droneFireRate: 15, droneRange: 180},
        {cost:300, drones:1, orbitRadius: 80, droneDamage: 22, droneFireRate: 12, droneRange: 200},
        {cost:550, drones:3, orbitRadius: 90, droneDamage: 25, droneFireRate: 10, droneRange: 220, miniOrbitRadius: 50, description: "Asa-Mãe"}]},
    interest_bank: { name: 'Banco de Juros', cost: 400, color: '#fca311', levels:[
        {cost:0,    income: 2,  range: 0, description: "Gera $2 por segundo."},
        {cost:350,  income: 5,  range: 0, description: "Gera $5 por segundo."},
        {cost:700,  income: 12, range: 0, description: "Rendimento de banqueiro!"}]},
    damage_amp: {name: 'Amplificador', cost: 300, color: '#9d4edd', levels:[
        {cost:0,   range: 120, boost: 0.15, description: "+15% de dano para torres próximas."},
        {cost:250, range: 140, boost: 0.25, description: "+25% de dano para torres próximas."},
        {cost:400, range: 160, boost: 0.40, description: "Poder avassalador!"}]},
    laser: { name: 'Torre de Laser', cost: 350, color: '#f94144', levels: [
        {damage: 50,  range: 170, cost:0, description:"Dano contínuo focado."}, // Dano por segundo
        {damage: 90,  range: 190, cost:275, description:"Lente de foco aprimorada."},
        {damage: 200, range: 220, cost:450, description:"Raio superaquecido!"}]},
};

// =============================================================
//  PASSO 1: DEFINIR TODAS AS CLASSES DE TORRE PRIMEIRO
// =============================================================

// --- CLASSE BASE ---
class Tower {
    constructor(game, x, y, type) {
        this.game = game; this.x = x; this.y = y; this.type = type;
        const baseData = TOWER_DATA[type];
        this.name = baseData.name; this.color = baseData.color;
        this.levels = baseData.levels; this.level = 1;
        this.applyLevelAttributes();
        this.cooldown = 0; this.target = null;
        this.damageBoost = 1.0;
    }
    applyLevelAttributes() {
        const data = this.levels[this.level - 1];
        Object.assign(this, data);
        this.upgradeCost = this.levels[this.level]?.cost || Infinity;
        this.recalculateBoost();
    }
    recalculateBoost() {
        this.damageBoost = 1.0;
        const amplifiers = this.game.towers.filter(t => t.type === 'damage_amp');
        for (const amp of amplifiers) {
            if (Math.hypot(this.x - amp.x, this.y - amp.y) <= amp.range) {
                this.damageBoost += amp.boost;
            }
        }
    }
    upgrade() {
        if(this.level >= this.levels.length || this.game.money < this.upgradeCost) return;
        this.game.money -= this.upgradeCost; this.level++; this.applyLevelAttributes();
        this.game.ui.update();
    }
    findTarget(enemies) {
        let closestDist = Infinity; this.target = null;
        for(const e of enemies){
            const dist = Math.hypot(this.x-e.x, this.y-e.y);
            if(dist <= this.range && dist < closestDist) {
                closestDist = dist; this.target = e;
            }
        }
    }
    drawBase(ctx){
        ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, 18, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle='gold'; ctx.font='12px Arial'; ctx.textAlign='center';
        ctx.fillText(this.level, this.x, this.y + 4); ctx.textAlign='left';
    }
    draw(ctx){ this.drawBase(ctx); }
    update(enemies, deltaTime){ this.cooldown -= deltaTime; }
}

// --- TORRES DE ATAQUE ---
class GatlingTower extends Tower {
    constructor(game, x, y){ super(game,x,y,'gatling'); }
    update(enemies, deltaTime){
        super.update(enemies,deltaTime);
        this.findTarget(enemies);
        if(this.target && this.cooldown <= 0){
            const finalDamage = this.damage * this.damageBoost;
            this.game.projectiles.push(new Projectile(this.game, this.x, this.y, this.target, finalDamage, TOWER_DATA.gatling.projectile));
            this.cooldown = 1000 / (60/this.fireRate);
        }
    }
    draw(ctx){
        super.draw(ctx);
        if(!this.target) return;
        const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
        ctx.strokeStyle='#333'; ctx.lineWidth=6; ctx.beginPath();
        ctx.moveTo(this.x, this.y); ctx.lineTo(this.x+20*Math.cos(angle), this.y+20*Math.sin(angle));
        ctx.stroke();
    }
}
class CannonTower extends Tower {
    constructor(game, x, y){ super(game,x,y,'cannon'); }
    update(enemies, deltaTime){
        super.update(enemies,deltaTime);
        this.findTarget(enemies);
        if(this.target && this.cooldown <= 0){
            const finalDamage = this.damage * this.damageBoost;
            this.game.projectiles.push(new Projectile(this.game, this.x, this.y, this.target, finalDamage, TOWER_DATA.cannon.projectile, this.splashRadius));
            this.cooldown = 1000 / (60/this.fireRate);
        }
    }
}
class DroneCarrier extends Tower {
    constructor(game, x, y) {
        super(game, x, y, 'drone_carrier');
        this.droneTarget = null;
        this.baseAngle = 0;
    }
    applyLevelAttributes() {
        super.applyLevelAttributes();
        this.spawnDrones();
    }
    findTarget(enemies) {
        let mostAdvancedEnemy = null;
        let highestPathIndex = -1;
        let maxDistOnSegment = -1;

        for (const enemy of enemies) {
             const distOnSegment = Math.hypot(enemy.x - this.game.path[enemy.pathIndex].x, enemy.y - this.game.path[enemy.pathIndex].y);
             if (enemy.pathIndex > highestPathIndex) {
                 highestPathIndex = enemy.pathIndex;
                 maxDistOnSegment = distOnSegment;
                 mostAdvancedEnemy = enemy;
             } else if (enemy.pathIndex === highestPathIndex && distOnSegment > maxDistOnSegment) {
                 maxDistOnSegment = distOnSegment;
                 mostAdvancedEnemy = enemy;
             }
        }
        this.droneTarget = mostAdvancedEnemy;
    }
    spawnDrones() {
        this.droneObjects = [];
        const droneCount = this.drones;
        const formation = (this.level === 3 && droneCount === 3) 
            ? [{ angleOffset: -0.6, distOffset: 70 }, { angleOffset: 0, distOffset: 90 }, { angleOffset: 0.6, distOffset: 70 }]
            : Array.from({ length: droneCount }, (_, i) => ({ angleOffset: (Math.PI * 2 / droneCount) * i, distOffset: this.orbitRadius }));

        formation.forEach(f => {
            this.droneObjects.push({
                ...f, state: 'ORBITING', cooldown: Math.random() * 500, x: this.x, y: this.y, targetX: 0, targetY: 0,
            });
        });
    }
    update(enemies, deltaTime) {
        super.update(enemies, deltaTime);
        this.findTarget(enemies);
        this.baseAngle += 0.005;

        this.droneObjects.forEach(drone => {
            drone.cooldown -= deltaTime;
            const orbitX = this.x + drone.distOffset * Math.cos(this.baseAngle + drone.angleOffset);
            const orbitY = this.y + drone.distOffset * Math.sin(this.baseAngle + drone.angleOffset);

            switch (drone.state) {
                case 'ORBITING':
                    drone.x += (orbitX - drone.x) * 0.1;
                    drone.y += (orbitY - drone.y) * 0.1;
                    if (this.droneTarget && drone.cooldown <= 0) { drone.state = 'ATTACKING'; }
                    break;
                case 'ATTACKING':
                    if (!this.droneTarget) { drone.state = 'RETURNING'; break; }
                    const angleToTarget = Math.atan2(this.droneTarget.y - drone.y, this.droneTarget.x - drone.x);
                    const speed = 12;
                    drone.x += Math.cos(angleToTarget) * speed;
                    drone.y += Math.sin(angleToTarget) * speed;
                    if (Math.hypot(drone.x - this.droneTarget.x, drone.y - this.droneTarget.y) < 20) {
                        const finalDamage = this.droneDamage * this.damageBoost;
                        this.game.projectiles.push(new Projectile(this.game, drone.x, drone.y, this.droneTarget, finalDamage, TOWER_DATA.drone_carrier.projectile));
                        drone.cooldown = 1000 / (60 / this.droneFireRate);
                        drone.state = 'RETURNING';
                    }
                    break;
                case 'RETURNING':
                    drone.x += (orbitX - drone.x) * 0.08;
                    drone.y += (orbitY - drone.y) * 0.08;
                    if (Math.hypot(drone.x - orbitX, drone.y - orbitY) < 5) { drone.state = 'ORBITING'; }
                    break;
            }
        });
    }
    draw(ctx) {
        super.drawBase(ctx);
        this.droneObjects.forEach(drone => {
            ctx.fillStyle = drone.state === 'ATTACKING' ? '#ff4757' : '#f0f0f0';
            ctx.beginPath();
            let angle = (drone.state === 'ATTACKING' && this.droneTarget) ? Math.atan2(this.droneTarget.y - drone.y, this.droneTarget.x - drone.x) : this.baseAngle + drone.angleOffset + Math.PI / 2;
            ctx.save();
            ctx.translate(drone.x, drone.y);
            ctx.rotate(angle);
            ctx.moveTo(0, -6); ctx.lineTo(5, 6); ctx.lineTo(-5, 6);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        });
    }
}

class LaserTower extends Tower {
    constructor(game, x, y) {
        super(game, x, y, 'laser');
        this.beamDuration = 0; // Para o efeito visual
    }

    update(enemies, deltaTime) {
        super.update(enemies, deltaTime); // Cuida do cooldown
        
        // Se não tiver alvo, tenta encontrar um.
        if (!this.target || this.target.isDead() || Math.hypot(this.x - this.target.x, this.y - this.target.y) > this.range) {
            this.findTarget(enemies);
        }

        // Se encontrou um alvo válido...
        if (this.target) {
            const finalDamage = this.damage * this.damageBoost;
            
            // Dano é aplicado por segundo, então ajustamos pelo deltaTime
            // deltaTime está em milissegundos, então dividimos por 1000.
            this.target.health -= finalDamage * (deltaTime / 1000);
            
            this.beamDuration = 100; // Mantém o raio visível por um curto período após o dano
        }

        if (this.beamDuration > 0) {
            this.beamDuration -= deltaTime;
        }
    }

    draw(ctx) {
        super.draw(ctx);
        if (this.target && this.beamDuration > 0) {
            ctx.save();
            // Raio principal mais grosso
            ctx.strokeStyle = '#fefee3';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.target.x, this.target.y);
            ctx.stroke();
            // "Aura" do raio mais fina e com a cor da torre
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.target.x, this.target.y);
            ctx.stroke();
            ctx.restore();

            // Partícula de impacto no alvo
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(this.target.x, this.target.y, 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}
// --- TORRES DE UTILIDADE ---
class FrostTower extends Tower {
    constructor(game, x, y){ super(game,x,y,'frost'); }
    update(enemies, deltaTime){
        for(const e of enemies){
            if(Math.hypot(this.x-e.x, this.y-e.y) <= this.range){
                e.applySlow(this.slow, 100);
            }
        }
    }
    draw(ctx){
        super.draw(ctx);
        ctx.fillStyle = 'rgba(0, 212, 255, 0.2)';
        ctx.beginPath(); ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2); ctx.fill();
    }
}
class InterestBank extends Tower {
    constructor(game, x, y) {
        super(game, x, y, 'interest_bank');
        this.incomeCooldown = 1000;
    }
    update(enemies, deltaTime) {
        super.update(enemies, deltaTime);
        this.incomeCooldown -= deltaTime;
        if (this.incomeCooldown <= 0) {
            this.game.money += this.income;
            const particleX = this.x + (Math.random() * 20 - 10);
            const particleY = this.y - 20;
            this.game.particles.push(new MoneyParticle(this.game, particleX, particleY, `+$${this.income}`));
            this.incomeCooldown = 1000;
        }
    }
    draw(ctx) {
        super.drawBase(ctx);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 20px Arial'; ctx.textAlign = 'center';
        ctx.fillText('$', this.x, this.y + 7);
        ctx.textAlign = 'left';
    }
}
class DamageAmplifier extends Tower {
    constructor(game, x, y) {
        super(game, x, y, 'damage_amp');
        this.game.towers.forEach(t => t.recalculateBoost());
    }
    upgrade() {
        super.upgrade();
        this.game.towers.forEach(t => t.recalculateBoost());
    }
    update(enemies, deltaTime) {
        super.update(enemies, deltaTime);
    }
    draw(ctx) {
        super.drawBase(ctx);
        ctx.fillStyle = 'rgba(157, 78, 221, 0.15)';
        ctx.strokeStyle = 'rgba(157, 78, 221, 0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('↑', this.x, this.y + 7);
        ctx.textAlign = 'left';
    }
}


// =============================================================
//  PASSO 2: DEFINIR A FUNÇÃO 'FÁBRICA' POR ÚLTIMO
// =============================================================

function createTower(game, x, y, type) {
    switch (type) {
        case 'gatling': return new GatlingTower(game, x, y);
        case 'cannon': return new CannonTower(game, x, y);
        case 'frost': return new FrostTower(game, x, y);
        case 'laser': return new LaserTower(game, x, y); 
        case 'drone_carrier': return new DroneCarrier(game, x, y);
        case 'interest_bank': return new InterestBank(game, x, y);
        case 'damage_amp': return new DamageAmplifier(game, x, y);
        default: return new Tower(game, x, y, type);
    }
}