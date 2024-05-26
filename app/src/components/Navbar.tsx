import { Link } from "react-router-dom";
import { ModeToggle } from "./ModeToggle";

export default function Navbar() {
  return (
    <header className="max-w-screen-2xl p-10">
      <div className="flex-between">
        <Link to="/">
          <h1> Workout Buddy</h1>
        </Link>
        <ModeToggle />
        <Link to="/auth/login">Login</Link>
      </div>
    </header>
  );
}
