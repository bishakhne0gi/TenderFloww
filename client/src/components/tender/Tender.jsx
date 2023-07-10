import React from "react";
import "./tender.css";
const Tender = ({ data }) => {
  return (
    <>
      <div className="tender__body section__margin">
        <div className="tender_left">
          <div className="first_list">
            <div className="id_list">
              <div className="id_key">ID</div>
              <span className="id_val">{data?.tender_id}</span>
            </div>

            <div className="id_list">
              <div className="id_key">Min. Exp. required</div>
              <span className="id_val"> {data?._minimumExp}</span>
            </div>
          </div>

          <div className="second_list">
            <div className="title_list">
              <div className="title_key">Title</div>
              <span className="title_val">{data?._title}</span>
            </div>
          </div>

          <div className="second_list">
            <div className="title_list">
              <div className="title_key">IPFS hash:</div>
              <span className="title_val">{`IPFSHash : ${data?._ipfsHash.slice(
                0,
                4
              )}...${data?._ipfsHash.slice(
                data?._ipfsHash.length - 4,
                data?._ipfsHash.length
              )} `}</span>
            </div>
          </div>

          <div className="third_list">
            <div className="date_list">
              <div className="date_key">Opening Date</div>
              <span className="date_val">{data?.opening_date}</span>
            </div>

            <div className="date_list">
              <div className="date_key">Bidding length</div>
              <span className="date_val">{data?.biddingLength}</span>
            </div>
          </div>
        </div>

        <div className="tender_right">
          Description
          <div className="tender_right_body section__padding">
            {data?._description}
          </div>
        </div>
      </div>
    </>
  );
};

export default Tender;
