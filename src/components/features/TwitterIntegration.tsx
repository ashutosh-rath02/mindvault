/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Twitter, Link, Unlink, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../stores/authStore";

interface TwitterMapping {
  linked: boolean;
  twitter_username?: string;
  created_at?: string;
}

export const TwitterIntegration: React.FC = () => {
  const { user } = useAuthStore();
  const [twitterMapping, setTwitterMapping] = useState<TwitterMapping | null>(
    null
  );
  const [twitterUsername, setTwitterUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (user) {
      loadTwitterMapping();
    }
  }, [user]);

  const loadTwitterMapping = async () => {
    try {
      const { data, error } = await supabase.rpc("get_twitter_mapping");

      if (error) {
        console.error("Error loading Twitter mapping:", error);
        return;
      }

      setTwitterMapping(data);
    } catch (error) {
      console.error("Error loading Twitter mapping:", error);
    }
  };

  const linkTwitterAccount = async () => {
    if (!twitterUsername.trim()) {
      setMessage({ type: "error", text: "Please enter your Twitter username" });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.rpc("link_twitter_username", {
        twitter_username_param: twitterUsername.trim().replace("@", ""),
      });

      if (error) {
        throw error;
      }

      setMessage({
        type: "success",
        text: "Twitter account linked successfully!",
      });
      setTwitterUsername("");
      await loadTwitterMapping();
    } catch (error: any) {
      console.error("Error linking Twitter account:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to link Twitter account",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const unlinkTwitterAccount = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.rpc("unlink_twitter_username");

      if (error) {
        throw error;
      }

      setMessage({
        type: "success",
        text: "Twitter account unlinked successfully!",
      });
      await loadTwitterMapping();
    } catch (error: any) {
      console.error("Error unlinking Twitter account:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to unlink Twitter account",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Twitter className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Twitter Integration
          </h3>
          <p className="text-sm text-gray-600">
            Link your Twitter account to save tweets directly to MindVault
          </p>
        </div>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-4 p-3 rounded-lg flex items-center space-x-2 ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">{message.text}</span>
        </motion.div>
      )}

      {twitterMapping?.linked ? (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Twitter account linked
                </p>
                <p className="text-sm text-green-700">
                  @{twitterMapping.twitter_username}
                </p>
                {twitterMapping.created_at && (
                  <p className="text-xs text-green-600 mt-1">
                    Linked on{" "}
                    {new Date(twitterMapping.created_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              How to save tweets:
            </h4>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Find a tweet you want to save</li>
              <li>
                2. Reply to the tweet with:{" "}
                <code className="bg-blue-100 px-1 rounded">
                  @mindvault save your description
                </code>
              </li>
              <li>
                3. The tweet will be automatically saved to your MindVault notes
              </li>
            </ol>
          </div>

          <button
            onClick={unlinkTwitterAccount}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Unlink className="w-4 h-4" />
            <span>Unlink Twitter Account</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Twitter account not linked
                </p>
                <p className="text-sm text-yellow-700">
                  Link your Twitter account to start saving tweets to MindVault
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label
                htmlFor="twitter-username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Twitter Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">@</span>
                </div>
                <input
                  type="text"
                  id="twitter-username"
                  value={twitterUsername}
                  onChange={(e) => setTwitterUsername(e.target.value)}
                  placeholder="yourusername"
                  className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              onClick={linkTwitterAccount}
              disabled={isLoading || !twitterUsername.trim()}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Link className="w-4 h-4" />
              <span>{isLoading ? "Linking..." : "Link Twitter Account"}</span>
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-800 mb-2">
              What happens when you link your account:
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• You can save tweets by replying with @mindvault save</li>
              <li>• Tweets are saved with clean formatting</li>
              <li>• Basic categorization and tagging for organization</li>
              <li>• All saved tweets appear in your MindVault notes</li>
            </ul>
          </div>
        </div>
      )}
    </motion.div>
  );
};
