import React, { useState } from "react";
import "./auth.css"; // optional, if not using Tailwind

function AuthContainer() {
  const [isSignIn, setIsSignIn] = useState(true);

  return (
    <div className={`container ${isSignIn ? "" : "sign-up-mode"}`}>
      <div className="forms-container">
        <div className="signin-signup">
          {/* Sign In Form */}
          <form className="sign-in-form">
            <h2 className="title">Sign in</h2>
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <button>Sign In</button>
          </form>

          {/* Sign Up Form */}
          <form className="sign-up-form">
            <h2 className="title">Sign up</h2>
            <input type="text" placeholder="Name" />
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <button>Sign Up</button>
          </form>
        </div>
      </div>

      <div className="panels-container">
        <div className="panel left-panel">
          <div className="content">
            <h3>New here?</h3>
            <p>Click below to create your account</p>
            <button className="ghost" onClick={() => setIsSignIn(false)}>Sign Up</button>
          </div>
        </div>
        <div className="panel right-panel">
          <div className="content">
            <h3>Already a member?</h3>
            <p>Click below to log into your account</p>
            <button className="ghost" onClick={() => setIsSignIn(true)}>Sign In</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthContainer;
