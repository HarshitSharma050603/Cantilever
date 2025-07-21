import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const CategorySelection = () => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const navigate = useNavigate();

  const categories = [
    "Politics", "Business", "International", "Local", "National",
    "Crime", "Entertainment", "Lifestyle", "Sports",
    "Science and Technology", "Health"
  ];

  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const saveCategories = async () => {
    if (!selectedCategories.length) {
      toast.error("Please select at least one category.");
      return;
    }

    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      await setDoc(
        doc(db, "users", uid),
        { categories: selectedCategories },
        { merge: true }
      );

      navigate("/newsfeed");
    } catch (error) {
      console.error("Error saving categories:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (Array.isArray(data.categories) && data.categories.length > 0) {
          setSelectedCategories(data.categories);
          navigate("/newsfeed");
        }
      }
    };

    fetchCategories();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white px-4">
      <div className="max-w-3xl w-full p-8 rounded-2xl shadow-lg bg-gradient-to-b from-[#1e293b] to-[#0f172a]">
        <h2 className="text-3xl font-bold text-center mb-6 text-white">
          Select Your Interests
        </h2>

        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {categories.map((category) => {
            const selected = selectedCategories.includes(category);
            return (
              <motion.button
                key={category}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleCategory(category)}
                className={`px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 ${
                  selected
                    ? "bg-blue-500 text-white border-blue-600"
                    : "bg-transparent text-white border-white hover:bg-white hover:text-black"
                }`}
              >
                {category}
              </motion.button>
            );
          })}
        </div>

        <button
          onClick={saveCategories}
          className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition duration-200"
        >
          Save & Continue
        </button>
      </div>
    </div>
  );
};

export default CategorySelection;
