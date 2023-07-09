import React from 'react'
import './activeHeader.css'



const ActiveHeader = () => {
    return (
        <>
            <div className="activeHeader__container section__margin">

                <div className="activeHeader_name header_style">
                    Name
                </div>

                <div className="activeHeader_bid_date header_style">
                    Bid Begins
                </div>

                <div className="activeHeader_end_date header_style">
                    Bid Ends
                </div>

            </div>
        </>
    )
}

export default ActiveHeader