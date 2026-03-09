import type { GameEngine } from "./types";

interface Obstacle {
  x: number;
  question: string;
  answer: number;
  options: number[];
  correctIndex: number;
  passed: boolean;
  height: number;
}

interface PowerUp {
  x: number;
  y: number;
  type: "slowmo" | "hint" | "life";
  collected: boolean;
}

export class MathRunnerEngine implements GameEngine {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private animId = 0;
  private _paused = false;
  private _score = 0;
  private _level = 1;
  private running = false;

  // Player
  private playerX = 80;
  private playerY = 0;
  private playerVY = 0;
  private playerSize = 36;
  private isJumping = false;

  // Lives
  private lives = 3;
  private maxLives = 5;
  private invincibleTimer = 0; // brief invincibility after hit

  // World
  private groundY = 0;
  private scrollSpeed = 3;
  private baseScrollSpeed = 3;
  private distance = 0;

  // Obstacles with math
  private obstacles: Obstacle[] = [];
  private nextObstacleAt = 300;

  // Power-ups
  private powerUps: PowerUp[] = [];
  private nextPowerUpAt = 600;
  private slowMoTimer = 0;
  private hintActive = false;
  private hintTimer = 0;

  // Current question UI
  private activeQuestion: Obstacle | null = null;
  private selectedAnswer: number | null = null;
  private answerResult: "correct" | "wrong" | null = null;
  private answerTimer = 0;

  // Input
  private keys: Set<string> = new Set();
  private handleKeyDown: (e: KeyboardEvent) => void = () => {};
  private handleKeyUp: (e: KeyboardEvent) => void = () => {};
  private handleClick: (e: MouseEvent) => void = () => {};

  onStateChange?: (score: number, level: number) => void;
  onGameOver?: (finalScore: number) => void;

  init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.groundY = canvas.height - 60;
    this.playerY = this.groundY - this.playerSize;

    this.handleKeyDown = (e: KeyboardEvent) => {
      this.keys.add(e.key);
      if ((e.key === " " || e.key === "ArrowUp") && !this.isJumping) {
        this.jump();
      }
      if (this.activeQuestion && ["1", "2", "3"].includes(e.key)) {
        this.selectAnswer(parseInt(e.key) - 1);
      }
    };
    this.handleKeyUp = (e: KeyboardEvent) => {
      this.keys.delete(e.key);
    };
    this.handleClick = (e: MouseEvent) => {
      if (!this.activeQuestion) {
        if (!this.isJumping) this.jump();
        return;
      }
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;
      const w = this.canvas.width;
      const h = this.canvas.height;
      const boxW = Math.min(400, w - 40);
      const boxY = h / 2 - 50;
      const btnW = 80;
      const btnH = 40;
      const startX = w / 2 - (this.activeQuestion.options.length * (btnW + 10)) / 2;
      const btnY = boxY + 55;
      this.activeQuestion.options.forEach((_, i) => {
        const bx = startX + i * (btnW + 10);
        if (clickX >= bx && clickX <= bx + btnW && clickY >= btnY && clickY <= btnY + btnH) {
          this.selectAnswer(i);
        }
      });
    };

    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("keyup", this.handleKeyUp);
    this.canvas.addEventListener("click", this.handleClick);
  }

  private jump() {
    this.isJumping = true;
    this.playerVY = -10;
  }

  private selectAnswer(index: number) {
    if (!this.activeQuestion || this.selectedAnswer !== null) return;
    this.selectedAnswer = index;
    if (index === this.activeQuestion.correctIndex) {
      this._score += 20 * this._level;
      this.answerResult = "correct";
    } else {
      this.answerResult = "wrong";
      this._score = Math.max(0, this._score - 5);
      this.loseLife();
    }
    this.answerTimer = 40;
    this.onStateChange?.(this._score, this._level);
  }

  private loseLife() {
    this.lives = Math.max(0, this.lives - 1);
    this.invincibleTimer = 60;
    // Slow down briefly on wrong answer
    this.scrollSpeed = Math.max(1, this.scrollSpeed * 0.5);
    setTimeout(() => {
      this.scrollSpeed = this.baseScrollSpeed + this._level * 0.5;
    }, 1000);

    if (this.lives <= 0) {
      setTimeout(() => {
        this.running = false;
        this.onGameOver?.(this._score);
      }, 500);
    }
  }

  private generateQuestion(): Obstacle {
    let ops: string[];
    if (this._level <= 2) {
      ops = ["+", "-"];
    } else if (this._level <= 4) {
      ops = ["+", "-", "×"];
    } else {
      ops = ["+", "-", "×", "÷"];
    }
    const op = ops[Math.floor(Math.random() * ops.length)];
    const max = 5 + this._level * 3;
    let a: number, b: number, answer: number;

    switch (op) {
      case "+":
        a = Math.floor(Math.random() * max) + 1;
        b = Math.floor(Math.random() * max) + 1;
        answer = a + b;
        break;
      case "-":
        a = Math.floor(Math.random() * max) + 3;
        b = Math.floor(Math.random() * a);
        answer = a - b;
        break;
      case "×":
        a = Math.floor(Math.random() * 10) + 1;
        b = Math.floor(Math.random() * 10) + 1;
        answer = a * b;
        break;
      case "÷":
        b = Math.floor(Math.random() * 8) + 2;
        answer = Math.floor(Math.random() * 10) + 1;
        a = b * answer;
        break;
      default:
        a = 1; b = 1; answer = 2;
    }

    const wrong1 = answer + Math.floor(Math.random() * 5) + 1;
    const wrong2 = Math.max(0, answer - Math.floor(Math.random() * 5) - 1);
    const options = [answer, wrong1, wrong2].sort(() => Math.random() - 0.5);

    return {
      x: this.canvas.width + 50,
      question: `${a} ${op} ${b}`,
      answer,
      options,
      correctIndex: options.indexOf(answer),
      passed: false,
      height: 50 + Math.random() * 30,
    };
  }

  private generatePowerUp(): PowerUp {
    const types: PowerUp["type"][] = ["slowmo", "hint", "life"];
    const type = types[Math.floor(Math.random() * types.length)];
    // Don't spawn life power-up if at max
    const finalType = (type === "life" && this.lives >= this.maxLives)
      ? (Math.random() > 0.5 ? "slowmo" : "hint")
      : type;
    return {
      x: this.canvas.width + 30,
      y: this.groundY - 80 - Math.random() * 60,
      type: finalType,
      collected: false,
    };
  }

  start() {
    this.running = true;
    this.loop();
  }

  private loop = () => {
    if (!this.running) return;
    if (!this._paused) this.update();
    this.draw();
    this.animId = requestAnimationFrame(this.loop);
  };

  private update() {
    const speed = this.slowMoTimer > 0 ? this.scrollSpeed * 0.4 : this.scrollSpeed;
    this.distance += speed;

    // Level up every 1500 distance
    const newLevel = Math.floor(this.distance / 1500) + 1;
    if (newLevel !== this._level) {
      this._level = newLevel;
      this.baseScrollSpeed = 3 + this._level * 0.5;
      this.scrollSpeed = this.baseScrollSpeed;
      this.onStateChange?.(this._score, this._level);
    }

    // Timers
    if (this.invincibleTimer > 0) this.invincibleTimer--;
    if (this.slowMoTimer > 0) this.slowMoTimer--;
    if (this.hintTimer > 0) {
      this.hintTimer--;
      if (this.hintTimer === 0) this.hintActive = false;
    }

    // Gravity
    if (this.isJumping) {
      this.playerVY += 0.5;
      this.playerY += this.playerVY;
      if (this.playerY >= this.groundY - this.playerSize) {
        this.playerY = this.groundY - this.playerSize;
        this.isJumping = false;
        this.playerVY = 0;
      }
    }

    // Spawn obstacles
    if (this.distance >= this.nextObstacleAt && !this.activeQuestion) {
      this.obstacles.push(this.generateQuestion());
      this.nextObstacleAt = this.distance + 400 + Math.random() * 200;
    }

    // Spawn power-ups
    if (this.distance >= this.nextPowerUpAt) {
      this.powerUps.push(this.generatePowerUp());
      this.nextPowerUpAt = this.distance + 800 + Math.random() * 400;
    }

    // Move obstacles
    for (const obs of this.obstacles) {
      obs.x -= speed;
    }

    // Move power-ups
    for (const pu of this.powerUps) {
      pu.x -= speed;
    }

    // Check power-up collection
    for (const pu of this.powerUps) {
      if (pu.collected) continue;
      const px = this.playerX, py = this.playerY, ps = this.playerSize;
      if (pu.x < px + ps && pu.x + 24 > px && pu.y < py + ps && pu.y + 24 > py) {
        pu.collected = true;
        this.applyPowerUp(pu.type);
      }
    }

    // Check collision / trigger question
    for (const obs of this.obstacles) {
      if (!obs.passed && obs.x < this.playerX + this.playerSize && obs.x + 40 > this.playerX) {
        if (!this.activeQuestion) {
          this.activeQuestion = obs;
          obs.passed = true;
        }
      }
    }

    // Answer timer
    if (this.answerTimer > 0) {
      this.answerTimer--;
      if (this.answerTimer === 0) {
        this.activeQuestion = null;
        this.selectedAnswer = null;
        this.answerResult = null;
        this.hintActive = false;
      }
    }

    // Cleanup
    this.obstacles = this.obstacles.filter((o) => o.x > -100);
    this.powerUps = this.powerUps.filter((p) => p.x > -50);

    // Score from distance
    if (Math.floor(this.distance) % 50 === 0) {
      this._score += 1;
      this.onStateChange?.(this._score, this._level);
    }
  }

  private applyPowerUp(type: PowerUp["type"]) {
    switch (type) {
      case "slowmo":
        this.slowMoTimer = 180; // 3 seconds at 60fps
        break;
      case "hint":
        this.hintActive = true;
        this.hintTimer = 600; // active for next question within 10s
        break;
      case "life":
        this.lives = Math.min(this.maxLives, this.lives + 1);
        break;
    }
    this._score += 5;
    this.onStateChange?.(this._score, this._level);
  }

  private draw() {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;

    // Sky
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#FFF8E1");
    grad.addColorStop(1, "#FFF4B5");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Ground
    ctx.fillStyle = "#FFD84D";
    ctx.fillRect(0, this.groundY, w, h - this.groundY);
    ctx.fillStyle = "#FFB800";
    ctx.fillRect(0, this.groundY, w, 3);

    // Scrolling ground lines
    ctx.strokeStyle = "#FFB80040";
    ctx.lineWidth = 1;
    for (let i = 0; i < w + 40; i += 40) {
      const x = ((i - this.distance * 0.5) % (w + 40) + w + 40) % (w + 40);
      ctx.beginPath();
      ctx.moveTo(x, this.groundY + 15);
      ctx.lineTo(x + 20, this.groundY + 15);
      ctx.stroke();
    }

    // Power-ups
    for (const pu of this.powerUps) {
      if (pu.collected) continue;
      const size = 24;
      // Glow
      ctx.shadowColor = pu.type === "slowmo" ? "#2196F3" : pu.type === "hint" ? "#FF9800" : "#E91E63";
      ctx.shadowBlur = 8;
      ctx.fillStyle = pu.type === "slowmo" ? "#2196F3" : pu.type === "hint" ? "#FF9800" : "#E91E63";
      ctx.beginPath();
      ctx.roundRect(pu.x, pu.y, size, size, 6);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowColor = "transparent";
      // Icon
      ctx.fillStyle = "#FFF";
      ctx.font = "bold 14px Poppins";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const icon = pu.type === "slowmo" ? "⏱" : pu.type === "hint" ? "💡" : "❤";
      ctx.fillText(icon, pu.x + size / 2, pu.y + size / 2);
    }

    // Obstacles
    for (const obs of this.obstacles) {
      ctx.fillStyle = obs.passed ? "#4CAF5050" : "#FF6B6B";
      const bw = 40;
      ctx.beginPath();
      ctx.roundRect(obs.x, this.groundY - obs.height, bw, obs.height, 6);
      ctx.fill();
      if (!obs.passed) {
        ctx.fillStyle = "#FFF";
        ctx.font = "bold 18px Poppins";
        ctx.textAlign = "center";
        ctx.fillText("?", obs.x + bw / 2, this.groundY - obs.height + 25);
      }
    }

    // Player (flash when invincible)
    if (this.invincibleTimer <= 0 || Math.floor(this.invincibleTimer / 4) % 2 === 0) {
      const px = this.playerX;
      const py = this.playerY;
      const ps = this.playerSize;
      ctx.fillStyle = "#FFB800";
      ctx.beginPath();
      ctx.roundRect(px, py, ps, ps, 10);
      ctx.fill();
      ctx.fillStyle = "#333";
      ctx.beginPath();
      ctx.arc(px + ps * 0.35, py + ps * 0.35, 4, 0, Math.PI * 2);
      ctx.arc(px + ps * 0.65, py + ps * 0.35, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px + ps / 2, py + ps * 0.5, 8, 0.1, Math.PI - 0.1);
      ctx.stroke();
    }

    // Lives (hearts) top-left
    ctx.font = "18px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    for (let i = 0; i < this.maxLives; i++) {
      ctx.fillStyle = i < this.lives ? "#FF4444" : "#CCC";
      ctx.fillText("♥", 10 + i * 22, 10);
    }

    // Active power-up indicators top-right
    ctx.textAlign = "right";
    const indicators: string[] = [];
    if (this.slowMoTimer > 0) indicators.push(`⏱ ${Math.ceil(this.slowMoTimer / 60)}s`);
    if (this.hintActive) indicators.push(`💡 Hint`);
    ctx.font = "bold 12px Nunito";
    ctx.fillStyle = "#333";
    indicators.forEach((txt, i) => {
      ctx.fillText(txt, w - 10, 10 + i * 18);
    });

    // Question UI
    if (this.activeQuestion && this.answerTimer === 0) {
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillRect(0, 0, w, h);

      const boxW = Math.min(400, w - 40);
      const boxH = 120;
      const boxX = (w - boxW) / 2;
      const boxY = h / 2 - 50;

      ctx.fillStyle = "#FFF";
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, 16);
      ctx.fill();

      ctx.fillStyle = "#333";
      ctx.font = "bold 24px Poppins";
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(`${this.activeQuestion.question} = ?`, w / 2, boxY + 35);

      const btnW = 80;
      const btnH = 40;
      const startX = w / 2 - (this.activeQuestion.options.length * (btnW + 10)) / 2;
      const btnY = boxY + 55;

      this.activeQuestion.options.forEach((opt, i) => {
        // If hint is active, grey out one wrong answer
        const isHintedOut = this.hintActive && i !== this.activeQuestion!.correctIndex && i === this.getHintRemoveIndex();
        ctx.fillStyle = isHintedOut ? "#E0E0E0" : "#FFD84D";
        ctx.beginPath();
        ctx.roundRect(startX + i * (btnW + 10), btnY, btnW, btnH, 10);
        ctx.fill();

        ctx.fillStyle = isHintedOut ? "#AAA" : "#333";
        ctx.font = isHintedOut ? "14px Nunito" : "bold 18px Nunito";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(isHintedOut ? "—" : `${opt}`, startX + i * (btnW + 10) + btnW / 2, btnY + btnH / 2);
      });

      ctx.fillStyle = "#999";
      ctx.font = "12px Nunito";
      ctx.textBaseline = "alphabetic";
      ctx.fillText("Press 1, 2, or 3 — or click an answer", w / 2, boxY + boxH + 20);
    }

    // Answer feedback
    if (this.answerResult) {
      ctx.fillStyle = this.answerResult === "correct" ? "#4CAF50" : "#FF6B6B";
      ctx.font = "bold 32px Poppins";
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(
        this.answerResult === "correct" ? "✓ Correct!" : "✗ Wrong!",
        w / 2,
        h / 2
      );
      if (this.answerResult === "wrong") {
        ctx.font = "16px Nunito";
        ctx.fillText(`Lives: ${"♥".repeat(this.lives)}${"♡".repeat(this.maxLives - this.lives)}`, w / 2, h / 2 + 30);
      }
    }
  }

  // Returns the index of one wrong answer to grey out (deterministic per question)
  private getHintRemoveIndex(): number {
    if (!this.activeQuestion) return -1;
    for (let i = 0; i < this.activeQuestion.options.length; i++) {
      if (i !== this.activeQuestion.correctIndex) return i;
    }
    return -1;
  }

  stop() { this.running = false; cancelAnimationFrame(this.animId); }
  pause() { this._paused = true; }
  resume() { this._paused = false; }
  isPaused() { return this._paused; }
  getScore() { return this._score; }
  getLevel() { return this._level; }

  restart() {
    this._score = 0;
    this._level = 1;
    this.distance = 0;
    this.scrollSpeed = 3;
    this.baseScrollSpeed = 3;
    this.playerY = this.groundY - this.playerSize;
    this.playerVY = 0;
    this.isJumping = false;
    this.lives = 3;
    this.invincibleTimer = 0;
    this.slowMoTimer = 0;
    this.hintActive = false;
    this.hintTimer = 0;
    this.obstacles = [];
    this.powerUps = [];
    this.nextObstacleAt = 300;
    this.nextPowerUpAt = 600;
    this.activeQuestion = null;
    this.selectedAnswer = null;
    this.answerResult = null;
    this.answerTimer = 0;
    this._paused = false;
    this.onStateChange?.(0, 1);
    if (!this.running) this.start();
  }

  destroy() {
    this.running = false;
    cancelAnimationFrame(this.animId);
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("keyup", this.handleKeyUp);
    this.canvas.removeEventListener("click", this.handleClick);
  }
}
