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
  <div className="quote">
    <p>The future belongs to those who</p>
    <p>
      <span className="highlight">believe</span> in the{" "}
      <span className="highlight">beauty of their dreams.</span>
    </p>
    <p style={{ textAlign: "right", marginTop: "15px" }}>— Eleanor Roosevelt</p>
  </div>

  <style jsx>{`
    .quote {
      position: absolute;
      left: 100px;
      top: 50px;
      font-size: 2rem; /* Reduced from 2.4rem */
      color: black;
      line-height: 1.5;
      font-family: Arial, sans-serif;
      font-weight: 500;
      margin: 0;
    }

    .highlight {
      color: #80b93d;
      font-weight: bold;
    }

    /* Large Screens */
    @media (max-width: 1300px) {
      .quote {
        left: 70px;
        top: 40px;
        font-size: 1.6rem; /* Reduced */
      }
    }

    /* Medium Screens */
    @media (max-width: 1200px) {
      .quote {
        left: 50px;
        top: 30px;
        font-size: 1.3rem; /* Reduced */
      }
    }

    @media (max-width: 900px) {
      .quote {
        left: 50px;
        top: 30px;
        font-size: 1.3rem; /* Reduced */
      }
    }

    /* Tablets */
    @media (max-width: 768px) {
      .quote {
        left: 20px;
        top: 20px;
        font-size: 1.3rem; /* Reduced */
        text-align: center;
        width: 90%;
      }
    }

    /* Small Devices */
    @media (max-width: 645px) {
      .quote {
        left: 10px;
        top: 10px;
        font-size: 1.1rem; /* Reduced */
        text-align: center;
        width: 90%;
      }
    }

    /* Phones */
    @media (max-width: 500px) {
      .hide-on-small {
        display: none;
      }
    }

    /* Very Small Screens */
    @media (max-width: 320px) {
      .quote {
        font-size: 0.9rem; /* Reduced */
        line-height: 1.4;
      }
    }
  `}</style>
</div>







  );
};

export default Image;
