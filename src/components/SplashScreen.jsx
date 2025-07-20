// src/components/SplashScreen.jsx
import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen() {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-white flex items-center justify-center"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.img
          src="/logo/logo.png" // ✅ Replace with your logo path
          alt="The Optimist Daily"
          className="w-64 h-64"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
