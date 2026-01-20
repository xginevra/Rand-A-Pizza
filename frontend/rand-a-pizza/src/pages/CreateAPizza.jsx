import "../App.css";
import CreatePizza from "../components/CreatePizza";
import NavBar from "../components/NavBar";

const CreateAPizza = () => {
  return (
    <>
      <NavBar />
      <div className="page-heading">
        <h1 className="page-title">Pizza assembly station</h1>
        <h4 className="page-title">
          Create your perfect pizza with the available ingredients, or use "Surprise Me!" to get a random pizza generated for you.
        </h4>
      </div>
      <CreatePizza />
    </>
  );
};

export default CreateAPizza;
