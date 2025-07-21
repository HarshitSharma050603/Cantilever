// src/pages/NewsFeed.jsx
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

  const allCategories = [
    "All","Politics","Business","International","Local",
    "National","Crime","Entertainment","Lifestyle",
    "Sports","Science and Technology","Health"
  ];

  // Logout
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  // Load user prefs once
  useEffect(() => {
    async function fetchPrefs() {
      const user = auth.currentUser;
      if (!user) return;
      const snap = await getDoc(doc(db, "users", user.uid));
      setUserCategories(snap.exists() ? snap.data().categories || [] : []);
    }
    fetchPrefs();
  }, []);

  // Fetch news whenever something changes
  useEffect(() => {
    if (userCategories === null) return; // still loading prefs

    async function fetchNews() {
      setLoading(true);

      const MEDIA_KEY  = "ca609bc8967093386efa315d401cd64c";
      const GNEWS_KEY  = "22411af37ff531003f4bc2688eca166a";
      const NEWS_KEY   = "K1BeehjYsuU10s8j1LhkKh40J-HdQIkR5IalzUls0vhjv4Dv";
      let combined = [];

      // build a shared 'q' param
      let q = "";
      if (searchQuery.trim())             q = encodeURIComponent(searchQuery);
      else if (selectedCategory === "All" && userCategories.length)
                                         q = encodeURIComponent(userCategories.join(" OR "));
      else if (selectedCategory !== "All") q = encodeURIComponent(selectedCategory);

      // 1) MediaStack (HTTPS)
      const msUrl = new URL("https://api.mediastack.com/v1/news");
      msUrl.searchParams.set("access_key", MEDIA_KEY);
      msUrl.searchParams.set("countries", "in");
      msUrl.searchParams.set("limit", "20");
      if (q) msUrl.searchParams.set("keywords", q);

      // 2) GNews: SEARCH vs HEADLINES
      let gnUrl;
      if (q) {
        gnUrl = new URL("https://gnews.io/api/v4/search");
        gnUrl.searchParams.set("q", q);
      } else {
        gnUrl = new URL("https://gnews.io/api/v4/top-headlines");
        gnUrl.searchParams.set("country", "in");
      }
      gnUrl.searchParams.set("token", GNEWS_KEY);
      gnUrl.searchParams.set("lang", "en");
      gnUrl.searchParams.set("max", "20");

      // 3) NewsAPI.org (everything)
      const naUrl = new URL("https://newsapi.org/v2/everything");
      naUrl.searchParams.set("apiKey", NEWS_KEY);
      naUrl.searchParams.set("pageSize", "20");
      naUrl.searchParams.set("language", "en");
      if (q) naUrl.searchParams.set("q", q);
      else  naUrl.searchParams.set("q", "latest");

      try {
        const [msResp, gnResp, naResp] = await Promise.all([
          fetch(msUrl.toString()),
          fetch(gnUrl.toString()),
          fetch(naUrl.toString()),
        ]);

        // MediaStack
        if (!msResp.ok) console.warn("MediaStack skipped:", msResp.status);
        else {
          const j = await msResp.json();
          combined.push(...(j.data || []));
        }

        // GNews
        if (!gnResp.ok) console.warn("GNews skipped:", gnResp.status);
        else {
          const j = await gnResp.json();
          combined.push(...(j.articles || []));
        }

        // NewsAPI.org
        if (!naResp.ok) console.warn("NewsAPI skipped:", naResp.status);
        else {
          const j = await naResp.json();
          combined.push(...(j.articles || []));
        }

        // unify shape
        combined = combined.map(item => ({
          title:       item.title,
          description: item.description,
          url:         item.url,
          urlToImage:  item.urlToImage || item.image || item.urlToImage || null,
          publishedAt: item.published_at || item.publishedAt || item.publishedAt || null,
        }));
      } catch (err) {
        console.error("Combined fetch error:", err);
      }

      // dedupe & sort
      const unique = Array.from(
        new Map(combined.map(a => [a.url, a])).values()
      ).sort((a, b) => {
        const da = new Date(a.publishedAt), db_ = new Date(b.publishedAt);
        return sortOrder === "newest" ? db_ - da : da - db_;
      });

      setArticles(unique);
      setLoading(false);
    }

    fetchNews();
  }, [searchQuery, selectedCategory, userCategories, sortOrder]);

  return (
    <div className="min-h-screen px-6 py-8 relative bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white">
      {/* Logout / Date / Sort */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div>
          <div className="text-lg font-medium">
            {new Date().toLocaleDateString("en-GB", {
              weekday:"short", day:"2-digit", month:"short", year:"numeric"
            })}
          </div>
          <div className="mt-2 inline-flex rounded-full bg-gray-800">
            {["newest","oldest"].map(opt => (
              <button
                key={opt}
                onClick={() => setSortOrder(opt)}
                className={`px-4 py-1 text-sm font-medium transition ${
                  sortOrder===opt
                    ? "bg-blue-600 text-white rounded-full"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {opt==="newest"? "Newest" : "Oldest"}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      {/* Heading & Search */}
      <div className="relative flex items-center justify-between pt-4 mb-2">
        <h1 className="heading-logo text-5xl md:text-7xl font-bold mx-auto">
          The Optimist Daily
        </h1>
        <motion.input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search headlines…"
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          animate={{ width: inputFocused ? "180px" : "130px" }}
          transition={{ duration: 0.3 }}
          className="absolute right-0 border border-gray-300 rounded-md px-3 py-1 text-black focus:outline-none"
        />
      </div>
      <hr className="border-t border-white/30 w-full mb-4" />

      {/* Categories */}
      <AnimatePresence>
        <div className="flex flex-wrap justify-center gap-4 mt-2 mb-2">
          {allCategories.map(cat => {
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
                {active && (
                  <motion.div
                    className="absolute -top-2 -right-2 w-2 h-2 bg-blue-400 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.span>
            );
          })}
        </div>
      </AnimatePresence>
      <hr className="border-t border-white/30 w-full mb-8" />

      {/* News Cards */}
      {loading ? (
        <p className="text-center text-lg">Loading…</p>
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
