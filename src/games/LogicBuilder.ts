import type { GameEngine } from "./types";

interface Piece {
  type: "ramp" | "weight" | "lever" | "platform";
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  placed: boolean;
  rotation?: number;
}

interface Puzzle {
  description: string;
  hint: string;
  targetZone: { x: number; y: number; w: number; h: number };
  pieces: Piece[];
  goalCondition: (pieces: Piece[]) => boolean;
}

export class LogicBuilderEngine implements GameEngine {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private animId = 0;
  private _paused = false;
  private _score = 0;
  private _level = 1;
  private running = false;

  private puzzles: Puzzle[] = [];
  private currentPuzzle = 0;
  private pieces: Piece[] = [];
  private dragging: Piece | null = null;
  private dragOffX = 0;
  private dragOffY = 0;
  private solved = false;
  private solvedTimer = 0;
  private showHint = false;

  // Inventory area
  private inventoryY = 0;

  private handleMouseDown: (e: MouseEvent) => void = () => {};
  private handleMouseMove: (e: MouseEvent) => void = () => {};
  private handleMouseUp: () => void = () => {};
  private handleClick: (e: MouseEvent) => void = () => {};

  onStateChange?: (score: number, level: number) => void;
  onGameOver?: (finalScore: number) => void;

  init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.inventoryY = canvas.height - 90;

    this.buildPuzzles();
    this.loadPuzzle(0);

    this.handleMouseDown = (e) => {
      if (this.solved) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      for (let i = this.pieces.length - 1; i >= 0; i--) {
        const p = this.pieces[i];
        if (mx >= p.x && mx <= p.x + p.w && my >= p.y && my <= p.y + p.h) {
          this.dragging = p;
          this.dragOffX = mx - p.x;
          this.dragOffY = my - p.y;
          // Move to top
          this.pieces.splice(i, 1);
          this.pieces.push(p);
          break;
        }
      }
    };

    this.handleMouseMove = (e) => {
      if (!this.dragging) return;
      const rect = canvas.getBoundingClientRect();
      this.dragging.x = e.clientX - rect.left - this.dragOffX;
      this.dragging.y = e.clientY - rect.top - this.dragOffY;
    };

    this.handleMouseUp = () => {
      if (this.dragging) {
        const puz = this.puzzles[this.currentPuzzle];
        const tz = puz.targetZone;
        const p = this.dragging;
        // Check if in target zone
        p.placed = (
          p.x + p.w / 2 > tz.x &&
          p.x + p.w / 2 < tz.x + tz.w &&
          p.y + p.h / 2 > tz.y &&
          p.y + p.h / 2 < tz.y + tz.h
        );
        this.dragging = null;

        // Check solution
        if (puz.goalCondition(this.pieces)) {
          this.solved = true;
          this.solvedTimer = 90;
          this._score += 30 * this._level;
          this.onStateChange?.(this._score, this._level);
        }
      }
    };

    canvas.addEventListener("mousedown", this.handleMouseDown);
    canvas.addEventListener("mousemove", this.handleMouseMove);
    canvas.addEventListener("mouseup", this.handleMouseUp);
  }

  private buildPuzzles() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const tz = { x: w * 0.25, y: h * 0.2, w: w * 0.5, h: h * 0.45 };

    this.puzzles = [
      {
        description: "Place the ramp and weight to reach the platform!",
        hint: "Put the ramp first, then the weight on top.",
        targetZone: tz,
        pieces: [
          { type: "ramp", x: 30, y: this.inventoryY + 10, w: 70, h: 40, color: "#FFB800", placed: false },
          { type: "weight", x: 120, y: this.inventoryY + 10, w: 40, h: 40, color: "#FF6B6B", placed: false },
          { type: "platform", x: 200, y: this.inventoryY + 10, w: 80, h: 20, color: "#4CAF50", placed: false },
        ],
        goalCondition: (pieces) => pieces.filter((p) => p.placed).length >= 3,
      },
      {
        description: "Use the lever to lift the heavy weight!",
        hint: "Place the lever in the center, weight on one side.",
        targetZone: tz,
        pieces: [
          { type: "lever", x: 30, y: this.inventoryY + 10, w: 90, h: 15, color: "#7C4DFF", placed: false },
          { type: "weight", x: 140, y: this.inventoryY + 10, w: 45, h: 45, color: "#FF6B6B", placed: false },
          { type: "weight", x: 210, y: this.inventoryY + 10, w: 30, h: 30, color: "#FFB800", placed: false },
        ],
        goalCondition: (pieces) => pieces.filter((p) => p.placed).length >= 3,
      },
      {
        description: "Build a bridge to cross the gap!",
        hint: "Use all pieces to form a path across.",
        targetZone: tz,
        pieces: [
          { type: "platform", x: 20, y: this.inventoryY + 10, w: 80, h: 18, color: "#4CAF50", placed: false },
          { type: "platform", x: 110, y: this.inventoryY + 10, w: 80, h: 18, color: "#4CAF50", placed: false },
          { type: "ramp", x: 200, y: this.inventoryY + 10, w: 60, h: 35, color: "#FFB800", placed: false },
          { type: "weight", x: 280, y: this.inventoryY + 10, w: 35, h: 35, color: "#FF6B6B", placed: false },
        ],
        goalCondition: (pieces) => pieces.filter((p) => p.placed).length >= 4,
      },
      {
        description: "Stack all pieces to build the tallest tower!",
        hint: "Place biggest at bottom, smallest at top.",
        targetZone: tz,
        pieces: [
          { type: "platform", x: 20, y: this.inventoryY + 10, w: 90, h: 22, color: "#FFB800", placed: false },
          { type: "platform", x: 120, y: this.inventoryY + 10, w: 70, h: 22, color: "#7C4DFF", placed: false },
          { type: "weight", x: 210, y: this.inventoryY + 10, w: 50, h: 22, color: "#4CAF50", placed: false },
          { type: "weight", x: 280, y: this.inventoryY + 10, w: 35, h: 22, color: "#FF6B6B", placed: false },
        ],
        goalCondition: (pieces) => pieces.filter((p) => p.placed).length >= 4,
      },
    ];
  }

  private loadPuzzle(index: number) {
    if (index >= this.puzzles.length) {
      this.onGameOver?.(this._score);
      this.running = false;
      return;
    }
    this.currentPuzzle = index;
    this.solved = false;
    this.solvedTimer = 0;
    this.showHint = false;
    // Deep copy pieces
    this.pieces = this.puzzles[index].pieces.map((p) => ({ ...p }));
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
    if (this.solved) {
      this.solvedTimer--;
      if (this.solvedTimer <= 0) {
        this._level++;
        this.onStateChange?.(this._score, this._level);
        this.loadPuzzle(this.currentPuzzle + 1);
      }
    }
  }

  private draw() {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;

    // BG
    ctx.fillStyle = "#FFF8E1";
    ctx.fillRect(0, 0, w, h);

    // Target zone
    const tz = this.puzzles[this.currentPuzzle]?.targetZone;
    if (tz) {
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = "#FFD84D80";
      ctx.lineWidth = 2;
      ctx.strokeRect(tz.x, tz.y, tz.w, tz.h);
      ctx.setLineDash([]);

      ctx.fillStyle = "#FFD84D15";
      ctx.fillRect(tz.x, tz.y, tz.w, tz.h);

      ctx.fillStyle = "#99999960";
      ctx.font = "12px Nunito";
      ctx.textAlign = "center";
      ctx.fillText("Drop pieces here", tz.x + tz.w / 2, tz.y + tz.h / 2);
    }

    // Puzzle description
    const puz = this.puzzles[this.currentPuzzle];
    if (puz) {
      ctx.fillStyle = "#333";
      ctx.font = "bold 16px Poppins";
      ctx.textAlign = "center";
      ctx.fillText(puz.description, w / 2, 30);

      ctx.fillStyle = "#999";
      ctx.font = "12px Nunito";
      ctx.fillText(`Puzzle ${this.currentPuzzle + 1}/${this.puzzles.length}`, w / 2, 50);
    }

    // Inventory area
    ctx.fillStyle = "#F5F5F5";
    ctx.fillRect(0, this.inventoryY, w, h - this.inventoryY);
    ctx.fillStyle = "#E0E0E0";
    ctx.fillRect(0, this.inventoryY, w, 2);
    ctx.fillStyle = "#999";
    ctx.font = "11px Nunito";
    ctx.textAlign = "left";
    ctx.fillText("Your pieces — drag them up!", 10, this.inventoryY - 5);

    // Pieces
    for (const p of this.pieces) {
      ctx.fillStyle = p.color;
      if (p.type === "ramp") {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y + p.h);
        ctx.lineTo(p.x + p.w, p.y + p.h);
        ctx.lineTo(p.x + p.w, p.y);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.roundRect(p.x, p.y, p.w, p.h, 6);
        ctx.fill();
      }
      // Label
      ctx.fillStyle = "#FFF";
      ctx.font = "bold 10px Nunito";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(p.type, p.x + p.w / 2, p.y + p.h / 2);
    }

    // Solved overlay
    if (this.solved) {
      ctx.fillStyle = "rgba(76,175,80,0.2)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4CAF50";
      ctx.font = "bold 32px Poppins";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("✓ Solved!", w / 2, h / 2);
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
    this.currentPuzzle = 0;
    this.buildPuzzles();
    this.loadPuzzle(0);
    this.onStateChange?.(0, 1);
    this.running = true;
    this.loop();
  }

  destroy() {
    this.running = false;
    cancelAnimationFrame(this.animId);
    this.canvas.removeEventListener("mousedown", this.handleMouseDown);
    this.canvas.removeEventListener("mousemove", this.handleMouseMove);
    this.canvas.removeEventListener("mouseup", this.handleMouseUp);
  }
}
