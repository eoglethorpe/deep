
class ChangesPopup {
    constructor(element, changes) {
        this.changes = changes;
        element.click(() => {
            this.show();
        });
    }

    show() {
        console.log(this.changes);
    }
}
