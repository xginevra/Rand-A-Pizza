import "../App.css";
import CreatePizza from "../components/CreatePizza";
import NavBar from "../components/NavBar";

const CreateAPizza = () => {
  return (
    <div>
      <NavBar />
      <div className="page-heading">
        <h1 className="page-title">Pizza assembly station</h1>
        <h4 className="page-title">
          ... Create your perfect pizza with the available ingredients ...
        </h4>
      </div>
      <CreatePizza />
    </div>
  );
};

export default CreateAPizza;
