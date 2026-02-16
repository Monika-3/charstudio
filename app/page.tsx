"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import GeneratePoseModal from "@/components/GeneratePoseModal";
import { Sparkles, Download, Trash2 } from "lucide-react";
import type { Character, Pose } from "@/types";

export default function Home() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [poses, setPoses] = useState<Pose[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchCharacters(), fetchPoses()]);
    setLoading(false);
  };

  const fetchCharacters = async () => {
    const { data } = await supabase
      .from("characters")
      .select("*")
      .order("created_at", { ascending: false });
    setCharacters(data || []);
  };

  const fetchPoses = async () => {
    const { data } = await supabase
      .from("poses")
      .select("*, characters(*)")
      .order("created_at", { ascending: false });
    setPoses(data || []);
  };

  const handleDownload = async (pose: Pose) => {
    const response = await fetch(pose.image_url);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = pose.name + ".png";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleDelete = async (pose: Pose) => {
    if (!confirm("Delete this pose?")) return;
    await supabase.from("poses").delete().eq("id", pose.id);
    setPoses(poses.filter((p) => p.id !== pose.id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading CharStudio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              CharStudio
            </h1>
            <p className="text-sm text-zinc-400">AI Character Pose Library</p>
          </div>
          <div className="text-right">
            <span className="text-blue-400 font-bold">{characters.length}</span>
            <span className="text-zinc-400 text-sm"> Characters · </span>
            <span className="text-purple-400 font-bold">{poses.length}</span>
            <span className="text-zinc-400 text-sm"> Poses</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {poses.length === 0 ? (
          <div className="text-center py-20">
            <Sparkles className="w-16 h-16 mx-auto mb-6 text-blue-400 opacity-50" />
            <h2 className="text-3xl font-bold mb-4">No poses yet!</h2>
            <p className="text-zinc-400 mb-8">
              {characters.length === 0
                ? "Add a character in Supabase first, then generate poses!"
                : "Click the button below to generate your first AI pose!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {poses.map((pose) => (
              <div
                key={pose.id}
                className="group bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/20"
              >
                {/* Image */}
                <div className="aspect-[3/4] bg-zinc-800 relative overflow-hidden">
                  <img
                    src={pose.image_url}
                    alt={pose.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />

                  {/* Badges */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    {pose.has_background_removed && (
                      <span className="px-2 py-1 rounded bg-green-500/90 text-white text-xs font-semibold">
                        No BG
                      </span>
                    )}
                    {pose.genre && (
                      <span className="px-2 py-1 rounded bg-blue-500/90 text-white text-xs font-semibold capitalize">
                        {pose.genre}
                      </span>
                    )}
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                    <button
                      onClick={() => handleDownload(pose)}
                      className="p-3 rounded-full bg-blue-500 hover:bg-blue-600 transition"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(pose)}
                      className="p-3 rounded-full bg-red-500 hover:bg-red-600 transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold">{pose.name}</h3>
                  <p className="text-sm text-zinc-400">
                    {pose.characters?.name}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {new Date(pose.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowModal(true)}
        disabled={characters.length === 0}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-2xl shadow-purple-500/50 hover:scale-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
        title={
          characters.length === 0
            ? "Add a character first!"
            : "Generate new pose"
        }
      >
        <Sparkles className="w-8 h-8 text-white" />
      </button>

      {/* Modal */}
      <GeneratePoseModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        characters={characters}
        onSuccess={loadData}
      />
    </div>
  );
}
