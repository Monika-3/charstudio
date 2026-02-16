import { supabase } from "./supabase";

export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
): Promise<{ url: string; error: Error | null }> {
  try {
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });

    if (uploadError) return { url: "", error: uploadError };

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(path);

    return { url: publicUrl, error: null };
  } catch (error) {
    return { url: "", error: error as Error };
  }
}

export async function uploadPoseImage(
  characterName: string,
  genre: string,
  file: File,
): Promise<{ url: string; error: Error | null }> {
  const timestamp = Date.now();
  const path =
    "poses/" + characterName + "-" + genre + "-" + timestamp + ".png";
  return uploadFile("generated-poses", path, file);
}

export async function uploadCharacterImage(
  characterName: string,
  file: File,
): Promise<{ url: string; error: Error | null }> {
  const timestamp = Date.now();
  const ext = file.name.split(".").pop();
  const path = "characters/" + characterName + "-" + timestamp + "." + ext;
  return uploadFile("character-references", path, file);
}
