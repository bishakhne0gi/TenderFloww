import React, { useState } from "react";
import "./bids.css";
import {
  ActiveHeader,
  BidHeader,
  Description,
  ListActive,
  ListBid,
} from "../../components";
import { createCollectionSetupInFlow } from "../../Transactions/storebiddingCollection";
import Logo from "../../assets/logo (2).png";
import { BsFillArrowLeftSquareFill } from "react-icons/bs";
import { useNavigate, useLocation } from "react-router-dom";

import { FlowState } from "../../context/FlowProvider";
import * as fcl from "@onflow/fcl";
import useSWR from "swr";
import axios from "axios";
import FlowLogo from "../../assets/illustrations/FlowLogo";
const Bids = () => {
  const { user, setTxId, status } = FlowState();
  const navigate = useNavigate();
  const search = useLocation().search;
  const tender_id = new URLSearchParams(search).get("tender_id");
  console.log(tender_id);

  const [projectData, setProjectData] = useState([]);
  const [biddingAmount, SetbiddingAmount] = useState(0);
  const fetcher = (url) =>
    axios
      .get(url)
      .then((res) => setProjectData(res.data?.message))
      .catch((e) => console.log(e.response))
      .finally(() => console.log(tendersData));

  // Fetch tender id
  const { data, error } = useSWR(
    `http://localhost:5000/tender/display?${tender_id}`,
    fetcher
  );
  if (error) {
    console.log(error?.data);
  }
  console.log(projectData);

  const goTo__landing = () => {
    navigate("/");
  };

  const goTo__Projects = () => {
    navigate("/projects");
  };

  const AsyncTxhandle = async () => {
    const tx = await createCollectionSetupInFlow();
    setTxId(tx);
  };

  const placeBid = async () => {
    console.log(biddingAmount);
    const { data } = await axios.post(
      "http://localhost:5000/placebid",
      {
        tender_id,
        biddingAmount,
      },
      {
        withCredentials: true,
      }
    );
  };
  return (
    <>
      <div className="logo__container ">
        <BsFillArrowLeftSquareFill className="back" onClick={goTo__Projects} />
        <img className="logo" src={Logo} onClick={goTo__landing} />
      </div>

      <div className="bids__container_overlay section__margin section__padding">
        <div className="bid__container_left">
          <div className="bid__container_left_body">
            <div className="bid__left_header_bg">
              <div className="bid__left_header">
                <span className="span_style_header_bid">Bi</span>d{" "}
                <span className="span_style_header_bid">D</span>etails
                <h5>{user.loggedIn ? user?.addr : null}</h5>
                <h5>{status ? status?.status : null}</h5>
              </div>
            </div>

            <div className="bid__container_description">
              <div className="desc__container">
                <div className="desc__requirement">Title:</div>
                <div className="desc__value">{projectData[0]?._title}</div>
              </div>
              <div className="desc__container">
                <div className="desc__requirement">Tender_id:</div>
                <div className="desc__value">{projectData[0]?.tender_id}</div>
              </div>
              <div className="desc__container">
                <div className="desc__requirement">IPFSHash:</div>
                <div className="desc__value">
                  {projectData[0]?._ipfsHash.slice(0, 4)}...
                </div>
              </div>
              <div className="desc__container">
                <div className="desc__requirement">Description:</div>
                <div className="desc__value">
                  {projectData[0]?._description}
                </div>
              </div>
              <div className="desc__container">
                <div className="desc__requirement">Min. Exp. Required:</div>
                <div className="desc__value">{projectData[0]?._minimumExp}</div>
              </div>
              <div className="desc__container">
                <div className="desc__requirement">Opening date:</div>
                <div className="desc__value">
                  {projectData[0]?.opening_date}
                </div>
              </div>
              <div className="desc__container">
                <div className="desc__requirement">Duration:</div>
                <div className="desc__value">
                  {projectData[0]?.biddingLength}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bid__container_right">
          <div className="bid__container_leaderboard">
            <div className="btns_left">
              {user.loggedIn ? (
                <>
                  <div className="btn__wallet_connect_1">
                    <button
                      className="btn__wallet_connect"
                      onClick={() => {
                        AsyncTxhandle();
                      }}
                    >
                      Collection Setup
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button
                    className="btn__wallet_connect"
                    onClick={() => {
                      fcl.logIn();
                    }}
                  >
                    Login
                  </button>

                  <br />

                  <button
                    className="btn__wallet_connect"
                    onClick={() => {
                      fcl.signUp();
                    }}
                  >
                    Sign up
                  </button>
                </>
              )}
            </div>

            <div className="btn__wallet_trans_container">
              <button className="btn__wallet_trans">
                <input
                  className="input__wallet_trans"
                  placeholder="0.00001"
                  value={biddingAmount}
                  onChange={(e) => SetbiddingAmount(e.target.value)}
                />
                Flow
                <FlowLogo style={{ width: 30, marginLeft: 10 }} />
              </button>
            </div>

            <div className="btn__wallet_bid_container">
              <button
                className="btn__wallet_bid"
                onClick={() => {
                  placeBid();
                  window.location.reload();
                }}
              >
                Place Bid
              </button>
            </div>

            <div className="project__body_header_active"></div>

            <div className="bid__body_list">
              <div className="min_val">
                <span>Lowest Bid</span>

                <span>{projectData[0]?.currentMinDemand}</span>
              </div>
              <div className="min_user">
                <span>Winner</span>
                <span>{projectData[0]?.winner_email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Bids;
