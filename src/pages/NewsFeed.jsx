import React, { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import "../App.css";

export default function NewsFeed() {
  const navigate = useNavigate();

  // Preferences & filter state
  const [userCategories, setUserCategories] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Articles, loading, search
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputFocused, setInputFocused] = useState(false);

  // Sort order: "newest" or "oldest"
  const [sortOrder, setSortOrder] = useState("newest");

  const categories = [
    "All", "Politics", "Business", "International", "Local",
    "National", "Crime", "Entertainment", "Lifestyle",
    "Sports", "Science and Technology", "Health",
  ];

  // Logout
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  // Load user categories once
  useEffect(() => {
    async function fetchPrefs() {
      const user = auth.currentUser;
      if (!user) return;
      const snap = await getDoc(doc(db, "users", user.uid));
      setUserCategories(snap.exists() ? snap.data().categories || [] : []);
    }
    fetchPrefs();
  }, []);

  // Fetch articles on dependency changes
  useEffect(() => {
    if (userCategories === null) return; // still loading prefs

    async function fetchNews() {
      setLoading(true);
      const KEY = "8699fa974d3b462e85790d0a68bf2c84";
      let combined = [];

      if (searchQuery.trim()) {
        // Search overrides all (free plan: top-headlines with q=)
        const res = await fetch(
          `https://newsapi.org/v2/top-headlines?country=in&q=${encodeURIComponent(
            searchQuery
          )}&pageSize=20&apiKey=${KEY}`
        );
        combined = (await res.json()).articles || [];
      } else if (selectedCategory === "All") {
        // Mix or top-headlines
        if (!userCategories.length) {
          const res = await fetch(
            `https://newsapi.org/v2/top-headlines?country=in&pageSize=20&apiKey=${KEY}`
          );
          combined = (await res.json()).articles || [];
        } else {
          const results = await Promise.all(
            userCategories.map(async (cat) => {
              const r = await fetch(
                `https://newsapi.org/v2/top-headlines?country=in&q=${encodeURIComponent(
                  cat
                )}&pageSize=10&apiKey=${KEY}`
              );
              return (await r.json()).articles || [];
            })
          );
          combined = results.flat();
        }
      } else {
        // Single category (free plan: top-headlines with q=)
        const res = await fetch(
          `https://newsapi.org/v2/top-headlines?country=in&q=${encodeURIComponent(
            selectedCategory
          )}&pageSize=20&apiKey=${KEY}`
        );
        combined = (await res.json()).articles || [];
      }

      // Dedupe and sort
      const unique = Array.from(
        new Map(combined.map((a) => [a.url, a])).values()
      ).sort((a, b) => {
        const da = new Date(a.publishedAt);
        const db = new Date(b.publishedAt);
        return sortOrder === "newest" ? db - da : da - db;
      });

      setArticles(unique);
      setLoading(false);
    }

    fetchNews();
  }, [searchQuery, selectedCategory, userCategories, sortOrder]);

  return (
    <div className="min-h-screen px-6 py-8 relative bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white">
      {/* Logout / Date / Quote / Sort */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div>
          <div className="text-white text-lg font-medium">
            {new Date().toLocaleDateString("en-GB", {
              weekday: "short", day: "2-digit", month: "short", year: "numeric",
            })}
          </div>
          {/* — Improved segmented sort control — */}
          <div className="mt-2 inline-flex rounded-full bg-gray-800">
            {["newest", "oldest"].map((opt) => (
              <button
                key={opt}
                onClick={() => setSortOrder(opt)}
                className={`px-4 py-1 text-sm font-medium transition ${
                  sortOrder === opt
                    ? "bg-blue-600 text-white rounded-full"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {opt === "newest" ? "Newest First" : "Oldest First"}
              </button>
            ))}
          </div>
        </div>
        <div className="italic text-sm font-semibold text-white font-serif">
          "A good newspaper is a nation talking to itself"
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      {/* Heading + Search */}
      <div className="relative flex items-center justify-between pt-4 mb-2">
        <h1 className="heading-logo text-5xl md:text-7xl font-bold text-center mx-auto">
          The Optimist Daily
        </h1>
        <motion.input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search headlines..."
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          animate={{ width: inputFocused ? "180px" : "130px" }}
          transition={{ duration: 0.3 }}
          className="text-black px-3 py-1 rounded-md focus:outline-none border border-gray-300 absolute right-0"
        />
      </div>
      <hr className="border-t border-white/30 w-full mb-4" />

      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-4 mt-2 mb-2">
        {categories.map((cat) => {
          const active = selectedCategory === cat;
          return (
            <motion.span
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`cursor-pointer font-serif text-lg ${
                active
                  ? "text-blue-400 underline drop-shadow glow"
                  : "text-white hover:text-blue-400"
              }`}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
            >
              {cat}
              <AnimatePresence>
                {active && (
                  <motion.div
                    className="absolute -top-2 -right-2 w-2 h-2 bg-blue-400 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </AnimatePresence>
            </motion.span>
          );
        })}
      </div>
      <hr className="border-t border-white/30 w-full mb-8" />

      {/* News Cards */}
      {loading ? (
        <p className="text-center text-lg">Loading articles...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((a, i) => (
            <div key={i} className="news-card">
              <h2 className="text-xl font-bold mb-2">{a.title}</h2>
              {a.urlToImage && (
                <img
                  src={a.urlToImage}
                  alt=""
                  className="w-full h-48 object-cover rounded-md mb-3"
                />
              )}
              <p className="text-sm mb-4">{a.description || "No description."}</p>
              <a
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline"
              >
                Read more
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
