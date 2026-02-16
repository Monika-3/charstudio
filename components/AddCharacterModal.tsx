"use client";
import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { uploadCharacterImage } from "@/lib/storage";
import { X, Loader2, User, Upload, Image } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddCharacterModal({
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file!");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB!");
      return;
    }

    setImageFile(file);
    setError("");

    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please drop an image file!");
      return;
    }

    setImageFile(file);
    setError("");

    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await getCurrentUser();
      if (!user) throw new Error("Not logged in!");

      let referenceImageUrl = null;

      // Upload image if selected
      if (imageFile) {
        const { url, error: uploadError } = await uploadCharacterImage(
          name.trim(),
          imageFile,
        );
        if (uploadError) throw uploadError;
        referenceImageUrl = url;
      }

      // Save character to database
      const { error: dbError } = await supabase.from("characters").insert({
        name: name.trim(),
        user_id: user.id,
        reference_image_url: referenceImageUrl,
      });

      if (dbError) throw dbError;

      // Reset form
      setName("");
      setImageFile(null);
      setImagePreview("");
      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create character",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setImageFile(null);
    setImagePreview("");
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-2xl max-w-md w-full border border-zinc-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Add Character</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Character Name */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Character Name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Axel, Luna, Byte..."
                className="w-full pl-12 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Reference Image <span className="text-zinc-500">(optional)</span>
            </label>

            {imagePreview ? (
              /* Image Preview */
              <div className="relative rounded-xl overflow-hidden border-2 border-blue-500">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview("");
                    }}
                    className="px-4 py-2 bg-red-500 rounded-lg text-white text-sm font-medium"
                  >
                    Remove Image
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded text-xs text-white">
                  {imageFile?.name}
                </div>
              </div>
            ) : (
              /* Drop Zone */
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-zinc-700 hover:border-blue-500 rounded-xl p-8 text-center cursor-pointer transition group"
              >
                <div className="w-12 h-12 rounded-full bg-zinc-800 group-hover:bg-blue-500/20 flex items-center justify-center mx-auto mb-3 transition">
                  <Image className="w-6 h-6 text-zinc-500 group-hover:text-blue-400 transition" />
                </div>
                <p className="text-sm text-zinc-400 group-hover:text-zinc-300 transition">
                  Click or drag & drop image here
                </p>
                <p className="text-xs text-zinc-600 mt-1">
                  PNG, JPG, WEBP � Max 5MB
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Create Character
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
