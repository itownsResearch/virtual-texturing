//
//
//
import { Scene, NearestFilter, RGBAFormat, WebGLRenderTarget } from '../examples/jsm/three.module.js';

export class TileDetermination {
  constructor() {
    this.scene = new Scene();
    this.renderTarget = null;
    this.data = null;
    // debug
    this.canvas = null;
    this.imgData = null;
  }

  setSize (width, height) {

    if (!this.renderTarget) {
      var renderTargetParameters = {
        minFilter: NearestFilter,
        magFilter: NearestFilter,
        format: RGBAFormat,
        stencilBufer: false
      };

      this.renderTarget = new WebGLRenderTarget( width, height, renderTargetParameters );

    } else if ( width != this.renderTarget.width ||  height != this.renderTarget.height ) {

      this.renderTarget.setSize(width, height);

    } else {

      return;

    }

    this.data = new Uint8Array(width * height * 4);
    if (this.canvas) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.imgData = this.canvas.getContext('2d').createImageData(width, height);
    }

  }

  debug () {
    if ( this.canvas ) return;

    var verticalPosition = 0;
    var horizontalPosition = 10;
    var position = "absolute";
    var zIndex = "100";
    var borderColor = "red";
    var borderStyle = "solid";
    var borderWidth = 1;

    var fontSize = 13; // in pixels
    var fontFamily = "Arial";
    var lineHeight = 20; // in pixels

    // create div title
    var divTitle = document.createElement('div');

    divTitle.style.color = "#000000";
    divTitle.style.fontFamily = fontFamily;
    divTitle.style.fontSize = fontSize + "px";
    divTitle.style.fontWeight = "bold";
    divTitle.style.zIndex = 100;
    divTitle.style.position = "absolute";
    divTitle.style.top = verticalPosition + "px";
    divTitle.style.left = horizontalPosition + "px";

    divTitle.innerHTML = "Visible Tiles (Feedback Buffer)";
    document.body.appendChild(divTitle);

    const width = this.renderTarget.width;
    const height = this.renderTarget.height;

    this.canvas = document.createElement('canvas');
    this.canvas.width =  width;
    this.canvas.height = height;
    this.canvas.style.top = verticalPosition + lineHeight + "px";
    this.canvas.style.left = horizontalPosition + "px";
    this.canvas.style.position = position;
    this.canvas.style.zIndex = zIndex;
    this.canvas.style.borderColor = borderColor;
    this.canvas.style.borderStyle = borderStyle;
    this.canvas.style.borderWidth = borderWidth + "px";
    this.imgData = this.canvas.getContext('2d').createImageData(width, height);

    document.body.appendChild(this.canvas);
  }

  // parse render taget pixels (mip map levels and visible tile)
  update ( renderer, camera ) {

    renderer.setRenderTarget( this.renderTarget );
    renderer.render( this.scene, camera );
    renderer.setRenderTarget( null );
    renderer.readRenderTargetPixels( this.renderTarget, 0, 0,
      this.renderTarget.width, this.renderTarget.height, this.data );

    if (this.canvas) {
      // copy the flipped texture to data
      this.imgData.data.set(this.data);
      this.canvas.getContext('2d').putImageData(this.imgData, 0, 0);
    }
  }

};
