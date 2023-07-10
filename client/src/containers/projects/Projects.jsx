import React, { useState } from "react";
import "./projects.css";
import { BsFilter } from "react-icons/bs";
import {
  ActiveHeader,
  ListActive,
  ListPast,
  PastHeader,
} from "../../components";
import { BsFillArrowLeftSquareFill } from "react-icons/bs";
import Logo from "../../assets/logo (2).png";
import { useNavigate } from "react-router-dom";

const Projects = () => {
  const [isPastListvisible, setisPastListvisible] = useState(false);
  const [isActiveListvisible, setisActiveListvisible] = useState(true);

  const change = () => {
    setmyBool(!myBool);
  };

  const navigate = useNavigate();

  const goTo__landing = () => {
    navigate("/");
  };

  const goTo__login = () => {
    navigate("/login");
  };

  const [tendersData, setTendersData] = useState();

  const fetcher = (url) =>
    axios
      .get(url)
      .then((res) => setTendersData(res.data?.message))
      .catch((e) => console.log(e.response))
      .finally(() => console.log(tendersData));

  // Fetch tender id
  // const { data, error } = useSWR(
  //   "http://localhost:5000/tender/display",
  //   fetcher
  // );
  // if (error) {
  //   console.log(error.response?.data);
  // }

  return (
    <>
      <div className="logo__container ">
        <BsFillArrowLeftSquareFill className="back" onClick={goTo__landing} />
        <img className="logo" src={Logo} onClick={goTo__landing} />
      </div>

      <div className="projects__background_overlay section__margin">
        <div className="projects__container section__padding">
          <div className="projects__login_button ">
            <button className="projects__login_btn" onClick={goTo__login}>
              Login
            </button>
          </div>

          <div className="projects__search_container">
            <input
              className="projects__search_style"
              type="text"
              placeholder="search"
            ></input>

            <div className="projects__search_filter">
              <div className="projects_search_filter_by">
                <BsFilter style={{ width: 30, height: 30 }} /> by Name
              </div>
              <div className="projects_search_filter_by">
                <BsFilter style={{ width: 30, height: 30 }} /> by Category
              </div>
            </div>
          </div>

          <div className="projects__switch_btns">
            <div className="projects__active_projects_header ">
              <button
                className="projects__header_btn"
                onClick={() => {
                  setisActiveListvisible(true);
                  setisPastListvisible(false);
                }}
              >
                Active Projects
              </button>
            </div>
            <div className="projects__active_projects_header ">
              <button
                className="projects__header_btn1"
                onClick={() => {
                  setisActiveListvisible(false);
                  setisPastListvisible(true);
                }}
              >
                Past Projects
              </button>
            </div>
          </div>

          <div className="projects__body section__margin">
            <div className="project__body_header_active">
              {isActiveListvisible ? <ActiveHeader /> : <PastHeader />}
            </div>

            <div className="project__body_list">
              {isActiveListvisible ? (
                <>
                  <ListActive />
                  <ListActive />
                  <ListActive />
                  <ListActive />
                </>
              ) : (
                <>
                  <ListPast />
                  <ListPast />
                  <ListPast />
                  <ListPast />
                  <ListPast />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Projects;
