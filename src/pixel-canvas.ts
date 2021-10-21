function toInt(value: string | null, deft: number): number {
    if (value == null) {
        return deft;
    }

    let v = parseInt(value, 10);

    if (v == null) {
        return deft;
    }

    return v;
}

function toNumberString(value: any, deft: string): string {
    let sval = deft;

    if (typeof value === "number") {
        sval = value.toString();
    } else if (typeof value === "string") {
        sval = value;
    }

    return sval;
}

////////////////////////////////////////////////////////////////////////////////
// PixelCanvas - large pixel drawing surface
////////////////////////////////////////////////////////////////////////////////
export class PixelCanvas extends HTMLElement {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    private _fullWidth: number = 0;
    private _fullHeight: number = 0;
    private _pixelWidth: number = 0;
    private _pixelHeight: number = 0;
    private _pixelSize: number = 0;
    constructor() {
        super();

        const shadow = this.attachShadow({ mode: "open" });
        this.canvas = document.createElement("canvas");
        let tCtx = this.canvas.getContext("2d");
        if (tCtx === null) {
            throw new Error("Unable to create 2d context");
        }
        this.ctx = tCtx;

        this.layout();
        this.paint();

        shadow.appendChild(this.canvas);
    }

    connectedCallback() {
        this.canvas.addEventListener(
            "pointermove",
            this.translatePointerEvent.bind(this)
        );
        this.canvas.addEventListener(
            "pointerdown",
            this.translatePointerEvent.bind(this)
        );
        this.canvas.addEventListener(
            "pointerup",
            this.translatePointerEvent.bind(this)
        );
    }

    disconnectedCallback() {
        this.canvas.removeEventListener(
            "pointermove",
            this.translatePointerEvent
        );
        this.canvas.removeEventListener(
            "pointerdown",
            this.translatePointerEvent
        );
        this.canvas.removeEventListener(
            "pointerup",
            this.translatePointerEvent
        );
    }

    ////////////////////////////////////////////////////////////////////////////////
    // Events
    ////////////////////////////////////////////////////////////////////////////////

    // Translate a pointer event's
    private translatePointerEvent(ev: PointerEvent) {
        let [x, y] = this.canvasToPixel(ev.offsetX, ev.offsetY);

        // Replace the raw event with our translated coordinates
        ev.stopPropagation();
        let translatedEvent = new PointerEvent(ev.type, {
            clientX: x,
            clientY: y
        });

        this.dispatchEvent(translatedEvent);
    }

    ////////////////////////////////////////////////////////////////////////////////
    // Layout
    ////////////////////////////////////////////////////////////////////////////////

    private canvasToPixel(x: number, y: number): [number, number] {
        let pX = Math.floor((x / this._fullWidth) * this._pixelWidth);
        let pY = Math.floor((y / this._fullHeight) * this._pixelHeight);
        return [pX, pY];
    }

    private layout() {
        this._pixelWidth = this.pixelWidth;
        this._pixelHeight = this.pixelHeight;
        this._pixelSize = this.pixelSize;
        this._fullWidth = this._pixelWidth * (this._pixelSize + 1) + 1;
        this._fullHeight = this._pixelHeight * (this._pixelSize + 1) + 1;

        this.canvas.width = this._fullWidth;
        this.canvas.height = this._fullHeight;
    }

    ////////////////////////////////////////////////////////////////////////////////
    // Drawing
    ////////////////////////////////////////////////////////////////////////////////

    // Fill the pixel at coordinate (x,y)
    public setPixel(x: number, y: number) {
        x = Math.round(x);
        y = Math.round(y);

        let xPx = x * this._pixelSize + x + 1;
        let yPx = y * this._pixelSize + y + 1;
        this.ctx.fillRect(xPx, yPx, this._pixelSize, this._pixelSize);
    }

    public pixelColor(style: string) {
        this.ctx.fillStyle = style;
    }

    private paint() {
        this.drawGrid();
    }

    // Draw the pixel grid
    private drawGrid() {
        let savedStyle = this.ctx.fillStyle;
        this.ctx.fillStyle = this.cellStyle;

        for (let x = 0; x < this._fullWidth; x += this._pixelSize + 1) {
            this.ctx.fillRect(x, 0, 1, this._fullHeight);
        }

        for (let y = 0; y < this._fullHeight; y += this._pixelSize + 1) {
            this.ctx.fillRect(0, y, this._fullWidth, 1);
        }

        this.ctx.fillStyle = savedStyle;
    }

    ////////////////////////////////////////////////////////////////////////////////
    // Attributes
    ////////////////////////////////////////////////////////////////////////////////
    static get observedAttributes() {
        return ["pixel-width", "pixel-height", "pixel-size", "cell-style"];
    }

    attributeChangedCallback(name: string, oldValue: any, newValue: any) {
        this.layout();
        this.paint();
    }

    get pixelWidth(): number {
        return toInt(this.getAttribute("pixel-width"), 50);
    }

    set pixelWidth(value: number) {
        this.setAttribute("pixel-width", toNumberString(value, "50"));
    }

    get pixelHeight() {
        return toInt(this.getAttribute("pixel-height"), 50);
    }

    set pixelHeight(value) {
        this.setAttribute("pixel-height", toNumberString(value, "50"));
    }

    get pixelSize() {
        return toInt(this.getAttribute("pixel-size"), 10);
    }

    set pixelSize(value) {
        this.setAttribute("pixel-size", toNumberString(value, "10"));
    }

    get cellStyle(): string {
        return this.getAttribute("cell-style") || "";
    }

    set cellStyle(value: string) {
        this.setAttribute("pixel-size", value);
    }
}

if (!customElements.get("pixel-canvas")) {
    customElements.define("pixel-canvas", PixelCanvas);
}
