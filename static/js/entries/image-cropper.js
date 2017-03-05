class ImageCropper{
    constructor(canvasId){
        this.canvas = document.getElementById(canvasId);
    }
    start(){
        this.canvas.addEventListener('mousedown', this.onMouseDown, false);
        this.canvas.addEventListener('mouseup', this.onMouseUp, false);
        this.canvas.addEventListener('mousemove', this.onMouseMove, false);
    }
    end(){
        this.canvas.removeEventListener('mousedown', this.onMouseDown);
        this.canvas.removeEventListener('mouseup', this.onMouseUp);
        this.canvas.removeEventListener('mousemove', this.onMouseMove);
    }
    onMouseDown(e){
        console.log('down');
    }
    onMouseUp(e){
        console.log('up');
    }
    onMouseMove(e){
        console.log('move');
    }
}
