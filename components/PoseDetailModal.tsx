"use client";
import { X, Download, Trash2, Calendar, User, Sparkles } from "lucide-react";
import type { Pose } from "@/types";

interface Props {
  isOpen: boolean;
  pose: Pose | null;
  onClose: () => void;
  onDownload: (pose: Pose) => void;
  onDelete: (pose: Pose) => void;
}

export default function PoseDetailModal({
  isOpen,
  pose,
  onClose,
  onDownload,
  onDelete,
}: Props) {
  if (!isOpen || !pose) return null;

  const handleDelete = () => {
    onDelete(pose);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 transition text-white"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="grid md:grid-cols-2 gap-6 bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
          {/* Left: Image */}
          <div className="relative bg-zinc-950 flex items-center justify-center p-8">
            <img
              src={pose.image_url}
              alt={pose.name}
              className="max-h-[70vh] w-auto object-contain rounded-lg"
            />
            {/* Badges */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              {pose.has_background_removed && (
                <span className="px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-semibold">
                  No Background
                </span>
              )}
              {pose.genre && (
                <span className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-semibold capitalize">
                  {pose.genre}
                </span>
              )}
            </div>
          </div>

          {/* Right: Details */}
          <div className="p-8 flex flex-col">
            {/* Title */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-white mb-2">
                {pose.name}
              </h2>
              <div className="flex items-center gap-2 text-zinc-400">
                <User className="w-4 h-4" />
                <span className="text-sm">{pose.characters?.name}</span>
              </div>
            </div>

            {/* Info */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-zinc-800">
                <Calendar className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-xs text-zinc-500">Created On</p>
                  <p className="text-sm text-white font-medium">
                    {new Date(pose.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {pose.genre && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-zinc-800">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-xs text-zinc-500">Pose Type</p>
                    <p className="text-sm text-white font-medium capitalize">
                      {pose.genre}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-4 rounded-lg bg-zinc-800">
                <div className="w-5 h-5 rounded bg-gradient-to-r from-blue-500 to-purple-500" />
                <div>
                  <p className="text-xs text-zinc-500">Background Removed</p>
                  <p className="text-sm text-white font-medium">
                    {pose.has_background_removed ? "Yes ✓" : "No"}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-auto space-y-3">
              <button
                onClick={() => onDownload(pose)}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition"
              >
                <Download className="w-5 h-5" />
                Download Image
              </button>
              <button
                onClick={handleDelete}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-lg bg-zinc-800 hover:bg-red-500 text-white font-semibold transition"
              >
                <Trash2 className="w-5 h-5" />
                Delete Pose
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
