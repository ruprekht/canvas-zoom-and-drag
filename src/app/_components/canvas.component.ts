import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'canvas-zoom-and-drag',
  templateUrl: './canvas.component.html',
  styleUrls: ['../_assets/_styles/canvas.component.css']
})
export class CanvasComponent implements AfterViewInit {
  private _picture: HTMLImageElement;
  private _canvasPicture: any;
  private _ctxPicture: CanvasRenderingContext2D;
  private _pictureRatioInitialValue: number;
  private _pictureRatioCurrentValue: number;

  private readonly _picturePath: string = 'http://sf.co.ua/13/02/wallpaper-1024574.jpg';
  private readonly _scalling: number = 1.05;
  private readonly _scallingDblclick: number = 1.4;
  private readonly _scallingMaxConst: number = 5;
  private readonly _scallingMinConst: number = 0.1;
  private readonly _scallingFont: string = 'bold 24px Tahoma';
  private readonly _scallingFontColor: string = '#428bca';
  private readonly _scallingTextAlign: string = 'end';

  private _shiftX: number;
  private _shiftY: number;
  private _dragging: boolean = false;
  private _dragStartX: number;
  private _dragStartY: number;
  private _scallingMaxValue: number;
  private _scallingMinValue: number;

  public width: number = 1200;
  public heigth: number = 800;

  @ViewChild('pictureCanvas')
  pictureCanvas: ElementRef;

  private get _currentRatio(): number {
    return this._pictureRatioCurrentValue ? this._pictureRatioCurrentValue : this._pictureRatioInitialValue;
  }

  private get _scallingMax(): number {
    if (!this._scallingMaxValue) {
        this._scallingMaxValue = this._scallingMaxConst;
    }
    return this._scallingMaxValue;
  }

  private get _scallingMin(): number {
    if (!this._scallingMinValue) {
        this._scallingMinValue = Math.min(this._pictureRatioInitialValue, this._scallingMinConst);
    }
    return this._scallingMinValue;
  }

  public ngAfterViewInit() {
    this.initialDrawPicture(this._picturePath);

    this._canvasPicture.addEventListener('mousewheel', (event: any) => this.mouseWheelHandler(event), false);
    this._canvasPicture.addEventListener('mousedown', (event: any) => this.mouseDownHandler(event), false);
    this._canvasPicture.addEventListener('mouseup', (event: any) => this.mouseUpHandler(event), false);
    this._canvasPicture.addEventListener('mousemove', (event: any) => this.mouseMoveHandler(event), false);
    this._canvasPicture.addEventListener('mouseout', (event: any) => this.mouseUpHandler(event), false);
    this._canvasPicture.addEventListener('dblclick', (event: any) => this.mouseDoubleClickHandler(event), false);
  }

  private async initialDrawPicture(path: string, x: number = 0, y: number = 0) {
    this._canvasPicture = this.pictureCanvas.nativeElement;
    this._ctxPicture = this._canvasPicture.getContext('2d');

    await this.loadImage(path)
        .then((res) => {
            this._picture = res;
            let hRatio: any, vRatio: any;
            if (this._canvasPicture.width > this._picture.width && this._canvasPicture.height > this._picture.height) {
                this._pictureRatioInitialValue = 1;
            } else {
                hRatio = this._canvasPicture.width / this._picture.width;

                vRatio = this._canvasPicture.height / this._picture.height;
                this._pictureRatioInitialValue = Math.min(hRatio, vRatio);
            }

            const initialShiftX = (this.width - this._picture.width * this._pictureRatioInitialValue) / 2;
            const initialShiftY = (this.heigth - this._picture.height * this._pictureRatioInitialValue) / 2;
            this.drawPicture(this._picture, this._pictureRatioInitialValue, initialShiftX, initialShiftY);
        })
        .catch(() => console.log(`Something goes wrong during image upload. URL: ${path}`));
  }

  private mouseWheelHandler(event: any, scalling: number = this._scalling) {
    let multiplicator: number;
    let shiftX: number;
    let shiftY: number;
    if (event.wheelDelta > 0) {
        if (scalling * this._currentRatio > this._scallingMax) {
            return;
        }
        multiplicator = scalling * this._currentRatio;
        shiftX = this._shiftX - ((event.offsetX - this._shiftX) * (scalling - 1));
        shiftY = this._shiftY - ((event.offsetY - this._shiftY) * (scalling - 1));
    } else {
        if (this._currentRatio / scalling < this._scallingMin) {
            return;
        }
        multiplicator = this._currentRatio / this._scalling;
        shiftX = this._shiftX + ((event.offsetX - this._shiftX) * (1 - (1 / scalling)));
        shiftY = this._shiftY + ((event.offsetY - this._shiftY) * (1 - (1 / scalling)));
    }
    this._pictureRatioCurrentValue = multiplicator;
    this.drawPicture(this._picture, multiplicator, shiftX, shiftY);
  }

  private mouseMoveHandler(event: any) {
    if (!this._dragging) {
        return;
    }
    const shiftX = this._shiftX + (event.offsetX - this._dragStartX);
    const shiftY = this._shiftY + (event.offsetY - this._dragStartY);
    this.drawPicture(this._picture, this._currentRatio, shiftX, shiftY);
    
    this._dragStartX = event.offsetX;
    this._dragStartY = event.offsetY;
  }

  private mouseDownHandler(event: any) {
    this._dragging = true;
    this._dragStartX = event.offsetX;
    this._dragStartY = event.offsetY;
  }

  private mouseUpHandler(event: any) {
      this._dragging = false;
  }

  private mouseDoubleClickHandler(event: any) {
    this.mouseWheelHandler({
      offsetX: event.offsetX,
      offsetY: event.offsetY,
      wheelDelta: 120
    }, this._scallingDblclick);
  }

  private drawPicture(img: HTMLImageElement, scalling: number, shiftX: number, shiftY: number) {
    this._shiftX = shiftX;
    this._shiftY = shiftY;
    this._ctxPicture.clearRect(0, 0, this.width, this.heigth);
    this._ctxPicture.drawImage(img, 0, 0, img.width, img.height, this._shiftX, this._shiftY, img.width * scalling, img.height * scalling);
    this._ctxPicture.font = this._scallingFont;
    this._ctxPicture.fillStyle = this._scallingFontColor;
    this._ctxPicture.textAlign = this._scallingTextAlign;
    this._ctxPicture.fillText(`${Math.round(scalling * 100)}%`, this.width - 15, 30);
  }

  private loadImage(path: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = path;
        image.onload = () => resolve(image);
        image.onerror = (error) => reject(error);
    });
  }
}
