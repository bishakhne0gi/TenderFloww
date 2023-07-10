import React, { useState } from "react";
import "./login.css";
import AnimationVideo from "../../assets/login_animation.mp4";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/logo (2).png";
import { BsFillArrowLeftSquareFill } from "react-icons/bs";
import EmailValidator from "email-validator";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const [loginState, setLoginState] = useState({
    email: "",
    password: "",
  });

  const handleValueChange = (fieldName, value) => {
    setLoginState((loginState) => ({
      ...loginState,
      [fieldName]: value,
    }));
  };

  const axiosConfig = {
    headers: {
      "Content-type": "application/json",
    },
    withCredentials: true
  };

  const LoginFunc = async () => {
    if (!loginState.email || !loginState.password) {
      console.log("Please fill all the fields");
      return;
    }

    if (!EmailValidator.validate(loginState.email)) {
      console.log("Please provide a valid email");
      return;
    }

    try {
      const { data } = await axios.post(
        "http://localhost:5000/login",
        loginState,
        axiosConfig
      );
      
      console.log(data.data);
      goTo__Projects();
    } catch (err) {
      console.log(err.response?.data);
    }
  };

  const goTo__landing = () => {
    navigate("/");
  };

  const goTo__SignUp = () => {
    navigate("/signup");
  };

  const goTo__Projects = () => {
    navigate("/projects");
  };

  return (
    <>
      <video src={AnimationVideo} autoPlay loop muted />

      <div className="logo__container ">
        <BsFillArrowLeftSquareFill className="back" onClick={goTo__Projects} />
        <img className="logo" src={Logo} onClick={goTo__landing} />
      </div>

      <div className="login__overlay ">
        <div className="login__container section__padding">
          <div className="login__header">
            Log<span style={{ color: "black" }}>In</span>
          </div>

          <div className="input__container">
            <input
              className="login__input"
              type="email"
              placeholder="Organisation Mail"
              value={loginState.email}
              onChange={(e) => handleValueChange("email", e.target.value)}
            ></input>
            <input
              className="login__input"
              type="password"
              placeholder="Password"
              value={loginState.password}
              onChange={(e) => handleValueChange("password", e.target.value)}
            ></input>
          </div>

          <div className="btn__login_container_outer">
            <button
              className="btn__login_container"
              onClick={() => LoginFunc()}
            >
              Login
            </button>
          </div>

          <div className="btn__signup" onClick={goTo__SignUp}>
            Create new account
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
