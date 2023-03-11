import Compressor from 'compressorjs';

export async function compress(
    file: File | Blob,
    width: number,
    height: number,
) {
    return await new Promise((resolve, reject) => {
        new Compressor(file, {
            width,
            height,
            resize: 'cover',
            quality: 0.6,
            mimeType: 'image/jpeg',
            beforeDraw(context, canvas) {
                context.fillStyle = '#18181B';
                context.fillRect(0, 0, canvas.width, canvas.height);
            },
            success: resolve,
            error: reject,
        });
    });
}
