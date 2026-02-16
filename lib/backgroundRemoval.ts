import * as bgRemoval from "@imgly/background-removal";

export async function removeImageBackground(
  imageFile: File,
  onProgress?: (progress: number) => void,
): Promise<File> {
  try {
    const imageUrl = URL.createObjectURL(imageFile);

    const blob = await bgRemoval.removeBackground(imageUrl, {
      progress: (key: string, current: number, total: number) => {
        const progress = current / total;
        if (onProgress) onProgress(progress);
      },
    });

    URL.revokeObjectURL(imageUrl);

    const filename = imageFile.name.replace(/\.[^/.]+$/, "") + "-no-bg.png";
    return new File([blob], filename, { type: "image/png" });
  } catch (error) {
    console.error("Background removal failed:", error);
    throw new Error("Failed to remove background");
  }
}
