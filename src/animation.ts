import { loadImage } from "./util";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
let ctx: CanvasRenderingContext2D;
let sprite: Sprite;

interface SpriteAnimation {
    id: string;
    frames: Array<number>;
    fps: number;
}

interface SpriteManifest {
    spritesheet: string;
    frame_width: number;
    frame_height: number;
    animations: Array<SpriteAnimation>;
}

class Sprite {
    private manifest: SpriteManifest;
    private img: HTMLImageElement;

    private lastFrameSwitch: number = 0;
    private frameIndex: number = 0;
    private activeAnimation?: SpriteAnimation;

    public scale: number = 5;
    public x: number = 0;
    public y: number = 0;
    public frame: number = 0;
    public reverseX: boolean = false;

    constructor(manifest: SpriteManifest, img: HTMLImageElement) {
        this.manifest = manifest;
        this.img = img;
    }

    // Set the sprites current animation
    setAnimation(id: string) {
        this.activeAnimation = this.manifest.animations.find(
            (a) => a.id === id
        );

        if (this.activeAnimation == null) {
            console.error("Unable to find animation", id);
            return;
        }

        this.frame = this.activeAnimation.frames[0];
    }

    // Step the sprite's animation forward with the given timestep.
    stepAnimation(timestamp: number) {
        if (this.activeAnimation == null) {
            return;
        }

        const msPerFrame = 1000.0 / this.activeAnimation.fps;
        if (timestamp - this.lastFrameSwitch > msPerFrame) {
            this.lastFrameSwitch = timestamp;
            this.frameIndex =
                (this.frameIndex + 1) % this.activeAnimation.frames.length;
            this.frame = this.activeAnimation.frames[this.frameIndex];
        }
    }

    // Draw the sprite
    draw(ctx: CanvasRenderingContext2D) {
        const xFrames = this.img.width / this.manifest.frame_width;

        let frameX = this.frame % xFrames;
        let frameY = Math.floor(this.frame / xFrames);

        let sourceX = frameX * this.manifest.frame_width;
        let sourceY = frameY * this.manifest.frame_height;
        let sourceWidth = this.manifest.frame_width;
        let sourceHeight = this.manifest.frame_height;

        let dstWidth = this.manifest.frame_width * this.scale;
        let dstHeight = this.manifest.frame_height * this.scale;

        if (this.reverseX) {
            ctx.save();
            ctx.translate(CANVAS_WIDTH, 0);
            ctx.scale(-1, 1);
        }

        ctx.drawImage(
            this.img,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            this.x,
            this.y,
            dstWidth,
            dstHeight
        );

        if (this.reverseX) {
            ctx.restore();
        }
    }
}

async function createSprite(spriteFile: string): Promise<Sprite> {
    let ret = await fetch("assets/guy.json");
    let manifest = await ret.json();
    let img = await loadImage(manifest.spritesheet);
    return new Sprite(manifest, img);
}

function draw(timestamp: number) {
    // Update animations and positions
    sprite.stepAnimation(timestamp);
    //sprite.x += 2;

    // Clear canvas
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw the sprite
    sprite.draw(ctx);

    window.requestAnimationFrame(draw);
}

async function main() {
    // Setup our canvas
    let canvas = document.createElement("canvas");
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    let tCtx = canvas.getContext("2d");
    if (tCtx === null) {
        throw new Error("Unable to create 2d context");
    }
    ctx = tCtx;
    document.getElementById("app")?.appendChild(canvas);

    // Enable/disable image smoothing
    ctx.imageSmoothingEnabled = false;
    ctx.imageSmoothingQuality = "high";

    // Load our sprite
    sprite = await createSprite("assets/guy.json");

    // Position the sprite
    sprite.x = 100;
    sprite.y = 50;

    // Pick the animation to run
    sprite.setAnimation("roll");

    sprite.reverseX = true;

    // Start the animation loop
    window.requestAnimationFrame(draw);

    //document.addEventListener("keydown", handleKeyDown);
}

main();
