// Load and decode an image from a URL
export async function loadImageData(filename: string): Promise<ImageData> {
    return new Promise<ImageData>((resolve, reject) => {
        let img = new Image();

        img.onload = () => {
            try {
                let canvas = document.createElement("canvas");
                let ctx = canvas.getContext("2d");
                if (ctx === null) {
                    throw new Error("Unable to create 2d context");
                }

                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                let imgData = ctx.getImageData(0, 0, img.width, img.height);

                resolve(imgData);
            } catch (ex) {
                console.log(ex);
                reject(ex);
            }
        };

        img.onerror = (err) => {
            reject(err);
        };

        img.crossOrigin = "Anonymous";
        img.src = filename;
    });
}

// Load an image from a filename
export async function loadImage(filename: string): Promise<HTMLImageElement> {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        let img = new Image();

        img.onload = () => {
            resolve(img);
        };

        img.onerror = (err) => {
            reject(err);
        };

        img.crossOrigin = "Anonymous";
        img.src = filename;
    });
}
