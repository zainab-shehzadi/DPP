import { Button } from "@/components/ui/button";
import Image from "next/image";
import React from "react";
import { FileSpreadsheet } from "lucide-react";

import ReviewComponents from "@/components/ReviewComponents";

const Page = () => {
  return (
    <section>
      {/* for hero section */}
      <main className="flex flex-col pt-8 items-center bg-cover bg-center h-screen bg-hero-pattern max-h-[600px] max-md:max-h-[400px]">
        <p>Innovating Senior Living Compliance Solutions </p>
        <h1 className="text-black text-4xl font-bold line leading-[117%] max-w-[800px] text-center max-md:text-xl">
          Advanced Long Term Care Solutions Designed to Streamline Operations
          and Improve Patient Care
        </h1>
        <div className="flex flex-row gap-3 pt-5">
          <Button className="primary-btn !px-3">Book a Demo</Button>
          <Button className="secondary-btn !px-3">Contact Sales</Button>
        </div>
        <Image
          src="/assets/hero-img.png"
          className="max-md:max-w-[300]"
          alt="logo"
          width={700}
          height={30}
        />
      </main>

      {/* for about us */}
      <section className="flex flex-col py-28 justify-center items-center page-pad gap-4">
        <h2 className="text-gradient text-4xl font-bold">About Us</h2>
        <p>
          (Company Name) is revolutionizing the long-term care industry through
          innovative software solutions. We aim to enhance the quality of care,
          streamline operations and promote efficiency. We are committed to
          empowering caregivers and improving the lives of those they serve, by
          providing user-friendly, reliable and cutting-edge technology at the
          forefront of the Long-Term Care industry.  
        </p>
      </section>

      {/* for HTW */}
      <section className="page-pad bg-gradient-custom py-16 flex flex-col gap-10 justify-center items-center">
        <h2 className="text-white text-3xl font-bold">Easy as 123</h2>

        <div className="flex flex-row flex-wrap justify-center mt-10 w-full gap-10">
          <div className="flex flex-col bg-white items-center w-[300px] h-[250px] rounded-lg relative">
            <span className="bg-secondary absolute -top-5 p-3 rounded-[50%] text-white">
              <FileSpreadsheet size={30} />
            </span>
            <h3 className="text-secondary font-semibold text-2xl mt-16 py-3">
              Read
            </h3>
            <p>Upload your Document</p>
          </div>

          <div className="flex flex-col bg-white items-center w-[300px] h-[250px] rounded-lg relative">
            <span className="bg-secondary absolute -top-5 p-3 rounded-[50%] text-white">
              <FileSpreadsheet size={30} />
            </span>
            <h3 className="text-secondary font-semibold text-2xl mt-16 py-3">
              Read
            </h3>
            <p>Upload your Document</p>
          </div>

          <div className="flex flex-col bg-white items-center w-[300px] h-[250px] rounded-lg relative">
            <span className="bg-secondary absolute -top-5 p-3 rounded-[50%] text-white">
              <FileSpreadsheet size={30} />
            </span>
            <h3 className="text-secondary font-semibold text-2xl mt-16 py-3">
              Read
            </h3>
            <p>Upload your Document</p>
          </div>
        </div>
      </section>

      {/* compant icon */}
      <section className="flex flex-row w-full justify-center items-center my-16 page-pad">
        <div className="flex space-x-8">
          <div className="basis-1/3">
            <Image
              src="/assets/company-1.png"
              alt="logo"
              width="150"
              height="30"
            />
          </div>
          <div className="basis-1/3">
            <Image
              src="/assets/company-1.png"
              alt="logo"
              width="150"
              height="30"
            />
          </div>
          <div className="basis-1/3">
            <Image
              src="/assets/company-1.png"
              alt="logo"
              width="150"
              height="30"
            />
          </div>
          <div className="basis-1/3">
            <Image
              src="/assets/company-1.png"
              alt="logo"
              width="150"
              height="30"
            />
          </div>
          <div className="basis-1/3">
            <Image
              src="/assets/company-1.png"
              alt="logo"
              width="150"
              height="30"
            />
          </div>
        </div>
      </section>

      {/* review section */}
      <ReviewComponents />
    </section>
  );
};

export default Page;
