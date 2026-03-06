const MAX_UPLOAD_DIMENSION = 1600;
const LARGE_IMAGE_FILE_BYTES = 1_500_000;
const OPTIMIZED_QUALITY = 0.82;
const DEFAULT_QUALITY = 0.92;

export interface PromptImageOptimizationPlan {
  shouldOptimize: boolean;
  targetWidth: number;
  targetHeight: number;
  targetMimeType: string;
  quality: number;
}

export function createPromptImageOptimizationPlan(input: { width: number; height: number; size: number; type: string; }): PromptImageOptimizationPlan {
  const scale = Math.min(1, MAX_UPLOAD_DIMENSION / Math.max(input.width, input.height));
  const targetWidth = Math.max(1, Math.round(input.width * scale));
  const targetHeight = Math.max(1, Math.round(input.height * scale));
  const shouldOptimize = scale < 1 || input.size > LARGE_IMAGE_FILE_BYTES;

  return {
    shouldOptimize,
    targetWidth,
    targetHeight,
    targetMimeType: shouldOptimize ? "image/webp" : input.type,
    quality: shouldOptimize ? OPTIMIZED_QUALITY : DEFAULT_QUALITY,
  };
}

async function readImageDimensions(file: File) {
  const imageUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const nextImage = new Image();
      nextImage.onload = () => resolve(nextImage);
      nextImage.onerror = () => reject(new Error("Could not read image dimensions."));
      nextImage.src = imageUrl;
    });

    return { width: image.naturalWidth || image.width, height: image.naturalHeight || image.height };
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

function exportCanvas(canvas: HTMLCanvasElement, mimeType: string, quality: number) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });
}

function buildOptimizedFileName(fileName: string, mimeType: string) {
  const baseName = fileName.replace(/\.[^.]+$/, "");
  const extension = mimeType === "image/webp" ? "webp" : fileName.split(".").pop() || "img";
  return `${baseName || "prompt-image"}.${extension}`;
}

export async function optimizePromptImageFile(file: File) {
  if (typeof document === "undefined") return file;

  const { width, height } = await readImageDimensions(file);
  const plan = createPromptImageOptimizationPlan({ width, height, size: file.size, type: file.type || "image/png" });
  if (!plan.shouldOptimize) return file;

  const canvas = document.createElement("canvas");
  canvas.width = plan.targetWidth;
  canvas.height = plan.targetHeight;

  const context = canvas.getContext("2d");
  if (!context) return file;

  const sourceUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const nextImage = new Image();
      nextImage.onload = () => resolve(nextImage);
      nextImage.onerror = () => reject(new Error("Could not prepare image for upload."));
      nextImage.src = sourceUrl;
    });

    context.drawImage(image, 0, 0, plan.targetWidth, plan.targetHeight);
    const blob = await exportCanvas(canvas, plan.targetMimeType, plan.quality);
    if (!blob || blob.size >= file.size) return file;

    return new File([blob], buildOptimizedFileName(file.name, plan.targetMimeType), { type: plan.targetMimeType, lastModified: Date.now() });
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

