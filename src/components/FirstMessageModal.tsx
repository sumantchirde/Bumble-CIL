import { useEffect, useState } from "react";
import { X, Sparkles, Copy, Check, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "../types";
import { InitiatorProfile } from "../utils/profiles";

interface Suggestion {
  tone: "playful" | "curious" | "confident";
  message: string;
  reasoning: string;
}

interface FirstMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Profile;
  initiator: InitiatorProfile;
}

const TONE_STYLES: Record<Suggestion["tone"], { label: string; bg: string; text: string }> = {
  playful: { label: "Playful", bg: "bg-pink-100", text: "text-pink-700" },
  curious: { label: "Curious", bg: "bg-blue-100", text: "text-blue-700" },
  confident: { label: "Confident", bg: "bg-bumble-light", text: "text-bumble-dark" },
};

export default function FirstMessageModal({
  isOpen,
  onClose,
  candidate,
  initiator,
}: FirstMessageModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Compute shared interests by case-insensitive overlap
  const sharedInterests = initiator.interests.filter((i) =>
    candidate.interests.some((ci) => ci.toLowerCase() === i.toLowerCase())
  );

  const fetchSuggestions = async () => {
    setLoading(true);
    setError(null);
    setCopiedIndex(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "suggest-first-message",
        {
          body: {
            initiator: {
              name: initiator.name,
              age: initiator.age,
              interests: (initiator as InitiatorProfile & { interests?: string[] }).interests ?? [],
            },
            candidate: {
              name: candidate.name,
              age: candidate.age,
              bio: candidate.bio,
              interests: candidate.interests,
            },
            sharedInterests,
          },
        }
      );

      if (fnError) {
        // Surface friendly messages for known statuses
        const msg = fnError.message || "Failed to generate suggestions";
        setError(msg);
        return;
      }
      if (data?.error) {
        setError(data.error);
        return;
      }
      setSuggestions(data?.suggestions ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && suggestions.length === 0 && !loading) {
      fetchSuggestions();
    }
    if (!isOpen) {
      // Reset on close so a new candidate triggers fresh fetch
      setSuggestions([]);
      setError(null);
      setCopiedIndex(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, candidate.id, initiator.id]);

  const handleCopy = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex((c) => (c === idx ? null : c)), 1800);
    } catch {
      // ignore
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-bumble-gold flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-bumble-dark" />
            </div>
            <div>
              <h3 className="text-base font-black text-bumble-dark leading-tight">
                AI First Message
              </h3>
              <p className="text-[11px] text-gray-500 font-semibold">
                Openers tailored to {candidate.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-bumble-dark" />
          </button>
        </div>

        {/* Context strip */}
        <div className="px-5 pt-3 pb-2">
          <div className="flex flex-wrap gap-1.5">
            {sharedInterests.length > 0 ? (
              sharedInterests.map((s) => (
                <span
                  key={s}
                  className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-bumble-light text-bumble-dark"
                >
                  ★ {s}
                </span>
              ))
            ) : (
              <span className="text-[11px] text-gray-500 italic">
                No shared interests — using his profile to inspire openers
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-3 overflow-y-auto flex-1">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 text-bumble-dark">
              <Loader2 className="w-8 h-8 animate-spin text-bumble-gold mb-3" />
              <p className="text-sm font-bold">Crafting openers…</p>
            </div>
          )}

          {!loading && error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
              <p className="font-bold mb-1">Couldn't generate suggestions</p>
              <p className="text-xs">{error}</p>
            </div>
          )}

          {!loading && !error && suggestions.length > 0 && (
            <div className="space-y-3">
              {suggestions.map((s, idx) => {
                const tone = TONE_STYLES[s.tone] ?? TONE_STYLES.curious;
                const copied = copiedIndex === idx;
                return (
                  <div
                    key={idx}
                    className="border border-gray-100 rounded-2xl p-4 bg-white shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full ${tone.bg} ${tone.text}`}
                      >
                        {tone.label}
                      </span>
                      <button
                        onClick={() => handleCopy(s.message, idx)}
                        className="flex items-center gap-1 text-[11px] font-bold text-bumble-dark hover:text-bumble-gold transition-colors"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> Copy
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-sm text-bumble-dark leading-relaxed font-semibold">
                      {s.message}
                    </p>
                    {s.reasoning && (
                      <p className="text-[11px] text-gray-500 mt-2 italic">
                        Why: {s.reasoning}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-2">
          <p className="text-[10px] text-gray-400">
            Powered by Lovable AI · GPT-class openers
          </p>
          <button
            onClick={fetchSuggestions}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-bumble-gold hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed text-bumble-dark text-xs font-black"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Regenerate
          </button>
        </div>
      </div>
    </div>
  );
}
