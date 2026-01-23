import { NavLink } from "react-router-dom";
import "../App.css";

function NavBar({children}) {
  return (
    <header>
      <div className="navbar">
        <NavLink to="/">
          <img className="navbar-logo" src="/logo.png" alt="Rand-A-Pizza" />
        </NavLink>
        {children}
      </div>
    </header>
  );
}

export default NavBar;
