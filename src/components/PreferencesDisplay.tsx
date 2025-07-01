import { useState, useEffect } from "react";
import { Agent, type BskyPreferences } from "@atproto/api";
import type { OAuthSession } from "@atproto/oauth-client-browser";
import { TID } from "@atproto/common-web";

interface PreferencesDisplayProps {
  session: OAuthSession;
}

export default function PreferencesDisplay({
  session,
}: PreferencesDisplayProps) {
  const [preferences, setPreferences] = useState<BskyPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fixing, setFixing] = useState(false);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!session) return;

      try {
        const agent = new Agent(session);

        const response = await agent.getPreferences();
        setPreferences(response);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch preferences",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [session]);

  const exportPreferences = () => {
    if (!preferences) return;

    const dataStr = JSON.stringify(preferences, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "bluesky-preferences.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const hasUuidFeeds = () => {
    if (!preferences?.savedFeeds) return false;
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return preferences.savedFeeds.some((feed) => uuidRegex.test(feed.id));
  };

  const fixSavedFeeds = async () => {
    if (!preferences || !preferences.savedFeeds) return;

    setFixing(true);
    setError(null);

    try {
      const agent = new Agent(session);
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      const fixedFeeds = preferences.savedFeeds.map((feed) => {
        if (uuidRegex.test(feed.id)) {
          return { ...feed, id: TID.nextStr() };
        }
        return feed;
      });

      await agent.overwriteSavedFeeds(fixedFeeds);

      const response = await agent.getPreferences();
      setPreferences(response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fix saved feeds",
      );
    } finally {
      setFixing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading preferences...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-red-800 font-semibold">Error</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Preferences</h2>
        <div className="flex gap-2">
          {hasUuidFeeds() && (
            <button
              onClick={fixSavedFeeds}
              disabled={fixing}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {fixing ? "Fixing..." : "Fix Saved Feeds"}
            </button>
          )}
          <button
            onClick={exportPreferences}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Export JSON
          </button>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-300 rounded-lg overflow-hidden">
        <pre className="p-4 text-sm overflow-x-auto max-h-[calc(100vh-16rem)] overflow-y-auto">
          <code>{JSON.stringify(preferences, null, 2)}</code>
        </pre>
      </div>
    </div>
  );
}
