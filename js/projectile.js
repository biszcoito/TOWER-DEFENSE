// js/projectile.js (Versão Corrigida e Completa)

// ★★★ NOVA CLASSE DE PARTÍCULA ★★★
class Particle {
    constructor(game, x, y, radius, color, duration) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.initialDuration = duration;
        this.duration = duration;
    }

    update(deltaTime) {
        this.duration -= deltaTime;
        // Diminui o raio e a opacidade com o tempo
        this.radius = (this.duration / this.initialDuration) * 50; // Começa grande, termina pequeno
        return this.duration <= 0; // Sinaliza para remoção
    }

    draw(ctx) {
        // Usa a duração para criar um efeito de fade out
        ctx.save();
        ctx.globalAlpha = this.duration / this.initialDuration;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}


class Projectile {
    constructor(game, x, y, target, damage, config, splashRadius = 0) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.target = target;
        this.damage = damage;
        this.speed = 10;
        this.splashRadius = splashRadius;
        Object.assign(this, config);
    }

    update(deltaTime) {
        if (!this.target || this.target.isDead()) {
            return true; // Sinaliza para remoção
        }

        const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
        this.x += Math.cos(angle) * this.speed;
        this.y += Math.sin(angle) * this.speed;

        if (Math.hypot(this.x - this.target.x, this.y - this.target.y) < 10) {
            this.hit();
            return true; // Sinaliza para remoção
        }
        return false;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    hit() {
        this.target.health -= this.damage;

        if (this.splashRadius > 0) { // Dano em área
            // ★★★ CORREÇÃO: Usa a nova classe Particle ★★★
            this.game.particles.push(new Particle(this.game, this.x, this.y, this.splashRadius, 'rgba(255,159,28,0.5)', 300));

            for (const e of this.game.enemies) {
                if (e !== this.target && Math.hypot(this.x - e.x, this.y - e.y) <= this.splashRadius) {
                    e.health -= this.damage * 0.5; // Dano splash é menor
                }
            }
        }
    }
}