import { supabase } from "../supabase";

export async function uploadImageToSupabase(imageUri) {
  if (!imageUri) return null;

  const fileName = `${Date.now()}.jpg`;
  const response = await fetch(imageUri);
  const blob = await response.blob();

  const arrayBuffer = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });

  const { data, error } = await supabase.storage
    .from("recipe")
    .upload(fileName, arrayBuffer, {
      contentType: "image/jpeg",
      upsert: false,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from("recipe")
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}