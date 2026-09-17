import React, { useState, useRef, useEffect } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function ImageCropper({
    open,
    onClose,
    imageSrc,
    onCropComplete,
    aspectRatio = 1,
    targetWidth = 800,
    targetHeight = 800,
    title = "Crop Image"
}) {
    const imgRef = useRef(null);
    const [crop, setCrop] = useState({
        unit: '%',
        width: 100,
        aspect: aspectRatio,
    });
    const [completedCrop, setCompletedCrop] = useState(null);

    // Re-initialize crop when aspect ratio changes
    useEffect(() => {
        setCrop({
            unit: '%',
            width: 100,
            aspect: aspectRatio,
        });
    }, [aspectRatio, open]);

    const getCroppedImg = () => {
        if (!completedCrop || !imgRef.current) return;

        const image = imgRef.current;
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        // Set canvas to target dimensions
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');

        // High quality scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(
            image,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            targetWidth,
            targetHeight
        );

        // Convert to blob
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    console.error('Canvas is empty');
                    return;
                }
                const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
                onCropComplete(file);
                onClose();
            },
            'image/jpeg',
            0.95
        );
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <p className="text-sm text-gray-500 mt-2">
                        Adjust the crop area to {targetWidth}x{targetHeight}px (Ratio {aspectRatio.toFixed(2)})
                    </p>
                </DialogHeader>

                <div className="flex justify-center py-4 max-h-[500px] overflow-auto">
                    <ReactCrop
                        crop={crop}
                        onChange={(c) => setCrop(c)}
                        onComplete={(c) => setCompletedCrop(c)}
                        aspect={aspectRatio}
                    >
                        <img
                            ref={imgRef}
                            src={imageSrc}
                            alt="Crop preview"
                            className="max-w-full"
                            style={{ maxHeight: '400px', objectFit: 'contain' }}
                        />
                    </ReactCrop>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="border-gray-300"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={getCroppedImg}
                        disabled={!completedCrop}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Crop & Continue
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
