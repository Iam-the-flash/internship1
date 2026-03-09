import type { GameEngine } from "./types";

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

  // World
  private groundY = 0;
  private scrollSpeed = 3;
  private distance = 0;

  // Obstacles with math
  private obstacles: Array<{
    x: number;
    question: string;
    answer: number;
    options: number[];
    correctIndex: number;
    passed: boolean;
    height: number;
  }> = [];
  private nextObstacleAt = 300;

  // Current question UI
  private activeQuestion: typeof this.obstacles[0] | null = null;
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
      // Number keys for answers
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
      // Scale mouse coords from CSS pixels to canvas pixels
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;
      // Match exact same positions as draw()
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
    }
    this.answerTimer = 40;
    this.onStateChange?.(this._score, this._level);
  }

  private generateQuestion(): typeof this.obstacles[0] {
    const ops = this._level > 2 ? ["+", "-", "×"] : ["+", "-"];
    const op = ops[Math.floor(Math.random() * ops.length)];
    const max = 5 + this._level * 3;
    let a: number, b: number, answer: number;

    switch (op) {
      case "+": a = Math.floor(Math.random() * max) + 1; b = Math.floor(Math.random() * max) + 1; answer = a + b; break;
      case "-": a = Math.floor(Math.random() * max) + 3; b = Math.floor(Math.random() * a); answer = a - b; break;
      default: a = Math.floor(Math.random() * 10) + 1; b = Math.floor(Math.random() * 10) + 1; answer = a * b; break;
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
    this.distance += this.scrollSpeed;

    // Level up every 1500 distance
    const newLevel = Math.floor(this.distance / 1500) + 1;
    if (newLevel !== this._level) {
      this._level = newLevel;
      this.scrollSpeed = 3 + this._level * 0.5;
      this.onStateChange?.(this._score, this._level);
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

    // Move obstacles
    for (const obs of this.obstacles) {
      obs.x -= this.scrollSpeed;
    }

    // Check collision / trigger question
    for (const obs of this.obstacles) {
      if (!obs.passed && obs.x < this.playerX + this.playerSize && obs.x + 40 > this.playerX) {
        if (!this.activeQuestion) {
          this.activeQuestion = obs;
          obs.passed = true;
          this._paused = false; // Don't pause, but show question
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
      }
    }

    // Cleanup far obstacles
    this.obstacles = this.obstacles.filter((o) => o.x > -100);

    // Score from distance
    if (Math.floor(this.distance) % 50 === 0) {
      this._score += 1;
      this.onStateChange?.(this._score, this._level);
    }
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

    // Obstacles
    for (const obs of this.obstacles) {
      ctx.fillStyle = obs.passed ? "#4CAF5050" : "#FF6B6B";
      const bw = 40;
      ctx.beginPath();
      ctx.roundRect(obs.x, this.groundY - obs.height, bw, obs.height, 6);
      ctx.fill();
      // Question mark
      if (!obs.passed) {
        ctx.fillStyle = "#FFF";
        ctx.font = "bold 18px Poppins";
        ctx.textAlign = "center";
        ctx.fillText("?", obs.x + bw / 2, this.groundY - obs.height + 25);
      }
    }

    // Player
    const px = this.playerX;
    const py = this.playerY;
    const ps = this.playerSize;
    // Body
    ctx.fillStyle = "#FFB800";
    ctx.beginPath();
    ctx.roundRect(px, py, ps, ps, 10);
    ctx.fill();
    // Eyes
    ctx.fillStyle = "#333";
    ctx.beginPath();
    ctx.arc(px + ps * 0.35, py + ps * 0.35, 4, 0, Math.PI * 2);
    ctx.arc(px + ps * 0.65, py + ps * 0.35, 4, 0, Math.PI * 2);
    ctx.fill();
    // Smile
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(px + ps / 2, py + ps * 0.5, 8, 0.1, Math.PI - 0.1);
    ctx.stroke();

    // Question UI
    if (this.activeQuestion && this.answerTimer === 0) {
      // Dim background
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillRect(0, 0, w, h);

      // Question box
      const boxW = Math.min(400, w - 40);
      const boxH = 120;
      const boxX = (w - boxW) / 2;
      const boxY = h / 2 - 50;

      ctx.fillStyle = "#FFF";
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, 16);
      ctx.fill();
      ctx.shadowColor = "transparent";

      ctx.fillStyle = "#333";
      ctx.font = "bold 24px Poppins";
      ctx.textAlign = "center";
      ctx.fillText(`${this.activeQuestion.question} = ?`, w / 2, boxY + 35);

      // Answer buttons
      const btnW = 80;
      const btnH = 40;
      const startX = w / 2 - (this.activeQuestion.options.length * (btnW + 10)) / 2;
      const btnY = boxY + 55;

      this.activeQuestion.options.forEach((opt, i) => {
        ctx.fillStyle = "#FFD84D";
        ctx.beginPath();
        ctx.roundRect(startX + i * (btnW + 10), btnY, btnW, btnH, 10);
        ctx.fill();

        ctx.fillStyle = "#333";
        ctx.font = "bold 18px Nunito";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${opt}`, startX + i * (btnW + 10) + btnW / 2, btnY + btnH / 2);
      });

      // Key hints
      ctx.fillStyle = "#999";
      ctx.font = "12px Nunito";
      ctx.fillText("Press 1, 2, or 3 — or click an answer", w / 2, boxY + boxH + 20);
    }

    // Answer feedback
    if (this.answerResult) {
      ctx.fillStyle = this.answerResult === "correct" ? "#4CAF50" : "#FF6B6B";
      ctx.font = "bold 32px Poppins";
      ctx.textAlign = "center";
      ctx.fillText(
        this.answerResult === "correct" ? "✓ Correct!" : "✗ Wrong!",
        w / 2,
        h / 2
      );
    }
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
    this.playerY = this.groundY - this.playerSize;
    this.playerVY = 0;
    this.isJumping = false;
    this.obstacles = [];
    this.nextObstacleAt = 300;
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
