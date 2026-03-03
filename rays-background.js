/**
 * Rays emitter background for About section
 */
(function () {
  const container = document.querySelector('.a-rays');
  if (!container) return;

  class Ray {
    constructor(emitter) {
      this.emitter = emitter;
      const gap = 12;
      this.x = Math.random() * this.emitter.width;
      this.y = Math.floor(Math.random() * ((this.emitter.height / gap) + 1)) * gap;
      this.width = 50 * Math.random();
      this.velocity = 0.25 + this.width / 50;
      this.d = '';
    }
    update() {
      this.x += this.velocity;
      if (this.x > this.emitter.width) {
        this.x = -this.width;
      }
    }
    draw() {
      this.d = 'M ' + this.x + ',' + this.y + ' h ' + this.width + ' v 1 h -' + this.width + ' z ';
    }
    tick() {
      this.update();
      this.draw();
    }
  }

  class Rays {
    constructor() {
      this.container = container;
      this.width = this.container.clientWidth;
      this.height = this.container.clientHeight;
      this.rays = [];
      this.init();
    }
    init() {
      this.resizeHandler();
      window.addEventListener('resize', this.resizeHandler.bind(this));
      requestAnimationFrame(this.tick.bind(this));
    }
    resizeHandler() {
      this.width = this.container.clientWidth;
      this.height = this.container.clientHeight;
      this.emit();
    }
    emit() {
      this.rays = [];
      this.totalRays = this.height * 0.75;
      for (let i = 0; i < this.totalRays; i++) {
        this.rays.push(new Ray(this));
      }
    }
    tick() {
      let path = '';
      this.rays.forEach(ray => {
        ray.tick();
        path += ray.d;
      });
      this.container.style.clipPath = 'path("' + path + '")';
      requestAnimationFrame(this.tick.bind(this));
    }
  }

  new Rays();
})();
