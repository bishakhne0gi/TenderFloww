import React, { useState } from "react";
import "./admin.css";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/logo (2).png";
import { BsFillArrowLeftSquareFill } from "react-icons/bs";
import { Modal, Tender } from "../../components";
import axios from "axios";
import useSWR from "swr";

const Admin = () => {
  const navigate = useNavigate();

  const goTo__Projects = () => {
    navigate("/projects");
  };

  const goTo__landing = () => {
    navigate("/");
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [tendersData, setTendersData] = useState();

  const fetcher = (url) =>
    axios
      .get(url)
      .then((res) => setTendersData(res.data?.message))
      .catch((e) => console.log(e.response))
      .finally(() => console.log(tendersData));

  // Fetch tender id
  const { data, error } = useSWR(
    "http://localhost:5000/tender/display",
    fetcher
  );
  if (error) {
    console.log(error.response?.data);
  }

  return (
    <>
      <div className="admin__wrap">
        {modalOpen && <Modal setOpenModal={setModalOpen} />}

        <div className="logo__container ">
          <BsFillArrowLeftSquareFill
            className="back"
            onClick={goTo__Projects}
          />
          <img className="logo" src={Logo} onClick={goTo__landing} />
        </div>

        <div className="admin_overlay section__padding section__margin">
          <div className="admin_btns">
            <div className="admin_text_button">
              <button className="admin__tender">Tender List</button>
            </div>

            <div className="admin_text_button">
              <button
                className="admin__get_started"
                onClick={() => {
                  setModalOpen(true);
                  console.log("ok");
                }}
              >
                Create Tender
              </button>
            </div>
          </div>

          <div className="admin__body section__margin">
            {tendersData ? (
              tendersData?.map((tender, key) => {
                return (
                  <>
                    <Tender data={tender} key={key} />
                  </>
                );
              })
            ) : (
              <>
                <h2>No Tender Found</h2>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Admin;
