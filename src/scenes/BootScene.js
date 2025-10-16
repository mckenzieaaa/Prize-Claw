export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // placeholder: a small colored rectangle as data url
    this.load.image('player', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAQCAYAAAB49lG7AAAACXBIWXMAAAsSAAALEgHS3X78AAAAK0lEQVR42u3OsQ0AIAwEwXf/6c6hAgqJL3kQmybQmY0YBj0h5sA0mQ5wAgN3G+qnhv0bMAAAAASUVORK5CYII=');
    this.load.image('crop', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABg3Am/AAAACXBIWXMAAAsSAAALEgHS3X78AAAAPElEQVRoge3UsQ0AIAwDsXf/p2cQhYqk0oJB3n7u8c6qMo2QG4wMDAwMDCw4G8C6eYkQG2g1sK0wG3g7c6c+O8rY4f7oFhQAAAABJRU5ErkJggg==');
  }

  create() {
    this.scene.start('GameScene');
  }
}
