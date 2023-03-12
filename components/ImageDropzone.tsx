import { BsCameraFill, BsDashCircleFill } from 'react-icons/bs';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import React from 'react';
import Image from 'next/image';
import { compress } from '@/lib/fileutils';

export default function ImageDropzone({
    url,
    deleteUrl,
    className,
    width,
    height,
    id,
    defaultUrl,
}: {
    url: string;
    deleteUrl: string;
    className: string;
    width: number;
    height: number;
    id?: string;
    defaultUrl?: string;
}) {
    const [imgUrl, setImgUrl] = React.useState<string | null>(
        defaultUrl ?? null,
    );
    const {
        getRootProps,
        getInputProps,
        isFocused,
        isDragAccept,
        isDragReject,
    } = useDropzone({
        onDrop: (files) => {
            if (files && files.length > 0) {
                if (
                    confirm(`Are you sure you want to upload ${files[0].name}?`)
                ) {
                    compress(files[0], width, height)
                        .then((compressedFile) => {
                            return axios.post(url, compressedFile);
                        })
                        .then((res) => {
                            setImgUrl(res.data.url);
                        })
                        .catch((e) => {
                            if (e && e.response && e.response.status === 413) {
                                alert(
                                    'File size too large. Please try a different file.',
                                );
                            } else {
                                alert(
                                    'Error uploading logo. Please try again later or try a different file.',
                                );
                            }
                        });
                }
            }
        },
        accept: { 'image/*': [] },
        maxFiles: 1,
    });
    let dropzoneRing = '';
    if (isFocused) dropzoneRing = 'ring-4 ring-teal-400';
    if (isDragAccept) dropzoneRing = 'ring-4 ring-green-400';
    if (isDragReject) dropzoneRing = 'ring-4 ring-red-400';

    const deleteImage = async (e: any) => {
        e.preventDefault();
        e.stopPropagation();

        if (confirm('Are you sure you want to delete this image?')) {
            try {
                await axios.post(deleteUrl);
                setImgUrl(null);
            } catch (error) {
                alert('Error deleting image. Please try again later.');
            }
        }
    };

    return (
        <div
            {...getRootProps({
                id,
                className: `relative mx-auto rounded-2xl bg-teal-200/40 border border-2 border-dashed cursor-pointer overflow-hidden ${dropzoneRing} ${className}`,
            })}
        >
            <input {...getInputProps()} />
            {imgUrl && (
                <Image
                    src={imgUrl}
                    alt=""
                    width={width}
                    height={height}
                    className="h-full w-full object-contain"
                />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/40 p-4 hover:bg-zinc-900/60">
                {imgUrl ? (
                    <>
                        <BsCameraFill className="h-12 w-12" />
                        <button
                            type="button"
                            onClick={deleteImage}
                            className="absolute bottom-4 right-4 flex items-center rounded-lg bg-zinc-600 px-2 py-2 text-lg font-medium hover:bg-zinc-700 focus:outline-none focus:ring-4 focus:ring-zinc-400"
                        >
                            <BsDashCircleFill className="h-6 w-6" />
                        </button>
                    </>
                ) : (
                    <p>Drag & drop or click to select an image</p>
                )}
            </div>
        </div>
    );
}
