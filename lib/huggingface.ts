export async function generateImage(prompt: string): Promise<string> {
  const response = await fetch("/api/generate-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: prompt.slice(0, 300) }),
  });

  if (!response.ok) {
    throw new Error("Image generation failed: " + response.status);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data.imageUrl;
}

export async function generateCharacterPose(
  characterName: string,
  poseDescription: string,
  genre: string,
): Promise<string> {
  const prompt =
    "full body " +
    characterName +
    " character, " +
    poseDescription +
    ", " +
    genre +
    " pose, white background, character design, high quality";
  return generateImage(prompt);
}

export async function downloadImageAsFile(
  url: string,
  filename: string = "generated.png",
): Promise<File> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Download failed");
  const blob = await response.blob();
  return new File([blob], filename, { type: "image/png" });
}
