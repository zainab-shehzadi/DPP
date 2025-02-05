"use client";

import React from "react";

const Image: React.FC = () => {
  return (
<div
  className="flex flex-1 bg-white bg-center relative mb-10 hide-on-small"
  style={{
    backgroundImage: "url('/assets/pic.png')",
    
    backgroundSize: "cover",
    backgroundPosition: "center",
    height: "120vh",
  }}
>
  <div className="quote ">
    <p>The future belongs to those who</p>
    <p>
      <span className="highlight">believe</span> in the{" "}
      <span className="highlight">beauty of their dreams.</span>
    </p>
    <p style={{ textAlign: "right", marginTop: "20px" }}>— Eleanor Roosevelt</p>
  </div>

  <style jsx>{`
    .quote {
      position: absolute;
      left: 100px;
      top: 50px;
      font-size: 2.4rem; /* Default font size for large screens */
      color: black;
      line-height: 1.6; /* Adjusted for better spacing */
      font-family: Arial, sans-serif;
      font-weight: 500;
      margin: 0;
    }

    .highlight {
      color: #80b93d; /* Green color for highlighted words */
      font-weight: bold;
    }

    /* Responsive Design */

    /* Large Screens (Default) */
    @media (max-width: 1300px) {
      .quote {
        left: 70px;
        top: 40px;
        font-size: 2rem;
      }
    }

    /* Medium Screens */
    @media (max-width: 1200px) {
      .quote {
        left: 50px;
        top: 30px;
        font-size: 1.6rem;
      }
    }
 /* Medium Screens */
    @media (max-width: 900px) {
      .quote {
        left: 50px;
        top: 30px;
        font-size: 1.5rem;
      }
    }
    /* Tablets */
    @media (max-width: 768px) {
      .quote {
        left: 20px;
        top: 20px;
        font-size: 1.4rem;
        text-align: center; /* Center-align for tablets */
        width: 90%;
      }
    }

    /* Small Devices */
    @media (max-width: 645px) {
      .quote {
        left: 10px;
        top: 10px;
        font-size: 1.2rem;
        text-align: center; /* Center-align for smaller devices */
        width: 90%;
      }
    }

    /* Phones */
    @media (max-width: 500px) {
      .hide-on-small {
        display: none; /* Hide the entire div below 500px */
      }
    }

    /* Very Small Screens */
    @media (max-width: 320px) {
      .quote {
        font-size: 1rem;
        line-height: 1.4;
      }
    }
  `}</style>
</div>






  );
};

export default Image;
