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
              <span className="id_val">{data?.id}</span>
            </div>

            <div className="id_list">
              <div className="id_key">Experience</div>
              <span className="id_val"> {data?.criteria}</span>
            </div>
          </div>

          <div className="second_list">
            <div className="title_list">
              <div className="title_key">Title</div>
              <span className="title_val">{data?.name}</span>
            </div>
          </div>

          <div className="third_list">
            <div className="date_list">
              <div className="date_key">Opening Date</div>
              <span className="date_val">{data?.opening_date}</span>
            </div>

            <div className="date_list">
              <div className="date_key">Closing Date</div>
              <span className="date_val">{data?.closing_date}</span>
            </div>
          </div>
        </div>

        <div className="tender_right">
          {data?.description}
          <div className="tender_right_body"></div>
        </div>
      </div>
    </>
  );
};

export default Tender;
