import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import NewsFeed from "./pages/NewsFeed";
import CategorySelection from "./pages/CategorySelection";
import SplashScreen from "./components/SplashScreen";
import { Toaster } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";

function AnimatedRoutes({ user, categorySelected }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageWrapper>
              {user
                ? categorySelected
                  ? <Navigate to="/newsfeed" />
                  : <Navigate to="/category-selection" />
                : <AuthPage />}
            </PageWrapper>
          }
        />

        <Route
          path="/newsfeed"
          element={
            <PageWrapper>
              {user ? <NewsFeed /> : <Navigate to="/" />}
            </PageWrapper>
          }
        />

        <Route
          path="/category-selection"
          element={
            <PageWrapper>
              {user ? <CategorySelection /> : <Navigate to="/" />}
            </PageWrapper>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [categorySelected, setCategorySelected] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const splashTimeout = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setCategorySelected(
            Array.isArray(data.categories) && data.categories.length > 0
          );
        } else {
          setCategorySelected(false);
        }
      }

      setAuthChecked(true);
    });

    return () => {
      unsubscribe();
      clearTimeout(splashTimeout);
    };
  }, []);

  if (showSplash || !authChecked) {
    return <SplashScreen />;
  }

  return (
    <Router>
      <AnimatedRoutes user={user} categorySelected={categorySelected} />
      <Toaster position="top-center" reverseOrder={false} />
    </Router>
  );
}

export default App;
