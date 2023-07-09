import React from 'react'
import './bidHeader.css'



const BidHeader = () => {
    return (
        <>
            <div className="bidHeader__container section__margin">

                <div className="bidHeader_name header_style_bid">
                    Name
                </div>

                <div className="bidHeader_bid_date header_style_bid">
                    Money
                </div>


            </div>
        </>
    )
}

export default BidHeader