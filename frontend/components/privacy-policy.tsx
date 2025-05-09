"use client";
import React from "react";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="py-6 px-20 bg-white">
      {/* Profile Header */}

      <h1 className="text-4xl font-bold text-center mb-18">Privacy Policy</h1>

  
      <h2 className="text-lg font-bold mb-4">Introduction</h2>
      <p className="text-gray-700 mb-6">
        At Document Processing Plateform (DPP), your privacy is our priority.
        This Privacy Policy explains how we collect, use, and safeguard your
        <br /> information when you interact with our website and services. By
        using our website, you consent to the practices described here.
      </p>

      {/* Section: Information We Collect */}
      <h2 className="text-lg font-bold mb-4">Information We Collect</h2>
      <p className="text-gray-700 mb-6">
        We collect both personal and non-personal information to enhance your
        experience and ensure the functionality of our platform. Information You
        Provide
        <br />
        This includes your name, email address, and details related to peer
        evaluations or inquiries submitted to us.
        <br />
        Automatically Collected Information We gather information like IP
        addresses, browser details, and device data to analyze website <br />
        usage and improve performance. Third-Party Sources If you log in through
        third-party platforms, we may collect authorized data from those
        services.
      </p>

      {/* Section: How We Use Your Information */}
      <h2 className="text-lg font-bold mb-4">How We Use Your Information</h2>
      <p className="text-gray-700 mb-6">
        The information collected is used to provide and improve our services,
        including account management, peer evaluation processing, and
        <br /> resolving support requests. We may also use it to analyze usage
        patterns and enhance security measures.
      </p>

      {/* Section: How We Share Your Information */}
      <h2 className="text-lg font-bold mb-4">How We Share Your Information</h2>
      <p className="text-gray-700 mb-6">
        We do not sell your personal information. However, we may share data
        with:
      </p>
      <ul className="list-disc pl-6 mb-6">
        <li className="text-gray-700 mb-2">
          <strong>Service Providers:</strong> Third parties that assist us in
          delivering our services.
        </li>
        <li className="text-gray-700">
          <strong>Legal Obligations:</strong> Authorities, if required by law or
          for legal compliance.
        </li>
      </ul>

      {/* Section: Data Retention */}
      <h2 className="text-lg font-bold mb-4">Data Retention</h2>
      <p className="text-gray-700 mb-6">
        We retain your information only as long as necessary to provide
        services, comply with legal obligations, or improve our platform. Once
        no longer needed, we securely delete or anonymize the data.
      </p>

      {/* Section: Your Rights */}
      <h2 className="text-lg font-bold mb-4">Your Rights</h2>
      <p className="text-gray-700 mb-6">
        Depending on your location, you may have rights under data protection
        laws, such as accessing, updating, or deleting your personal
        information. Contact us to exercise these rights.
      </p>

      {/* Section: Cookies and Tracking */}
      <h2 className="text-lg font-bold mb-4">
        Cookies and Tracking Technologies
      </h2>
      <p className="text-gray-700 mb-6">
        We use cookies to enhance your experience, save preferences, and analyze
        site traffic. You can manage cookie preferences through your browser
        settings.
      </p>

      {/* Section: Security */}
      <h2 className="text-lg font-bold mb-4">Security of Your Information</h2>
      <p className="text-gray-700 mb-6">
        We implement advanced security measures to protect your data from
        unauthorized access, disclosure, or loss. However, no method of
        transmission or storage is entirely secure.
      </p>

      {/* Section: Changes */}
      <h2 className="text-lg font-bold mb-4">Changes to This Policy</h2>
      <p className="text-gray-700 mb-6">
        We may update this Privacy Policy from time to time. Any changes will be
        posted here, and the “Last Updated” date will reflect the most recent
        update.
      </p>

      {/* Section: Contact */}
      <h2 className="text-lg font-bold mb-4">Contact Us</h2>
      <p className="text-gray-700 mb-2">
        For any questions or concerns about this Privacy Policy or your data,
        please contact us at:
      </p>
      <ul className="list-disc pl-6">
        <li className="text-gray-700">Email:sample@gmail.com </li>
        <li className="text-gray-700">Address: P-000 Faisalabad Pakistan</li>
      </ul>
    </div>
  );
};

export default PrivacyPolicy;
