/**
 * @author Francico Avila - http://franciscoavila.mx
 */

import { RenderWithVtShader } from './RenderWithVtShader.js';
import { VirtualTexture } from '../../src/VirtualTexture.js';
import { Clock, WebGLRenderer, Scene, PerspectiveCamera, Mesh } from '../jsm/three.module.js';
import { FlyControls } from '../jsm/FlyControls.js';
import { WEBGL } from '../jsm/WebGL.js';

export class APP {
  constructor(canvas) {
    this.domContainer = document.getElementById(canvas || "canvas_container");
    this.scene = null;
    this.renderer = null;
    this.camera = null;
    this.controls = null;
    this.clock = new Clock();

    this.virtualTexture = null;

  }

  onKeyDown(event) {
    switch(event.key) {
      case "l": this.virtualTexture.debugLevel = !this.virtualTexture.debugLevel; break;
      case "c": this.virtualTexture.debugCache = !this.virtualTexture.debugCache; break;
      case "i": console.log(this.virtualTexture.cache.getStatus()); break;
      default: return; break;
    }
    this.virtualTexture.updateUniforms(this.material);
    event.preventDefault();
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.virtualTexture.setSize(w, h);
  }

  render() {
    if (this.virtualTexture && this.renderer.renderCount > 0) {
      this.virtualTexture.update(this.renderer, this.camera);
    }

    ++this.renderer.renderCount;
    this.renderer.render(this.scene, this.camera);
  }

  run() {
    var delta = this.clock.getDelta();

    this.controls.update(delta);
    requestAnimationFrame(this.run.bind(this));

    this.render();
  }

  start() {

    if ( !WEBGL.isWebGL2Available() ) {

      document.body.appendChild(WEBGL.getWebGL2ErrorMessage());
      return false;

    }

    var width = window.innerWidth;
    var height = window.innerHeight;
    console.log("width:" + width + " height:" + height);

    this.renderer = new WebGLRenderer();
    this.renderer.renderCount = 0;
    this.renderer.setSize(width, height);
    this.renderer.extensions.get("OES_texture_float_linear");
    this.domContainer.appendChild(this.renderer.domElement);

    // create a scene
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 1000);
    this.camera.position.set(0.0, 0.0, 80.0);
    this.scene.add(this.camera);

  /**********************************************************************************/

    this.controls = new FlyControls(this.camera, this.renderer.domElement);
    this.controls.movementSpeed = 50;
    this.controls.domElement = this.renderer.domElement;
    this.controls.rollSpeed = Math.PI / 12;
    this.controls.autoForward = false;
    this.controls.dragToLook = true;

    window.addEventListener('resize', this.resize.bind(this), false);
    window.addEventListener('keydown', this.onKeyDown.bind(this), false);
    return true;
  }

  load(geometry, config) {

    this.virtualTexture = new VirtualTexture(config);
    this.material = this.virtualTexture.createMaterial(RenderWithVtShader, 'tDiffuse');
    const mesh = new Mesh(geometry, this.material);
    this.scene.add(mesh);
    this.virtualTexture.addGeometry(geometry);

    // init debug helpers
    //this.virtualTexture.tileDetermination.debug();
    //this.virtualTexture.indirectionTable.debug();
  }
};
