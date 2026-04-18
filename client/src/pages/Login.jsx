import { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/pages.css';

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email || !password) return;

    const url = isSignup
      ? `${import.meta.env.BACKEND_URL}/api/auth/signup`
      : `${import.meta.env.BACKEND_URL}/api/auth/login`;

    const body = isSignup
      ? { name, email, password }
      : { email, password };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error);

    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.user.name);
    localStorage.setItem("userId", data.user.id);

    navigate("/");
  };

  return (
    <div className="page-center">
      <div className="card auth-card">
        <h2 className="title">{isSignup ? "Create Account" : "Welcome Back"}</h2>

        {isSignup && (
          <input
            className="input"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        <input
          className="input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="btn primary" onClick={handleSubmit}>
          {isSignup ? "Signup" : "Login"}
        </button>

        <p className="link" onClick={() => setIsSignup(!isSignup)}>
          {isSignup
            ? "Already have an account? Login"
            : "No account? Signup"}
        </p>
      </div>
    </div>
  );
};

export default Login;