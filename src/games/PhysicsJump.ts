import type { GameEngine } from "./types";

export class PhysicsJumpEngine implements GameEngine {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private animId = 0;
  private _paused = false;
  private _score = 0;
  private _level = 1;
  private running = false;

  private playerX = 0;
  private playerY = 0;
  private playerVY = 0;
  private playerSize = 30;
  private gravity = 0.35;
  private jumpForce = -9;

  private platforms: Array<{ x: number; y: number; w: number; type: "normal" | "moving" | "bouncy"; dx?: number }> = [];
  private cameraY = 0;
  private highestY = 0;
  private gameStarted = false;

  private handleKeyDown: (e: KeyboardEvent) => void = () => {};
  private handleKeyUp: (e: KeyboardEvent) => void = () => {};
  private handleClick: (e: MouseEvent) => void = () => {};
  private keysDown = new Set<string>();

  onStateChange?: (score: number, level: number) => void;
  onGameOver?: (finalScore: number) => void;

  init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;

    this.handleKeyDown = (e) => {
      this.keysDown.add(e.key);
      if ((e.key === " " || e.key === "ArrowUp") && !this.gameStarted) {
        this.gameStarted = true;
      }
    };
    this.handleKeyUp = (e) => { this.keysDown.delete(e.key); };
    this.handleClick = () => { if (!this.gameStarted) this.gameStarted = true; };

    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("keyup", this.handleKeyUp);
    canvas.addEventListener("click", this.handleClick);

    this.resetState();
  }

  private resetState() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.playerX = w / 2 - this.playerSize / 2;
    this.playerY = h - 80;
    this.playerVY = 0;
    this.cameraY = 0;
    this.highestY = 0;
    this.gameStarted = false;

    // Generate initial platforms
    this.platforms = [];
    // Starting platform
    this.platforms.push({ x: w / 2 - 40, y: h - 40, w: 80, type: "normal" });
    for (let i = 1; i < 20; i++) {
      this.addPlatform(h - 40 - i * 70);
    }
  }

  private addPlatform(y: number) {
    const w = this.canvas.width;
    const pw = 60 + Math.random() * 40;
    const px = Math.random() * (w - pw);
    const rand = Math.random();
    const type = this._level >= 3 && rand < 0.15 ? "bouncy" : this._level >= 2 && rand < 0.25 ? "moving" : "normal";
    this.platforms.push({
      x: px, y, w: pw, type,
      dx: type === "moving" ? (Math.random() > 0.5 ? 1.5 : -1.5) : 0,
    });
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
    if (!this.gameStarted) return;

    const w = this.canvas.width;

    // Horizontal movement
    const moveSpeed = 5;
    if (this.keysDown.has("ArrowLeft") || this.keysDown.has("a")) {
      this.playerX -= moveSpeed;
    }
    if (this.keysDown.has("ArrowRight") || this.keysDown.has("d")) {
      this.playerX += moveSpeed;
    }
    // Wrap around
    if (this.playerX + this.playerSize < 0) this.playerX = w;
    if (this.playerX > w) this.playerX = -this.playerSize;

    // Gravity
    this.playerVY += this.gravity;
    this.playerY += this.playerVY;

    // Platform collision (only when falling)
    if (this.playerVY >= 0) {
      for (const p of this.platforms) {
        if (
          this.playerX + this.playerSize > p.x &&
          this.playerX < p.x + p.w &&
          this.playerY + this.playerSize >= p.y &&
          this.playerY + this.playerSize <= p.y + 12
        ) {
          this.playerVY = p.type === "bouncy" ? this.jumpForce * 1.5 : this.jumpForce;
          this.playerY = p.y - this.playerSize;
        }
      }
    }

    // Move moving platforms
    for (const p of this.platforms) {
      if (p.type === "moving" && p.dx) {
        p.x += p.dx;
        if (p.x <= 0 || p.x + p.w >= w) p.dx *= -1;
      }
    }

    // Camera follows player upward
    const screenY = this.playerY - this.cameraY;
    if (screenY < this.canvas.height * 0.4) {
      this.cameraY = this.playerY - this.canvas.height * 0.4;
    }

    // Track height / score
    const height = Math.floor(-this.cameraY / 10);
    if (height > this._score) {
      this._score = height;
      this._level = Math.floor(this._score / 50) + 1;
      this.onStateChange?.(this._score, this._level);
    }

    // Generate more platforms
    const topScreen = this.cameraY;
    const highestPlatform = Math.min(...this.platforms.map((p) => p.y));
    if (highestPlatform > topScreen - 200) {
      for (let i = 0; i < 5; i++) {
        this.addPlatform(highestPlatform - (i + 1) * 70);
      }
    }

    // Remove platforms far below
    this.platforms = this.platforms.filter((p) => p.y < this.cameraY + this.canvas.height + 100);

    // Game over: fell below screen
    if (this.playerY - this.cameraY > this.canvas.height + 50) {
      this.onGameOver?.(this._score);
      this.running = false;
    }
  }

  private draw() {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;

    // Background
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#E8F5FD");
    grad.addColorStop(1, "#FFF8E1");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(0, -this.cameraY);

    // Platforms
    for (const p of this.platforms) {
      if (p.y < this.cameraY - 20 || p.y > this.cameraY + h + 20) continue;
      ctx.fillStyle = p.type === "bouncy" ? "#FF6B6B" : p.type === "moving" ? "#7C4DFF" : "#FFD84D";
      ctx.beginPath();
      ctx.roundRect(p.x, p.y, p.w, 10, 5);
      ctx.fill();
      // Shadow
      ctx.fillStyle = p.type === "bouncy" ? "#E55A5A" : p.type === "moving" ? "#6A3DE0" : "#FFB800";
      ctx.beginPath();
      ctx.roundRect(p.x + 2, p.y + 8, p.w - 4, 4, 3);
      ctx.fill();
    }

    // Player
    const px = this.playerX;
    const py = this.playerY;
    const ps = this.playerSize;
    ctx.fillStyle = "#FFB800";
    ctx.beginPath();
    ctx.arc(px + ps / 2, py + ps / 2, ps / 2, 0, Math.PI * 2);
    ctx.fill();
    // Eyes
    ctx.fillStyle = "#333";
    ctx.beginPath();
    ctx.arc(px + ps * 0.35, py + ps * 0.4, 3, 0, Math.PI * 2);
    ctx.arc(px + ps * 0.65, py + ps * 0.4, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Height indicator
    ctx.fillStyle = "#33333380";
    ctx.font = "12px Nunito";
    ctx.textAlign = "right";
    ctx.fillText(`Height: ${this._score}m`, w - 10, 20);

    // Start prompt
    if (!this.gameStarted) {
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#FFF";
      ctx.font = "bold 24px Poppins";
      ctx.textAlign = "center";
      ctx.fillText("Click or press Space to start!", w / 2, h / 2);
      ctx.font = "14px Nunito";
      ctx.fillText("Use ← → arrow keys to move", w / 2, h / 2 + 30);
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
    this._paused = false;
    this.resetState();
    this.onStateChange?.(0, 1);
    this.running = true;
    this.loop();
  }

  destroy() {
    this.running = false;
    cancelAnimationFrame(this.animId);
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("keyup", this.handleKeyUp);
    this.canvas.removeEventListener("click", this.handleClick);
  }
}
