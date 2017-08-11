class ImageCropper{
    constructor(canvasId, image, imageBounds){
        this.canvas = document.getElementById(canvasId);
        this.startPoint = {x: 0, y: 0};
        this.endPoint = {x: 0, y: 0};
        this.drawCropRect = false;
        this.img = image;
        this.imgBounds = imageBounds;
        let scale = window.devicePixelRatio;
        this.imgBounds.x *= scale;
        this.imgBounds.y *= scale;
        this.imgBounds.w *= scale;
        this.imgBounds.h *= scale;
        this.canvas.width = this.imgBounds.w;
        this.canvas.height = this.imgBounds.h;
    }
    start(){
        let that = this;
        this.canvas.addEventListener('mousedown', function(e){ that.onMouseDown(that, e); }, false);
        this.canvas.addEventListener('mouseup', function(e){ that.onMouseUp(that, e); }, false);
        this.canvas.addEventListener('mousemove', function(e){ that.onMouseMove(that, e); }, false);
        this.render();
    }
    stop(){
        this.canvas.removeEventListener('mousedown', this.onMouseDown);
        this.canvas.removeEventListener('mouseup', this.onMouseUp);
        this.canvas.removeEventListener('mousemove', this.onMouseMove);
        this.drawCropRect = false;
    }
    getCroppedImage(){
        let context = this.canvas.getContext('2d');
        this.canvas.width = Math.abs(this.endPoint.x - this.startPoint.x);
        this.canvas.height = Math.abs(this.endPoint.y - this.startPoint.y);
        context.drawImage(this.img, this.imgBounds.x + this.startPoint.x, this.imgBounds.y + this.startPoint.y, this.canvas.width, this.canvas.height, 0, 0, this.canvas.width,  this.canvas.height);
        return this.canvas.toDataURL('image/jpeg');
    }
    getMousePos(e) {
        let canvasBounds = this.canvas.getBoundingClientRect();
        return {
            // extra 12 to accomodate padding
            x: (e.clientX - canvasBounds.left)/(canvasBounds.right - canvasBounds.left) * (this.canvas.width+12),
            y: (e.clientY - canvasBounds.top)/(canvasBounds.bottom - canvasBounds.top) * (this.canvas.height+12),
        };
    }
    onMouseDown(that, e){
        that.startPoint = that.getMousePos(e);
        that.endPoint = that.getMousePos(e);
        that.drawCropRect = true;
    }
    onMouseUp(that, e){
        that.endPoint = that.getMousePos(e);
        that.render();
        that.drawCropRect = false;
    }
    onMouseMove(that, e){
        if(that.drawCropRect){
            that.endPoint = that.getMousePos(e);
            that.render();
        }
    }
    render(){
        let context = this.canvas.getContext('2d');
        context.drawImage(this.img, this.imgBounds.x, this.imgBounds.y, this.imgBounds.w, this.imgBounds.h, 0, 0, this.imgBounds.w,  this.imgBounds.h);
        if(this.drawCropRect){
            context.fillStyle = 'rgba(0,0,0,0.5)';
            // context.fillRect(0, 0, this.canvas.width, this.canvas.height);
            context.fillRect(this.startPoint.x, this.startPoint.y, this.endPoint.x-this.startPoint.x, this.endPoint.y-this.startPoint.y);
        }

    }
}
