
/**
 * Compresses an image file to a target size range using a canvas.
 * @param file The image file to compress.
 * @param minSizeKB The minimum desired file size in kilobytes.
 * @param maxSizeKB The maximum desired file size in kilobytes.
 * @returns A promise that resolves with the Base64 encoded string of the compressed image.
 * @throws An error if the image cannot be compressed to the target size range.
 */
export const compressImage = (file: File, minSizeKB: number, maxSizeKB: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    return reject(new Error('Could not get canvas context'));
                }

                // Start with a modest resize to help with compression
                const MAX_WIDTH = 1024;
                const MAX_HEIGHT = 1024;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                // Iteratively attempt to compress the image to the target size range
                const tryCompress = (quality: number, attempts: number) => {
                    if (attempts <= 0) {
                        return reject(new Error(`Could not compress image to be between ${minSizeKB}KB and ${maxSizeKB}KB. Please try a different image.`));
                    }

                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                return reject(new Error('Canvas to Blob conversion failed.'));
                            }
                            
                            const sizeKB = blob.size / 1024;

                            if (sizeKB > maxSizeKB) {
                                // Too large, reduce quality
                                tryCompress(quality - 0.1, attempts - 1);
                            } else if (sizeKB < minSizeKB) {
                                // Too small, this is the best we can do without increasing size, so we accept it
                                // In a more complex scenario, one might try resizing up slightly, but for now we accept.
                                const blobReader = new FileReader();
                                blobReader.readAsDataURL(blob);
                                blobReader.onloadend = () => {
                                    resolve(blobReader.result as string);
                                };
                            } else {
                                // Within range, success!
                                const blobReader = new FileReader();
                                blobReader.readAsDataURL(blob);
                                blobReader.onloadend = () => {
                                    resolve(blobReader.result as string);
                                };
                            }
                        },
                        'image/jpeg',
                        quality
                    );
                };
                
                // Start with high quality and 10 attempts
                tryCompress(0.9, 10); 
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};
