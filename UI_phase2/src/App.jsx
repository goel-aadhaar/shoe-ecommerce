import { useRef } from "react";
import "./App.css";
import { Shoe_Card } from "./component";
import Shoe_Modal from "./component";

function App() {
  const modalRef = useRef();
  let shoe_detail = {
    shoe_name: "Zordan",
    shoe_price: "$190",
    shoe_src : "https://www.superkicks.in/cdn/shop/files/1_23_63d4bcad-2f4f-4dff-8606-1b9687a04aa5.png?v=1754314154"
  };

  return (
    <>
      <button onClick={() => modalRef.current?.openModal()}>
        Hello bro open the Modal
      </button>
      <Shoe_Card />
      <Shoe_Modal {...shoe_detail} ref={modalRef} />
    </>
  );
}

export default App;
