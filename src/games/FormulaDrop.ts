import type { GameEngine } from "./types";

interface FallingItem {
  x: number;
  y: number;
  value: string;
  isCorrect: boolean;
  speed: number;
  size: number;
}

interface Formula {
  display: string;
  missingVar: string;
  options: string[];
  correctIndex: number;
}

const FORMULAS: Array<() => Formula> = [
  () => {
    const vars = ["F", "m", "a"];
    const missing = Math.floor(Math.random() * 3);
    const display = missing === 0 ? "? = m × a" : missing === 1 ? "F = ? × a" : "F = m × ?";
    const options = [vars[missing], ...vars.filter((_, i) => i !== missing).slice(0, 1), "v"].sort(() => Math.random() - 0.5);
    return { display, missingVar: vars[missing], options, correctIndex: options.indexOf(vars[missing]) };
  },
  () => {
    const options = ["v/t", "m×v", "F×d", "v²"].sort(() => Math.random() - 0.5);
    return { display: "a = ?", missingVar: "v/t", options, correctIndex: options.indexOf("v/t") };
  },
  () => {
    const options = ["m×g×h", "½mv²", "F×d", "m×a"].sort(() => Math.random() - 0.5);
    return { display: "PE = ?", missingVar: "m×g×h", options, correctIndex: options.indexOf("m×g×h") };
  },
  () => {
    const options = ["½mv²", "m×g×h", "F/a", "v×t"].sort(() => Math.random() - 0.5);
    return { display: "KE = ?", missingVar: "½mv²", options, correctIndex: options.indexOf("½mv²") };
  },
  () => {
    const options = ["d/t", "a×t", "F/m", "m×g"].sort(() => Math.random() - 0.5);
    return { display: "v = ?", missingVar: "d/t", options, correctIndex: options.indexOf("d/t") };
  },
  () => {
    const options = ["F×d", "m×v", "½mv²", "P×t"].sort(() => Math.random() - 0.5);
    return { display: "W = ?", missingVar: "F×d", options, correctIndex: options.indexOf("F×d") };
  },
];

export class FormulaDropEngine implements GameEngine {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private animId = 0;
  private _paused = false;
  private _score = 0;
  private _level = 1;
  private running = false;

  private formula: Formula | null = null;
  private items: FallingItem[] = [];
  private spawnTimer = 0;
  private lives = 3;
  private questionsAnswered = 0;
  private feedback: { text: string; color: string; timer: number } | null = null;

  // Basket / catcher
  private catcherX = 0;
  private catcherW = 80;
  private catcherH = 30;

  private handleMouseMove: (e: MouseEvent) => void = () => {};
  private handleTouchMove: (e: TouchEvent) => void = () => {};
  private handleClick: (e: MouseEvent) => void = () => {};

  onStateChange?: (score: number, level: number) => void;
  onGameOver?: (finalScore: number) => void;

  init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.catcherX = canvas.width / 2 - this.catcherW / 2;

    this.handleMouseMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.catcherX = (e.clientX - rect.left) - this.catcherW / 2;
      this.catcherX = Math.max(0, Math.min(this.canvas.width - this.catcherW, this.catcherX));
    };
    this.handleTouchMove = (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      this.catcherX = (e.touches[0].clientX - rect.left) - this.catcherW / 2;
      this.catcherX = Math.max(0, Math.min(this.canvas.width - this.catcherW, this.catcherX));
    };

    canvas.addEventListener("mousemove", this.handleMouseMove);
    canvas.addEventListener("touchmove", this.handleTouchMove, { passive: false });

    this.newFormula();
  }

  private newFormula() {
    this.formula = FORMULAS[Math.floor(Math.random() * FORMULAS.length)]();
    this.items = [];
    this.spawnTimer = 0;
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
    if (!this.formula) return;

    this.spawnTimer++;
    const spawnRate = Math.max(40, 80 - this._level * 5);

    if (this.spawnTimer >= spawnRate && this.items.length < 6) {
      this.spawnTimer = 0;
      // Spawn an option
      const optIndex = Math.floor(Math.random() * this.formula.options.length);
      const opt = this.formula.options[optIndex];
      const size = 50;
      this.items.push({
        x: Math.random() * (this.canvas.width - size),
        y: -size,
        value: opt,
        isCorrect: optIndex === this.formula.correctIndex,
        speed: 1.5 + this._level * 0.3 + Math.random(),
        size,
      });
    }

    // Move items
    const catcherTop = this.canvas.height - this.catcherH - 20;
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      item.y += item.speed;

      // Caught by catcher
      if (
        item.y + item.size >= catcherTop &&
        item.y + item.size <= catcherTop + this.catcherH + 10 &&
        item.x + item.size / 2 >= this.catcherX &&
        item.x + item.size / 2 <= this.catcherX + this.catcherW
      ) {
        if (item.isCorrect) {
          this._score += 25 * this._level;
          this.questionsAnswered++;
          this.feedback = { text: "✓ Correct!", color: "#4CAF50", timer: 40 };
          if (this.questionsAnswered % 3 === 0) {
            this._level++;
          }
          this.onStateChange?.(this._score, this._level);
          this.newFormula();
          return;
        } else {
          this.lives--;
          this.feedback = { text: "✗ Wrong!", color: "#FF6B6B", timer: 40 };
          this.items.splice(i, 1);
          if (this.lives <= 0) {
            this.onGameOver?.(this._score);
            this.running = false;
            return;
          }
          continue;
        }
      }

      // Fell off screen
      if (item.y > this.canvas.height + 20) {
        this.items.splice(i, 1);
      }
    }

    if (this.feedback) {
      this.feedback.timer--;
      if (this.feedback.timer <= 0) this.feedback = null;
    }
  }

  private draw() {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;

    // Background
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#FFF4B5");
    grad.addColorStop(1, "#FFF8E1");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Formula display at top
    if (this.formula) {
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.roundRect(w / 2 - 120, 15, 240, 50, 14);
      ctx.fill();
      ctx.strokeStyle = "#FFD84D";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#333";
      ctx.font = "bold 22px Poppins";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.formula.display, w / 2, 40);
    }

    // Falling items
    for (const item of this.items) {
      ctx.fillStyle = "#FFF";
      ctx.beginPath();
      ctx.roundRect(item.x, item.y, item.size, item.size, 12);
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.strokeStyle = "#FFD84D";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#333";
      ctx.font = "bold 16px Poppins";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(item.value, item.x + item.size / 2, item.y + item.size / 2);
    }

    // Catcher
    const catcherTop = h - this.catcherH - 20;
    ctx.fillStyle = "#FFB800";
    ctx.beginPath();
    ctx.roundRect(this.catcherX, catcherTop, this.catcherW, this.catcherH, 10);
    ctx.fill();
    ctx.fillStyle = "#333";
    ctx.font = "bold 14px Nunito";
    ctx.textAlign = "center";
    ctx.fillText("CATCH", this.catcherX + this.catcherW / 2, catcherTop + this.catcherH / 2 + 5);

    // Lives
    ctx.font = "16px Nunito";
    ctx.textAlign = "left";
    ctx.fillStyle = "#FF6B6B";
    ctx.fillText("❤".repeat(this.lives), 15, 35);

    // Feedback
    if (this.feedback) {
      ctx.fillStyle = this.feedback.color;
      ctx.font = "bold 28px Poppins";
      ctx.textAlign = "center";
      ctx.fillText(this.feedback.text, w / 2, h / 2);
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
    this.lives = 3;
    this.questionsAnswered = 0;
    this._paused = false;
    this.feedback = null;
    this.newFormula();
    this.onStateChange?.(0, 1);
    this.running = true;
    this.loop();
  }

  destroy() {
    this.running = false;
    cancelAnimationFrame(this.animId);
    this.canvas.removeEventListener("mousemove", this.handleMouseMove);
    this.canvas.removeEventListener("touchmove", this.handleTouchMove);
  }
}
