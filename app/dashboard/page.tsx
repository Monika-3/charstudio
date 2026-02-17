"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getCurrentUser, signOut } from "@/lib/auth";
import GeneratePoseModal from "@/components/GeneratePoseModal";
import AddCharacterModal from "@/components/AddCharacterModal";
import EditCharacterModal from "@/components/EditCharacterModal";
import PoseDetailModal from "@/components/PoseDetailModal";
import {
  Sparkles,
  Download,
  Trash2,
  LogOut,
  UserPlus,
  Pencil,
  Search,
} from "lucide-react";
import type { Character, Pose } from "@/types";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [poses, setPoses] = useState<Pose[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showAddCharacter, setShowAddCharacter] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<any>(null);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingPose, setViewingPose] = useState<Pose | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      router.push("/login");
      return;
    }
    setUser(currentUser);
    await loadData();
    setLoading(false);
  };

  const loadData = async () => {
    await Promise.all([fetchCharacters(), fetchPoses()]);
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

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
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

  const handleDeletePose = async (pose: Pose) => {
    if (!confirm("Delete this pose?")) return;
    await supabase.from("poses").delete().eq("id", pose.id);
    setPoses(poses.filter((p) => p.id !== pose.id));
  };

  const handleDeleteCharacter = async (characterId: string) => {
    if (!confirm("Delete this character and ALL their poses?")) return;
    await supabase.from("poses").delete().eq("character_id", characterId);
    await supabase.from("characters").delete().eq("id", characterId);
    setCharacters(characters.filter((c) => c.id !== characterId));
    setPoses(poses.filter((p) => p.character_id !== characterId));
    if (selectedFilter === characterId) setSelectedFilter(null);
  };

  const filteredPoses = poses.filter((p) => {
    if (selectedFilter && p.character_id !== selectedFilter) return false;
    if (selectedGenre && p.genre !== selectedGenre) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = p.name.toLowerCase().includes(query);
      const matchesCharacter = p.characters?.name.toLowerCase().includes(query);
      const matchesGenre = p.genre?.toLowerCase().includes(query);
      if (!matchesName && !matchesCharacter && !matchesGenre) return false;
    }
    return true;
  });

  const selectedCharacterName = selectedFilter
    ? characters.find((c) => c.id === selectedFilter)?.name || ""
    : "";

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
      {/* ── HEADER ──────────────────────────────────────── */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              CharStudio
            </h1>
            <p className="text-sm text-zinc-400">AI Character Pose Library</p>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <span className="text-blue-400 font-bold">
                {characters.length}
              </span>
              <span className="text-zinc-400 text-sm"> chars · </span>
              <span className="text-purple-400 font-bold">{poses.length}</span>
              <span className="text-zinc-400 text-sm"> poses</span>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-xs text-zinc-500">Logged in as</p>
              <p className="text-sm font-medium text-white truncate max-w-[160px]">
                {user?.email}
              </p>
            </div>
            <button
              onClick={() => setShowAddCharacter(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-sm font-semibold transition"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Character</span>
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── CHARACTER CAROUSEL ──────────────────────────── */}
      {characters.length > 0 && (
        <div className="border-b border-zinc-800 bg-zinc-900/30">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide font-semibold mb-3">
              Your Characters
            </p>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {characters.map((char) => (
                <div
                  key={char.id}
                  className={
                    "flex flex-col items-center gap-2 flex-shrink-0 group " +
                    (selectedFilter === char.id
                      ? "opacity-100"
                      : "opacity-70 hover:opacity-100")
                  }
                >
                  {/* Avatar - click to filter */}
                  <div
                    onClick={() =>
                      setSelectedFilter(
                        selectedFilter === char.id ? null : char.id,
                      )
                    }
                    className={
                      "w-16 h-16 rounded-full border-2 overflow-hidden bg-zinc-800 transition cursor-pointer " +
                      (selectedFilter === char.id
                        ? "border-blue-500 ring-2 ring-blue-500/50"
                        : "border-zinc-700 group-hover:border-blue-500")
                    }
                  >
                    {char.reference_image_url ? (
                      <img
                        src={char.reference_image_url}
                        alt={char.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        👤
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <span className="text-xs text-zinc-400 group-hover:text-white transition text-center max-w-[70px] truncate">
                    {char.name}
                  </span>

                  {/* Edit / Delete buttons */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => setEditingCharacter(char)}
                      className="p-1 rounded bg-blue-500/80 hover:bg-blue-500 transition"
                      title="Edit"
                    >
                      <Pencil className="w-3 h-3 text-white" />
                    </button>
                    <button
                      onClick={() => handleDeleteCharacter(char.id)}
                      className="p-1 rounded bg-red-500/80 hover:bg-red-500 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3 text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {poses.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <Sparkles className="w-16 h-16 mx-auto mb-6 text-blue-400 opacity-50" />
            <h2 className="text-3xl font-bold mb-4">No poses yet!</h2>
            <p className="text-zinc-400 mb-8">
              {characters.length === 0
                ? "Add a character first, then generate poses!"
                : "Click the sparkle button to generate your first AI pose!"}
            </p>
            {characters.length === 0 && (
              <button
                onClick={() => setShowAddCharacter(true)}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition"
              >
                Add Your First Character
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search poses by name, character, or genre..."
                  className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            {/* Genre Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setSelectedGenre(null)}
                className={
                  "px-4 py-2 rounded-lg text-sm font-medium transition " +
                  (!selectedGenre
                    ? "bg-blue-500 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700")
                }
              >
                All Genres
              </button>
              {[
                "action",
                "standing",
                "running",
                "combat",
                "stealth",
                "cinematic",
              ].map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={
                    "px-4 py-2 rounded-lg text-sm font-medium transition capitalize " +
                    (selectedGenre === genre
                      ? "bg-blue-500 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700")
                  }
                >
                  {genre}
                </button>
              ))}
            </div>

            {/* Filter indicator */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-zinc-400">
                {selectedFilter && selectedGenre
                  ? "Showing " +
                    selectedGenre +
                    " poses for: " +
                    selectedCharacterName
                  : selectedFilter
                    ? "Showing poses for: " + selectedCharacterName
                    : selectedGenre
                      ? "Showing all " + selectedGenre + " poses"
                      : "Showing all " + filteredPoses.length + " poses"}
              </p>
              {(selectedFilter || selectedGenre || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedFilter(null);
                    setSelectedGenre(null);
                    setSearchQuery("");
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 transition"
                >
                  Clear all filters ✕
                </button>
              )}
            </div>

            {/* Poses Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredPoses.map((pose) => (
                <div
                  key={pose.id}
                  className="group bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/20"
                >
                  {/* Image */}
                  <div
                    onClick={() => setViewingPose(pose)}
                    className="aspect-[3/4] bg-zinc-800 relative overflow-hidden cursor-pointer"
                  >
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
                        onClick={() => handleDeletePose(pose)}
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
          </>
        )}
      </div>

      {/* ── FLOATING BUTTON ─────────────────────────────── */}
      <button
        onClick={() => setShowGenerateModal(true)}
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

      {/* ── MODALS ──────────────────────────────────────── */}
      <GeneratePoseModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        characters={characters}
        onSuccess={loadData}
      />
      <AddCharacterModal
        isOpen={showAddCharacter}
        onClose={() => setShowAddCharacter(false)}
        onSuccess={loadData}
      />
      <EditCharacterModal
        isOpen={!!editingCharacter}
        character={editingCharacter}
        onClose={() => setEditingCharacter(null)}
        onSuccess={() => {
          loadData();
          setEditingCharacter(null);
        }}
      />
      <PoseDetailModal
        isOpen={!!viewingPose}
        pose={viewingPose}
        onClose={() => setViewingPose(null)}
        onDownload={handleDownload}
        onDelete={handleDeletePose}
      />
    </div>
  );
}
