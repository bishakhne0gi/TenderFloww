import React from "react";
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

const Bids = () => {
  const { user, setTxId, status } = FlowState();
  const navigate = useNavigate();
  const search = useLocation().search;
  const tender_id = new URLSearchParams(search).get("tender_id");
  console.log(tender_id);

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
              <Description />
              <Description />
              <Description />
              <Description />
              <Description />
              <Description />
            </div>
          </div>
        </div>

        <div className="bid__container_right">
          <div className="bid__container_leaderboard">
            <div className="bid__container_left_btns">
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
                    <div className="btn__wallet_connect_1">
                      <button
                        className="btn__wallet_connect"
                        onClick={() => {
                          fcl.logIn();
                        }}
                      >
                        Login
                      </button>
                    </div>
                    <div className="btn__wallet_connect_1">
                      <button
                        className="btn__wallet_connect"
                        onClick={() => {
                          fcl.signUp();
                        }}
                      >
                        Sign up
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="btns_right">
                <div className="btn__wallet_trans_container">
                  <button className="btn__wallet_trans">
                    <input
                      className="input__wallet_trans"
                      placeholder="0.00001"
                    ></input>
                    Flow
                  </button>
                </div>

                <div className="btn__wallet_bid_container">
                  <button className="btn__wallet_bid">Place Bid</button>
                </div>
              </div>
            </div>
            <div className="project__body_header_active">
              <BidHeader />
            </div>

            <div className="bid__body_list">
              <ListBid />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Bids;
