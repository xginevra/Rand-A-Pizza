import { NavLink } from "react-router-dom";
import "../App.css";

function NavBar() {
  return (
    <header>
      <div className="navbar">
        <NavLink to="/">
          <img className="navbar-logo" src="/logo.png" alt="Rand-A-Pizza" />
        </NavLink>
      </div>
    </header>
  );
}

export default NavBar;
