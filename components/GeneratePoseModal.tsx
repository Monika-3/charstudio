"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { generateCharacterPose, downloadImageAsFile } from "@/lib/huggingface";
import { removeImageBackground } from "@/lib/backgroundRemoval";
import { uploadPoseImage } from "@/lib/storage";
import { X, Sparkles, Loader2 } from "lucide-react";
import type { Character } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  characters: Character[];
  onSuccess: () => void;
}

const GENRES = [
  "Action",
  "Standing",
  "Running",
  "Combat",
  "Stealth",
  "Cinematic",
];

export default function GeneratePoseModal({
  isOpen,
  onClose,
  characters,
  onSuccess,
}: Props) {
  const [selectedCharacterId, setSelectedCharacterId] = useState("");
  const [genre, setGenre] = useState("action");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState("");
  const [progress, setProgress] = useState(0);
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");
  const [removeBg, setRemoveBg] = useState(true);

  if (!isOpen) return null;

  const selectedCharacter = characters.find(
    (c) => c.id === selectedCharacterId,
  );

  const handleGenerate = async () => {
    if (!selectedCharacterId || !description) {
      alert("Please select a character and enter a description!");
      return;
    }

    setLoading(true);
    setProgress(0);
    setCurrentStep("Generating image with AI...");

    try {
      // STEP 1: Generate with HuggingFace
      setProgress(10);
      const imageUrl = await generateCharacterPose(
        selectedCharacter!.name,
        description,
        genre,
      );
      setGeneratedImageUrl(imageUrl);
      setProgress(40);

      // STEP 2: Convert base64 to File
      setCurrentStep("Processing image...");
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      let imageFile = new File(
        [blob],
        selectedCharacter!.name + "-" + genre + ".png",
        { type: "image/png" },
      );
      setProgress(55);

      // STEP 3: Remove background (optional)
      if (removeBg) {
        setCurrentStep("Removing background (30-60 seconds)...");
        imageFile = await removeImageBackground(imageFile, (prog) => {
          setProgress(55 + prog * 25);
        });
      }

      setProgress(80);
      setCurrentStep("Uploading to cloud storage...");

      // STEP 4: Upload to Supabase Storage
      const { url: uploadedUrl, error: uploadError } = await uploadPoseImage(
        selectedCharacter!.name,
        genre,
        imageFile,
      );
      if (uploadError) throw uploadError;

      setProgress(90);
      setCurrentStep("Saving to database...");

      // STEP 5: Save to database
      const { error: dbError } = await supabase.from("poses").insert({
        character_id: selectedCharacterId,
        name: genre.charAt(0).toUpperCase() + genre.slice(1) + " Pose",
        genre: genre,
        image_url: uploadedUrl,
        has_background_removed: removeBg,
      });

      if (dbError) throw dbError;

      setProgress(100);
      setCurrentStep("Done!");

      await new Promise((resolve) => setTimeout(resolve, 500));
      alert("Pose generated successfully!");
      onSuccess();
      handleClose();
    } catch (error) {
      console.error("Generation failed:", error);
      alert(
        "Failed: " + (error instanceof Error ? error.message : "Unknown error"),
      );
    } finally {
      setLoading(false);
      setProgress(0);
      setCurrentStep("");
    }
  };

  const handleClose = () => {
    setGeneratedImageUrl("");
    setDescription("");
    setProgress(0);
    setCurrentStep("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-zinc-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                AI Pose Generator
              </h2>
              <p className="text-sm text-zinc-400">Powered by HuggingFace AI</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-zinc-400 hover:text-white transition disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-8">
          {/* LEFT: Controls */}
          <div className="space-y-6">
            {/* Character Selection */}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wide">
                Select Character
              </label>
              <div className="grid grid-cols-3 gap-3">
                {characters.map((char) => (
                  <button
                    key={char.id}
                    onClick={() => setSelectedCharacterId(char.id)}
                    disabled={loading}
                    className={
                      "flex flex-col items-center p-4 rounded-xl border-2 transition " +
                      (selectedCharacterId === char.id
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-zinc-700 hover:border-zinc-600 bg-zinc-800/50") +
                      " disabled:opacity-50"
                    }
                  >
                    <div className="w-14 h-14 rounded-full bg-zinc-700 flex items-center justify-center text-2xl mb-2 overflow-hidden">
                      {char.reference_image_url ? (
                        <img
                          src={char.reference_image_url}
                          alt={char.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        "👤"
                      )}
                    </div>
                    <span className="text-xs font-medium text-white text-center">
                      {char.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Genre Selection */}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wide">
                Pose Genre
              </label>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGenre(g.toLowerCase())}
                    disabled={loading}
                    className={
                      "px-4 py-2 rounded-lg text-sm font-medium transition " +
                      (genre === g.toLowerCase()
                        ? "bg-blue-500 text-white"
                        : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700") +
                      " disabled:opacity-50"
                    }
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wide">
                Pose Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                placeholder="Describe the pose... e.g. 'standing tall with arms crossed, confident expression'"
                className="w-full p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50"
                rows={4}
              />
            </div>

            {/* Remove Background Toggle */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-zinc-800 border border-zinc-700">
              <input
                type="checkbox"
                id="remove-bg"
                checked={removeBg}
                onChange={(e) => setRemoveBg(e.target.checked)}
                disabled={loading}
                className="mt-1 w-4 h-4 rounded"
              />
              <div>
                <label
                  htmlFor="remove-bg"
                  className="text-sm font-medium text-white cursor-pointer"
                >
                  Remove background automatically
                </label>
                <p className="text-xs text-zinc-400 mt-1">
                  FREE — runs in browser (adds 30-60 seconds)
                </p>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading || !selectedCharacterId || !description}
              className="w-full p-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-purple-500/50 transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Pose
                </>
              )}
            </button>

            {/* Progress Bar */}
            {loading && (
              <div className="space-y-2 p-4 rounded-xl bg-zinc-800 border border-zinc-700">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-300">{currentStep}</span>
                  <span className="text-blue-400 font-semibold">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                    style={{ width: progress + "%" }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Preview */}
          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wide">
              Preview
            </label>
            <div className="aspect-[3/4] rounded-xl bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center overflow-hidden">
              {generatedImageUrl ? (
                <img
                  src={generatedImageUrl}
                  alt="Generated pose"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-zinc-500 p-8">
                  <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">Preview appears here</p>
                  <p className="text-sm mt-2">
                    Fill in the details and click Generate!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
