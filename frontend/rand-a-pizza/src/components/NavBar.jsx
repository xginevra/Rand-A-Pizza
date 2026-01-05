import React from "react";
import "../App.css";
import {Link} from "react-router-dom";

function NavBar() {
    return (
        <header>
            <div className="navbar">
            <img className="navbar-logo" src="/logo.png" alt="Rand-A-Pizza" />
            </div>
        </header>
    )
}

export default NavBar;