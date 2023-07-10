import React, { useState } from "react";
import "./tender.css";
import axios from "axios";
const Tender = ({ datas }) => {
  const [isLoading, SetisLoading] = useState(false);
  const settleBid = async () => {
    SetisLoading(true);
    const tender_id = datas?.tender_id;

    const { data } = await axios.post("http://localhost:5000/settle", {
      tender_id,
    });
    SetisLoading(false);
    alert(`Project is Assigned to ${data?.final_winner}`);
  };
  return (
    <>
      <div className="tender__body section__margin">
        <div className="tender_left">
          <div className="first_list">
            <div className="id_list">
              <div className="id_key">ID</div>
              <span className="id_val">{datas?.tender_id}</span>
            </div>

            <div className="id_list">
              <div className="id_key">Min. Exp. required</div>
              <span className="id_val"> {datas?._minimumExp}</span>
            </div>
          </div>

          <div className="second_list">
            <div className="title_list">
              <div className="title_key">Title</div>
              <span className="title_val">{datas?._title}</span>
            </div>
          </div>

          <div className="second_list">
            <div className="title_list">
              <div className="title_key">IPFS hash:</div>
              <span className="title_val">{`IPFSHash : ${datas?._ipfsHash.slice(
                0,
                4
              )}...${datas?._ipfsHash.slice(
                datas?._ipfsHash.length - 4,
                datas?._ipfsHash.length
              )} `}</span>
            </div>
          </div>

          <div className="third_list">
            <div className="date_list">
              <div className="date_key">Opening Date</div>
              <span className="date_val">{datas?.opening_date}</span>
            </div>

            <div className="date_list">
              <div className="date_key">Bidding length</div>
              <span className="date_val">{datas?.biddingLength}</span>
            </div>
          </div>
        </div>

        <div className="tender_right">
          Description
          <div className="tender_right_body section__padding">
            {datas?._description}
          </div>
          <div className="date_list_settle">
            <span
              className="date_val_settle"
              onClick={() => {
                settleBid();
              }}
            >
              {isLoading ? "Loading..." : "Settle Bid"}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Tender;
