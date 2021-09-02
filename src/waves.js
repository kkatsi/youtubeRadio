import SimplexNoise from "simplex-noise";

const canvas = {
  playing: true,
  toggle() {
    this.playing = !this.playing;
  },
  init() {
    this.ele = document.querySelector("#waves");
    this.resize();
    window.addEventListener("resize", () => this.resize(), false);
    this.ctx = this.ele.getContext("2d");
    return this.ctx;
  },
  onResize(callback) {
    this.resizeCallback = callback;
  },
  resize() {
    this.width = this.ele.width = window.innerWidth * 2;
    this.height = this.ele.height = window.innerHeight * 2;
    this.ele.style.width = this.ele.width * 0.5 + "px";
    this.ele.style.height = this.ele.height * 0.5 + "px";
    this.ctx = this.ele.getContext("2d");
    this.ctx.scale(2, 2);
    this.resizeCallback && this.resizeCallback();
  },
  run(callback) {
    requestAnimationFrame(() => {
      this.run(callback);
    });
    callback(this.ctx);
  },
};

const ctx = canvas.init();

let objects = [];

class Wave {
  vectors = [];
  constructor(color) {
    this.color = color;
    this.noise = new SimplexNoise(Math.random());
  }

  drawLine() {
    ctx.strokeStyle = this.color;
    for (let i = 0; i < this.vectors.length; i++) {
      ctx.beginPath();
      const { x, y } = this.vectors[i];
      ctx.lineCap = "round";
      ctx.lineWidth = 2;
      ctx.moveTo(0, 0);
      ctx.lineTo(x, y);
      ctx.closePath();
      ctx.stroke();
    }
  }

  draw(t) {
    ctx.save();
    ctx.translate(window.innerWidth * 0.5, window.innerHeight * 0.5);

    const base = 180;
    const scale = 20;
    this.vectors = [];

    for (let degree = 0; degree < 180; degree++) {
      const radius = (degree / 90) * Math.PI;
      const length =
        base +
        this.noise.noise3D(Math.cos(radius), Math.sin(radius), t) * scale;

      this.vectors.push({
        x: length * Math.cos(radius),
        y: length * Math.sin(radius),
      });
    }
    this.drawLine();

    ctx.restore();
  }
}

const init = () => {
  objects = [];
  objects.push(new Wave("#FE1735"));
};

init();

let tick = 0;
canvas.run((ctx) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  tick += 0.05;
  objects.forEach((obj) => {
    obj.draw(tick);
  });
});

canvas.onResize(() => {
  init();
});
