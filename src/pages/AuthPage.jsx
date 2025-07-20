import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../firebase";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [signInForm, setSignInForm] = useState({ email: "", password: "" });
  const [signUpForm, setSignUpForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const toggleMode = () => {
    setError("");
    setIsSignUp(!isSignUp);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (isSignUp) {
      setSignUpForm((prev) => ({ ...prev, [name]: value }));
    } else {
      setSignInForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const { email, password } = isSignUp ? signUpForm : signInForm;

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success("Sign up successful!");
        navigate("/");                // ← send to root, App.jsx will forward to category-selection
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Signed in successfully!");
        navigate("/newsfeed");
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  const handleResetPassword = async () => {
    const email = signInForm.email;     // ← correct field
    if (!email) {
      toast.error("Please enter your email first.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset link sent to your email.");
    } catch (err) {
      toast.error("Failed to send reset email.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="relative w-[900px] h-[550px] rounded-3xl shadow-2xl overflow-hidden bg-white">
        {/* Sliding Panel */}
        <motion.div
          className="absolute w-1/2 h-full top-0 z-10 bg-gradient-to-tr from-pink-500 to-red-500 text-white flex flex-col items-center justify-center px-10 text-center"
          animate={{ x: isSignUp ? "0%" : "100%" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <h2 className="text-3xl font-bold mb-4">
            {isSignUp ? "Welcome Back!" : "Hello, Friend!"}
          </h2>
          <p className="mb-6">
            {isSignUp
              ? "To keep connected with us, please login with your personal info"
              : "Enter your personal details and start your journey with us"}
          </p>
          <button
            onClick={toggleMode}
            className="border border-white px-6 py-2 rounded-full hover:bg-white hover:text-pink-600 transition"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </motion.div>

        {/* Forms */}
        <div className="absolute top-0 left-0 w-full h-full flex">
          {/* Sign In */}
          <div
            className={`w-1/2 h-full flex flex-col justify-center items-center px-12 transition-opacity duration-500 ${
              isSignUp ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            <h2 className="text-3xl font-bold mb-6 text-black">Sign In</h2>
            {error && <p className="text-red-500 mb-2">{error}</p>}
            <form onSubmit={handleSubmit} className="w-full">
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={signInForm.email}
                onChange={handleChange}
                className="mb-3 w-full px-4 py-2 border rounded-lg focus:outline-none text-black"
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={signInForm.password}
                onChange={handleChange}
                className="mb-1 w-full px-4 py-2 border rounded-lg focus:outline-none text-black"
              />
              <button
                type="button"
                onClick={handleResetPassword}
                className="text-sm text-blue-600 hover:underline mb-3 w-full text-left"
              >
                Forgot password?
              </button>
              <button
                type="submit"
                className="bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600 transition"
              >
                Sign In
              </button>
            </form>
          </div>

          {/* Sign Up */}
          <div
            className={`w-1/2 h-full flex flex-col justify-center items-center px-12 transition-opacity duration-500 ${
              isSignUp ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <h2 className="text-3xl font-bold mb-6 text-black">Create Account</h2>
            {error && <p className="text-red-500 mb-2">{error}</p>}
            <form onSubmit={handleSubmit} className="w-full">
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={signUpForm.email}
                onChange={handleChange}
                className="mb-3 w-full px-4 py-2 border rounded-lg focus:outline-none text-black"
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={signUpForm.password}
                onChange={handleChange}
                className="mb-3 w-full px-4 py-2 border rounded-lg focus:outline-none text-black"
              />
              <button
                type="submit"
                className="bg-pink-600 text-white px-6 py-2 rounded-full hover:bg-pink-700 transition"
              >
                Sign Up
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
