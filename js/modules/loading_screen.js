/** Loading screen */

class LoadingScreen {
  constructor() {
    this.active = true;
  }

  bind(root) {
    this.el = document.querySelector('#loading-screen-target');
    this.hide();
  }

  setMessage(msg) {
    this.el.querySelector('#loading-screen-text').innerHTML = msg;
  }

  show() {
    if (this.el && !this.active) {
      this.active = true;
      this.el.classList.remove('hidden');
      this.el.classList.add('animated');
      this.el.classList.add('active');
    }
  }

  hide() {
    if (this.el && this.active) {
      this.active = false;
      setTimeout(() => {
        this.el.classList.remove('active');
        setTimeout(() => {
          this.el.classList.remove('animated');
          this.el.classList.add('hidden');
        }, 500);
      }, 500);
    }
  }
}

export default LoadingScreen;
