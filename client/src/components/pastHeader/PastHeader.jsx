import React from 'react'
import './pastHeader.css'



const ActiveHeader = () => {
    return (
        <>
            <div className="activeHeader__container section__margin">

                <div className="pastHeader_name header_style">
                    Name
                </div>

                <div className="pastHeader_bid_date header_style">
                    Bid Closed
                </div>

                <div className="pastHeader_end_date header_style">
                    Tender Given
                </div>

            </div>
        </>
    )
}

export default ActiveHeader