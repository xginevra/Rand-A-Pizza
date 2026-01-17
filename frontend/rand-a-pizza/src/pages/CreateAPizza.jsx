import React from "react";
import '../App.css';
import NavBar from "../components/NavBar";
import CreatePizza from "../components/CreatePizza";

const CreateAPizza = () => {
    return (
        <div>
            <NavBar />
            <CreatePizza />
        </div>
    )
}

export default CreateAPizza;