import React from "react";
import "./signup.css";
import AnimationVideo from "../../assets/login_animation.mp4";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";

const Signup = () => {
  const navigate = useNavigate();
  const [signupState, setSignupState] = useState({
    name: "",
    email: "",
    registration: "",
    address: "",
    password: "",
  });

  const axiosConfig = {
    headers: {
      "Content-type": "application/json",
    },
  };

  const handleValueChange = (fieldName, value) => {
    setSignupState((signupState) => ({
      ...signupState,
      [fieldName]: value,
    }));
  };

  const SignupFunc = async () => {
    if (
      !signupState.name ||
      !signupState.email ||
      !signupState.registration ||
      !signupState.address ||
      !signupState.password
    ) {
      console.log("fill all the fields");
    }

    try {
      const { data } = await axios.post(
        "http://localhost:5000/signup",
        signupState,
        axiosConfig
      );
      navigate("/projects");
      console.log(data);
    } catch (e) {
      console.log(e);
    }
  };

  const goTo__Login = () => {
    navigate("/login");
  };

  return (
    <>
      <video src={AnimationVideo} autoPlay loop muted />
      <div className="sign__overlay ">
        <div className="sign__container section__padding section__margin">
          <div className="sign__header">
            Sign<span style={{ color: "black" }}>Up</span>
          </div>

          <div className="input__container">
            <input
              className="sign__input"
              type="text"
              placeholder="Organisation Name"
              value={signupState.name}
              onChange={(e) => handleValueChange("name", e.target.value)}
            ></input>
            <input
              className="sign__input"
              type="email"
              placeholder="Organisation Mail"
              value={signupState.email}
              onChange={(e) => handleValueChange("email", e.target.value)}
            ></input>
            <input
              className="sign__input"
              type="number"
              placeholder="Registration Id"
              value={signupState.registration}
              onChange={(e) =>
                handleValueChange("registration", e.target.value)
              }
            ></input>
            <input
              className="sign__input"
              type="text"
              placeholder="Address"
              value={signupState.address}
              onChange={(e) => handleValueChange("address", e.target.value)}
            ></input>
            <input
              className="sign__input"
              type="password"
              placeholder="Password"
              value={signupState.password}
              onChange={(e) => handleValueChange("password", e.target.value)}
            ></input>
          </div>

          <div className="btn__sign_container_outer">
            <button
              className="btn__sign_container"
              onClick={() => SignupFunc()}
            >
              Signup
            </button>
          </div>

          <div className="btn__signup" onClick={goTo__Login}>
            Already have an account?
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
