
"use client"; // <-- Add this line to mark this file as a client component
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useState } from "react";
import { FileSpreadsheet } from "lucide-react";


const FAQSection = () => {
  // State to keep track of which FAQ item is expanded

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  
  // Function to toggle the expansion of an FAQ item
  const toggleExpand = (index :number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <section className="page-pad bg-gradient-custom from-blue-900 to-green-500 py-20 lg:py-32 flex flex-col lg:flex-row gap-10 items-start mt-16">
    <div className="px-4 sm:px-8 md:px-12 lg:ml-20 mb-8 sm:mb-10 md:mb-12 mt-10 md:mt-14 lg:mt-20 lg:mr-20 text-center lg:text-left">
  <h2 className="font-bold text-white text-[28px] sm:text-[36px] md:text-[44px] lg:text-[52px] leading-tight sm:leading-[42px] md:leading-[50px] lg:leading-[75px] max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
    Frequently Asked Questions
  </h2>
</div>

  
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto lg:mx-0 px-4 md:px-6 lg:px-8 mt-8">
      {/* FAQ Item 1 */}
      <div className="bg-white p-4 md:p-5 rounded-[15.93px] shadow-[0px_4.43px_14.16px_rgba(8,15,52,0.06)] cursor-pointer w-full max-w-[90vw] lg:max-w-none">
        <div
          className="flex justify-between items-center h-full"
          onClick={() => toggleExpand(0)}
        >
          <h3 className="text-base md:text-lg font-semibold text-blue-900">
            How does (Product Name) create a Plan of Correction?
          </h3>
          <span className="text-blue-900">{expandedIndex === 0 ? "▼" : "▶"}</span>
        </div>
        {expandedIndex === 0 && (
          <p className="text-gray-600 mt-3 text-sm md:text-base">
            (Product Name) employs an advanced algorithm trained on federal and state guidelines, developed in accordance with regulations and best practices in the long-term care industry. It identifies issues on the 2567 form, designates responsibility, outlines planned interventions, and sets target dates for expected outcomes.
          </p>
        )}
      </div>
  
      {/* FAQ Item 2 */}
      <div className="bg-white p-4 md:p-5 rounded-[15.93px] shadow-[0px_4.43px_14.16px_rgba(8,15,52,0.06)] cursor-pointer w-full max-w-[90vw] lg:max-w-none">
        <div
          className="flex justify-between items-center h-full"
          onClick={() => toggleExpand(1)}
        >
          <h3 className="text-base md:text-lg font-semibold text-blue-900">
            How Accurate is the Plan Of Correction Generated?
          </h3>
          <span className="text-blue-900">{expandedIndex === 1 ? "▼" : "▶"}</span>
        </div>
        {expandedIndex === 1 && (
          <p className="text-gray-600 mt-3 text-sm md:text-base">
            The Plan Of Correction is generated with high accuracy, using verified data and AI algorithms that adhere to industry standards.
          </p>
        )}
      </div>
  
      {/* FAQ Item 3 */}
      <div className="bg-white p-4 md:p-5 rounded-[15.93px] shadow-[0px_4.43px_14.16px_rgba(8,15,52,0.06)] cursor-pointer w-full max-w-[90vw] lg:max-w-none">
        <div
          className="flex justify-between items-center h-full"
          onClick={() => toggleExpand(2)}
        >
          <h3 className="text-base md:text-lg font-semibold text-blue-900">
            Is my Data Secure?
          </h3>
          <span className="text-blue-900">{expandedIndex === 2 ? "▼" : "▶"}</span>
        </div>
        {expandedIndex === 2 && (
          <p className="text-gray-600 mt-3 text-sm md:text-base">
            Yes, data security is our top priority. All information is encrypted and stored in compliance with industry security standards.
          </p>
        )}
      </div>
  
      {/* FAQ Item 4 */}
      <div className="bg-white p-4 md:p-5 rounded-[15.93px] shadow-[0px_4.43px_14.16px_rgba(8,15,52,0.06)] cursor-pointer w-full max-w-[90vw] lg:max-w-none">
        <div
          className="flex justify-between items-center h-full"
          onClick={() => toggleExpand(3)}
        >
          <h3 className="text-base md:text-lg font-semibold text-blue-900">
            How long does it take to generate a Plan of Correction?
          </h3>
          <span className="text-blue-900">{expandedIndex === 3 ? "▼" : "▶"}</span>
        </div>
        {expandedIndex === 3 && (
          <p className="text-gray-600 mt-3 text-sm md:text-base">
            The Plan of Correction is generated within minutes, providing you with an efficient solution to address compliance requirements.
          </p>
        )}
      </div>
    </div>
  </section>
  
  );
};



const Page = () => {
  return (
    <section>
      {/* for hero section */}
      <main className="flex flex-col pt-8 items-center bg-cover bg-center h-screen md:h-[800px] lg:h-[900px] bg-hero-pattern max-h-none">
        <p className="text-[#010514] text-center font-semibold mb-4">
          Innovating Senior Living Compliance Solutions
        </p>

        <h1 className="text-[#000000] text-5xl sm:text-5xl font-bold leading-[117%] max-w-[800px] text-center max-md:text-2xl mb-6">
          AI-Assisted Plan of Correction and Policy Writer
        </h1>

        <p
  className="text-[#010514] font-['Plus_Jakarta_Sans'] font-normal text-base sm:text-lg md:text-xl leading-[28px] sm:leading-[30px] md:leading-[34px] max-w-[90vw] md:max-w-[800px] lg:max-w-[1032px] text-center mx-auto mt-4 mb-12 md:mb-16 lg:mb-20"
>
  Healthcare Compliance can be demanding, particularly when addressing deficiencies on Form 2567. 
  <span className="font-semibold">(Company Name)</span>’s industry-leading, generative AI-powered solution simplifies this process by generating customized plans of correction, creating task lists, drafting new policies, and even helps you anticipate state inspections. With <span className="font-semibold">(Company Name)</span>, your organization can respond in minutes to regulatory requirements and proactively stay prepared for future inspections.
</p>


        <Image
          src="/assets/header.png"
          alt="logo"
          width={1181} // Default width required by Next.js
          height={600} // Default height to maintain aspect ratio
          className="w-full h-auto max-w-[300px] sm:max-w-[500px] md:max-w-[800px] lg:max-w-[1000px] xl:max-w-[1181px]"
        />
      </main>
 {/* for about us */}
 <section className="flex flex-col py-16 md:py-32 justify-center items-center page-pad gap-4 md:gap-8 bg-white h-[200px] md:h-[300px] lg:h-[400px]">
  {/* Your content here */}
</section>
           {/* for HTW */}
           
           <section className="page-pad bg-gradient-custom py-10 md:py-16 flex flex-col gap-10 justify-center items-center">
  <h2 className="text-white text-2xl md:text-3xl lg:text-4xl font-bold text-center">
    Easy as 123
  </h2>

  <div className="flex flex-col md:flex-row flex-wrap justify-center mt-6 md:mt-10 w-full gap-6 md:gap-8 lg:gap-10 px-4">
    {/* Step 1: Read */}
    <div className="flex flex-col bg-white items-center w-full sm:w-[300px] md:w-[330px] lg:w-[362px] h-[280px] md:h-[305px] rounded-lg relative shadow-lg p-6">
      <span className="bg-secondary absolute -top-5 p-3 rounded-full text-white shadow-md">
        <FileSpreadsheet size={30} />
      </span>
      <h3 className="text-secondary font-semibold text-xl md:text-2xl mt-12 md:mt-16 py-3">
        Read
      </h3>
      <p
        className="text-[#000000] font-['Plus_Jakarta_Sans'] font-medium text-sm md:text-base leading-6 text-center"
        style={{ maxWidth: '90%' }}
      >
        Upload your Document
      </p>
    </div>

    {/* Step 2: Write */}
    <div className="flex flex-col bg-white items-center w-full sm:w-[300px] md:w-[330px] lg:w-[362px] h-[280px] md:h-[305px] rounded-lg relative shadow-lg p-6">
      <span className="bg-secondary absolute -top-5 p-3 rounded-full text-white shadow-md">
        <FileSpreadsheet size={30} />
      </span>
      <h3 className="text-secondary font-semibold text-xl md:text-2xl mt-12 md:mt-16 py-3">
        Write
      </h3>
      <p
        className="text-[#000000] font-['Plus_Jakarta_Sans'] font-medium text-sm md:text-base leading-6 text-center"
        style={{ maxWidth: '90%' }}
      >
        Our Industry Leading AI will write a plan or policy, in compliance
        with federal and state guidelines, and generate tasks.
      </p>
    </div>

    {/* Step 3: Comply */}
    <div className="flex flex-col bg-white items-center w-full sm:w-[300px] md:w-[330px] lg:w-[362px] h-[280px] md:h-[305px] rounded-lg relative shadow-lg p-6">
      <span className="bg-secondary absolute -top-5 p-3 rounded-full text-white shadow-md">
        <FileSpreadsheet size={30} />
      </span>
      <h3 className="text-secondary font-semibold text-xl md:text-2xl mt-12 md:mt-16 py-3">
        Comply
      </h3>
      <p
        className="text-[#000000] font-['Plus_Jakarta_Sans'] font-medium text-sm md:text-base leading-6 text-center"
        style={{ maxWidth: '90%' }}
      >
        Read, Submit, and Comply.
      </p>
    </div>
  </div>

  <Button
    className="text-white bg-[#78BE20] rounded-full font-semibold text-sm md:text-base px-6 py-2 md:px-8 md:py-3 mt-8 md:mt-10 hover:bg-[#66A31C] transition-all"
    style={{ maxWidth: '200px' }}
  >
    Book a Demo
  </Button>
</section>



{/* for features of product */}
<section className="flex flex-col py-10 md:py-16 lg:py-20 justify-center items-center bg-white">
  <h1 className="text-[#000000] text-3xl sm:text-4xl md:text-5xl font-bold leading-[117%] max-w-[800px] text-center mb-8 sm:mb-12 md:mb-16">
    Features of (Product Name)
  </h1>

  <section className="flex flex-col items-center">
    {/* Features Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 lg:gap-16 max-w-[1200px] w-full px-4">
      {/* Feature 1 */}
      <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
        <Image
          src="/assets/icon.png"
          alt="Clock Icon"
          width={40}
          height={40}
          className="w-10 h-10 mb-4"
        />
        <h3 className="text-[#12141D] font-semibold text-lg md:text-xl lg:text-2xl">
          AI-Generated Plan of Correction
        </h3>
        <p className="text-[#12141D] text-sm md:text-base leading-6 opacity-70 max-w-[90%]">
          (Product Name) analyzes deficiencies from your Form 2567 and generates a detailed, compliant plan for correction tailored to the issue at hand in seconds.
        </p>
      </div>

      {/* Feature 2 */}
      <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
        <Image
          src="/assets/icon1.png"
          alt="Tag Icon"
          width={40}
          height={40}
          className="w-10 h-10 mb-4"
        />
        <h3 className="text-[#12141D] font-semibold text-lg md:text-xl lg:text-2xl">
          State Tag Insights
        </h3>
        <p className="text-[#12141D] text-sm md:text-base leading-6 opacity-70 max-w-[90%]">
          (Product Name) collects and analyzes data from tags issued in a rolling 6-month period, allowing you to see patterns and focus areas of your State’s Regulatory body, giving you a competitive edge in preparing for future inspections.
        </p>
      </div>

      {/* Feature 3 */}
      <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
        <Image
          src="/assets/icon2.png"
          alt="Task Icon"
          width={40}
          height={40}
          className="w-10 h-10 mb-4"
        />
        <h3 className="text-[#12141D] font-semibold text-lg md:text-xl lg:text-2xl">
          Task Creation and Delegation
        </h3>
        <p className="text-[#12141D] text-sm md:text-base leading-6 opacity-70 max-w-[90%]">
          Convert your Plan of Correction into actionable task lists that are automatically assigned to appropriate team members with due dates and priority levels. Sync with Google & Microsoft Calendar to ensure all corrective actions and deadlines are tracked and managed effectively.
        </p>
      </div>
    </div>
  </section>

  <section className="flex flex-col items-center mt-10 md:mt-16 lg:mt-20">
    {/* Features Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 lg:gap-16 max-w-[1200px] w-full px-4">
      {/* Feature 4 */}
      <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
        <Image
          src="/assets/icon.png"
          alt="Clock Icon"
          width={40}
          height={40}
          className="w-10 h-10 mb-4"
        />
        <h3 className="text-[#12141D] font-semibold text-lg md:text-xl lg:text-2xl">
          AI-Generated Plan of Correction
        </h3>
        <p className="text-[#12141D] text-sm md:text-base leading-6 opacity-70 max-w-[90%]">
          (Product Name) analyzes deficiencies from your Form 2567 and generates a detailed, compliant plan for correction tailored to the issue at hand in seconds.
        </p>
      </div>

      {/* Feature 5 */}
      <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
        <Image
          src="/assets/icon1.png"
          alt="Tag Icon"
          width={40}
          height={40}
          className="w-10 h-10 mb-4"
        />
        <h3 className="text-[#12141D] font-semibold text-lg md:text-xl lg:text-2xl">
          State Tag Insights
        </h3>
        <p className="text-[#12141D] text-sm md:text-base leading-6 opacity-70 max-w-[90%]">
          (Product Name) collects and analyzes data from tags issued in a rolling 6-month period, allowing you to see patterns and focus areas of your State’s Regulatory body, giving you a competitive edge in preparing for future inspections.
        </p>
      </div>

      {/* Feature 6 */}
      <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
        <Image
          src="/assets/icon2.png"
          alt="Task Icon"
          width={40}
          height={40}
          className="w-10 h-10 mb-4"
        />
        <h3 className="text-[#12141D] font-semibold text-lg md:text-xl lg:text-2xl">
          Task Creation and Delegation
        </h3>
        <p className="text-[#12141D] text-sm md:text-base leading-6 opacity-70 max-w-[90%]">
          Convert your Plan of Correction into actionable task lists that are automatically assigned to appropriate team members with due dates and priority levels. Sync with Google & Microsoft Calendar to ensure all corrective actions and deadlines are tracked and managed effectively.
        </p>
      </div>
    </div>
  </section>
</section>

{/* for about us */}
<section className="flex flex-col items-center justify-center py-30 px-4 mb-20">
  <h2 className="text-gradient text-4xl font-bold mb-6">Why Us</h2>
  
  <p 
    className="text-center font-['Plus_Jakarta_Sans'] font-normal text-[16px] leading-[25.6px] text-[#010514] opacity-80"
    style={{ maxWidth: '1093px' }}
  >
    (Company Name) offers a comprehensive solution for compliance management, automating the process of generating plans of correction, creating new policies, and assigning tasks – all while collecting valuable data on recent inspection trends to keep you prepared. With (Company Name), your organization can respond quickly to regulatory demands, streamline compliance processes, saving you significant time and resources.
  </p>
</section>



      {/* FAQ Section */}
      <FAQSection />

    

     
    </section>
  );
};

export default Page;
