import { Component } from '@angular/core';

@Component({
  selector: 'canvas-zoom-and-drag',
  templateUrl: './canvas.component.html',
  styleUrls: ['../_assets/_styles/canvas.component.css']
})
export class CanvasComponent {
    public width: number = 1200;
    public heigth: number = 800;

    @ViewChild('pictureCanvas')
    pictureCanvas: ElementRef;
}
