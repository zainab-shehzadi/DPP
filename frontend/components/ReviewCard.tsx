import Image from "next/image";
import React from "react";

const ReviewCard = () => {
  return (
    <section className="relative p-4">
      <Image
        className="absolute top-0 left-0 z-0"
        src="/assets/review-circle.png"
        alt="circle"
        width={50}
        height={30}
      />
      <div
        className="flex flex-col bg-white p-[30px] rounded-2xl gap-6 max-w-[400px] relative z-10"
        style={{
          boxShadow: "0px 7px 10px 0px rgba(100, 100, 111, 0.1)",
        }}
      >
        <Image src="/assets/qoute.png" alt="qoute" width={50} height={30} />
        <p className="text-sm font-semibold">
          Thanks to this platform, our document management process has never
          been smoother! It saves us hours every day, and the accuracy is spot
          on. Highly recommended!
        </p>
        <div className="flex flex-col gap-3">
          <div className="w-full h-[1px] bg-white-200"></div>

          <div className="flex flex-row justify-between items-center">
            <span className="flex items-center gap-3">
              <Image
                src="/assets/review-profile.png"
                alt="profile"
                width={50}
                height={30}
              />
              <p className="font-semibold text-primary">Barbara D. Smith</p>
            </span>
            <Image
              src="/assets/review-star.png"
              alt="profile"
              width={90}
              height={30}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewCard;
