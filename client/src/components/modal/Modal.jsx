import React, { useState } from "react";
import "./modal.css";
import axios from "axios";
import useSWR from "swr";

const Modal = ({ setOpenModal }) => {
  const [tenderState, setTenderState] = useState({
    name: "",
    tender_id: "",
    description: "",
    criteria: "",
    opening_date: "",
    closing_date: "",
  });

  const handleValueChange = (fieldName, value) => {
    setTenderState((tenderState) => ({
      ...tenderState,
      [fieldName]: value,
    }));
  };

  const axiosConfig = {
    headers: {
      "Content-type": "application/json",
    },
  };

  const fetcher = (url) =>
    axios
      .get("http://localhost:5000/tender/id")
      .then((res) => handleValueChange("tender_id", res.data.message));

  // Fetch tender id
  const { data, error } = useSWR(
    tenderState.tender_id ? "http://localhost:5000/tender/id" : fetcher,
    null
  );
  if (error) {
    handleValueChange("tender_id", "error");
    // setOpenModal(false);
  }

  const createTender = async () => {
    try {
      const { data } = await axios.post(
        "http://localhost:5000/tender/create",
        tenderState,
        axiosConfig
      );
      console.log(data.message);
    } catch (e) {
      console.log(e);
    } finally {
      setOpenModal(false);
    }
  };

  return (
    <>
      <div className="modal__background"></div>

      <div className="modal__container">
        <div className="admin__tender_inputs">
          <div className="admin__tender_inputs_left">
            <div className="left_first">
              <div className="tender">
                <input
                  className="tender_id"
                  type="text"
                  placeholder="ID"
                  value={tenderState.tender_id}
                  onChange={(e) =>
                    handleValueChange("tender_id", e.target.value)
                  }
                ></input>
              </div>

              <div className="tender">
                <input
                  className="tender_experience"
                  type="text"
                  placeholder="Eligibility (In Flow)"
                  value={tenderState.criteria}
                  onChange={(e) =>
                    handleValueChange("criteria", e.target.value)
                  }
                ></input>
              </div>
            </div>

            <div className="tender">
              <input
                className="tender_title"
                type="text"
                placeholder="Title"
                value={tenderState.name}
                onChange={(e) => handleValueChange("name", e.target.value)}
              ></input>
            </div>

            <div className="left_third">
              <div className="left_third_dates">
                Opening Date
                <input
                  className="tender_dates"
                  type="date"
                  name="opening"
                  value={tenderState.opening_date}
                  onChange={(e) =>
                    handleValueChange("opening_date", e.target.value)
                  }
                />
              </div>

              <div className="left_third_dates">
                Closing Date
                <input
                  className="tender_dates"
                  type="date"
                  name="closing"
                  value={tenderState.closing_date}
                  onChange={(e) =>
                    handleValueChange("closing_date", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          <div className="admin__tender_inputs_right">
            <div className="admin__tender_inputs_right_description">
              <textarea
                rows="5"
                cols="20"
                name="description"
                placeholder="Description"
                value={tenderState.description}
                onChange={(e) =>
                  handleValueChange("description", e.target.value)
                }
              ></textarea>
            </div>
          </div>
        </div>

        <div className="admin_text_button">
          <button
            className="admin__submit"
            onClick={() => {
              createTender();
            }}
          >
            Submit
          </button>
        </div>
      </div>
    </>
  );
};

export default Modal;
