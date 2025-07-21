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

  const [userCategories, setUserCategories] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [sortOrder, setSortOrder] = useState("newest");

  const allCategories = [
    "All", "Politics", "Business", "International", "Local",
    "National", "Crime", "Entertainment", "Lifestyle",
    "Sports", "Science and Technology", "Health"
  ];

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  useEffect(() => {
    async function fetchPrefs() {
      const user = auth.currentUser;
      if (!user) return;
      const snap = await getDoc(doc(db, "users", user.uid));
      setUserCategories(snap.exists() ? snap.data().categories || [] : []);
    }
    fetchPrefs();
  }, []);

  useEffect(() => {
    if (userCategories === null) return;

    async function fetchNews() {
      setLoading(true);

      const MEDIA_KEY  = "ca609bc8967093386efa315d401cd64c";
      const GNEWS_KEY  = "22411af37ff531003f4bc2688eca166a";
      const NEWS_KEY   = "K1BeehjYsuU10s8j1LhkKh40J-HdQIkR5IalzUls0vhjv4Dv";
      const NYT_KEY    = "vYgYMzAcsVGROeOrtq7RcmMruNVKXtqs";
      let combined = [];

      let q = "";
      if (searchQuery.trim())             q = encodeURIComponent(searchQuery);
      else if (selectedCategory === "All" && userCategories.length)
                                         q = encodeURIComponent(userCategories.join(" OR "));
      else if (selectedCategory !== "All") q = encodeURIComponent(selectedCategory);

      const msUrl = new URL("https://api.mediastack.com/v1/news");
      msUrl.searchParams.set("access_key", MEDIA_KEY);
      msUrl.searchParams.set("countries", "in");
      msUrl.searchParams.set("limit", "20");
      if (q) msUrl.searchParams.set("keywords", q);

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

      const naUrl = new URL("https://newsapi.org/v2/everything");
      naUrl.searchParams.set("apiKey", NEWS_KEY);
      naUrl.searchParams.set("pageSize", "20");
      naUrl.searchParams.set("language", "en");
      if (q) naUrl.searchParams.set("q", q);
      else  naUrl.searchParams.set("q", "latest");

      const nytUrl = new URL("https://api.nytimes.com/svc/search/v2/articlesearch.json");
      nytUrl.searchParams.set("api-key", NYT_KEY);
      if (q) nytUrl.searchParams.set("q", q);
      else nytUrl.searchParams.set("fq", "news_desk:(\"Top News\")");

      try {
        const [msResp, gnResp, naResp, nytResp] = await Promise.all([
          fetch(msUrl.toString()),
          fetch(gnUrl.toString()),
          fetch(naUrl.toString()),
          fetch(nytUrl.toString()),
        ]);

        if (msResp.ok) {
          const j = await msResp.json();
          combined.push(...(j.data || []));
        }

        if (gnResp.ok) {
          const j = await gnResp.json();
          combined.push(...(j.articles || []));
        }

     if (nytResp.ok) {
  const j = await nytResp.json();
  combined.push(
    ...(j.response?.docs || []).map(doc => {
      const baseUrl = "https://www.nytimes.com/";
      const multimedia = doc.multimedia?.[0]?.url
        ? baseUrl + doc.multimedia[0].url
        : null;
      return {
        title: doc.headline.main,
        description: doc.abstract,
        url: doc.web_url,
        urlToImage: multimedia,
        publishedAt: doc.pub_date,
      };
    })
  );
}

      } catch (err) {
        console.error("Combined fetch error:", err);
      }

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
