import React from "react";
import "./listActive.css";
import { useNavigate } from "react-router-dom";

const ListActive = ({ data }) => {
  const navigate = useNavigate();

  return (
    <>
      <div
        className="list__container section__margin"
        onClick={navigate(`/bids?tender_id=${data?.tender_id}`)}
      >
        <div className="list__container_name">{data?._title}</div>

        <div className="list__container_open_bid">{data?.biddingLength}</div>

        <div className="list__container_close_bid">{data?._minimumExp}</div>
      </div>
    </>
  );
};

export default ListActive;
