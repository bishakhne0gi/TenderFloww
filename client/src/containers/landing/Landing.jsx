import React from 'react'
import './landing.css'
import { useNavigate } from 'react-router-dom'
import Projects from '../projects/Projects';


const Landing = () => {


    const navigate = useNavigate();

    const goTo__Projects = () => {
        navigate('/projects');
    }


    return (
        <>

            <div className="landing_overlay">



                <div className="landing_text_para">
                    Getting <br></br> <span className='span_style'>best tenders</span><br />at your fingertips
                </div>

                <div className="landing_text_header">

                    <span className='span_style_header'>TENDER</span>FLOW
                </div>

                <div className="landing_text_button" onClick={goTo__Projects}>
                    <button className='landing__get_started'>Get Started</button>
                </div>




            </div>
        </>
    )
}

export default Landing