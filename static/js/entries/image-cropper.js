class ImageCropper{
    constructor(containerSelector, image, onCancel){
        this.containerSelector = containerSelector;
        this.screenshot = image;
        this.init();
        this.onCancel = onCancel;

        // console.warn(image, this.image);
        // this.image[0].href = image.src;

        $(document).on('splitpaneresize', () => { this.handleResize() });
        $(window).on('resize', () => { this.handleResize() });
    }

    init() {
        this.container = $(this.containerSelector);
        this.canvas = this.container.find('canvas');
        this.svg = this.container.find('svg');
        this.brushContainer = this.svg.find('g');
        this.imageContainer = this.svg.find('image');

        const scale = window.devicePixelRatio;
        const rect = this.svg[0].getBoundingClientRect();

        const offsetX = rect.left * scale;
        const offsetY = rect.top * scale;
        const width = rect.width * scale;
        const height = rect.height * scale;

        this.svg[0].setAttribute('viewBox', `${offsetX} ${offsetY} ${width} ${height}`);
        this.imageContainer.attr('href', this.screenshot.src);
    }

    cropImage(startX, startY, endX, endY) {
        const canvas = this.canvas[0];
        const image = this.screenshot;

        canvas.width = (endX - startX);
        canvas.height = (endY - startY);

        const context = canvas.getContext('2d');
        context.drawImage(
            image,
            startX, startY, canvas.width, canvas.height,
            0, 0, canvas.width, canvas.height,
        );
        const croppedImage = canvas.toDataURL('image/jpeg');

        canvas.width = 0;
        canvas.height = 0;
        return croppedImage;
    }

    getCroppedImage() {
        return this.croppedImage;
    }

    createBrush() {
        const scale = window.devicePixelRatio;
        const rect = this.svg[0].getBoundingClientRect();

        const container = d3.select(this.brushContainer[0]);
        const g = container.append('g').attr('class', 'brush');

        const brush = d3.brush()
            .extent([
                [rect.left * scale, rect.top * scale],
                [rect.right * scale, rect.bottom * scale],
            ])
            .on('end', () => {
                const r = d3.event.selection;
                if (r) {
                    this.croppedImage = this.cropImage(
                        r[0][0], r[0][1],
                        r[1][0], r[1][1],
                    );
                }
            });
        g.call(brush);

        this.brushGroup = g;
    }

    handleResize() {
        // Original screenshot is now invalid so just cancel the screenshot mode
        this.stop();
        this.onCancel();
    }

    start() {
        this.createBrush();
    }

    stop() {
        if (this.brushGroup) {
            this.brushGroup.remove();
        }
    }
}
