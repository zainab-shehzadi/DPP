"use client";
import React from "react";

const TermCondition: React.FC = () => {
  return (
    <div className="py-6 px-20 bg-white ">
      <h1 className="text-3xl font-bold mb-14 text-center">Term and Condition</h1>

      {/* Section: Introduction */}
      <h2 className="text-lg font-bold mb-4">Introduction</h2>
      <p className="text-gray-700 mb-6">
        Welcome to the Digital Peer Grading System (DPGS). These Terms and
        Conditions govern your use of our website and services. By accessing or{" "}
        <br /> using our platform, you agree to comply with these terms. If you
        do not agree, please refrain from using our services.
      </p>

      {/* Section: Information We Collect */}
      <h2 className="text-lg font-bold mb-4">Eligibility</h2>
      <p className="text-gray-700 mb-6">
        You must be at least 18 years old or have parental/guardian consent to
        use our services. By using DPGS, you confirm that all information <br />
        provided is accurate and that you meet these eligibility requirements.
      </p>

      {/* Section: How We Use Your Information */}
      <h2 className="text-lg font-bold mb-4">User Accounts</h2>
      <p className="text-gray-700 mb-6">
        To access certain features, you may need to create an account. You are
        responsible for maintaining the confidentiality of your account <br />
        credentials and for all activities performed under your account. Notify
        us immediately of any unauthorized use or security breach
      </p>

      {/* Section: Acceptable Use */}
      <h2 className="text-lg font-bold mb-4">Acceptable Use</h2>
      <p className="text-gray-700 mb-4">
        You agree to use DPGS only for lawful purposes and in compliance with
        these terms. You must not:
      </p>
      <ul className="list-disc pl-6 mb-6">
        <li className="text-gray-700 mb-2">
          Violate any applicable laws or regulations.
        </li>
        <li className="text-gray-700 mb-2">
          Upload or distribute harmful, defamatory, or objectionable content.
        </li>
        <li className="text-gray-700 mb-2">
          Attempt to disrupt or compromise the platform &apos; s security.
        </li>
      </ul>
      <p className="text-gray-700 mb-6">
        We reserve the right to suspend or terminate your account for violations
        of this section.
      </p>

      {/* Section: Peer Evaluation Guidelines */}
      <h2 className="text-lg font-bold mb-4">Peer Evaluation Guidelines</h2>
      <p className="text-gray-700 mb-6">
        By submitting peer evaluations, you agree to provide fair, constructive,
        and honest feedback. Misuse of the evaluation system, including
        falsified submissions, may result in penalties or account suspension.
      </p>

      {/* Section: Intellectual Property */}
      <h2 className="text-lg font-bold mb-4">Intellectual Property</h2>
      <p className="text-gray-700 mb-6">
        All content, features, and functionality on the DPGS platform are owned
        by us or licensed to us and are protected by intellectual property laws.
        You may not reproduce, distribute, or modify any content without our
        explicit permission.
      </p>

      {/* Section: Limitation of Liability */}
      <h2 className="text-lg font-bold mb-4">Limitation of Liability</h2>
      <p className="text-gray-700 mb-6">
        DPGS is provided on an &quot; as-is &quot; and &quot; as-available
        &quot; basis. We do not guarantee uninterrupted or error-free service.
        To the maximum extent permitted by law, DPGS and its affiliates are not
        liable for any indirect, incidental, or consequential damages arising
        from your use of the platform.
      </p>

      {/* Section: Termination */}
      <h2 className="text-lg font-bold mb-4">Termination</h2>
      <p className="text-gray-700 mb-6">
        We may suspend or terminate your access to the platform at any time,
        without prior notice, for any violation of these terms or if required by
        law. You may terminate your account by contacting us.
      </p>

      {/* Section: Modifications to Terms */}
      <h2 className="text-lg font-bold mb-4">Modifications to Terms</h2>
      <p className="text-gray-700 mb-6">
        We reserve the right to update these Terms and Conditions at any time.
        Any changes will be posted here, with the “Last Updated” date reflecting
        the latest version. Continued use of DPGS after changes indicates your
        acceptance of the updated terms.
      </p>

      {/* Section: Governing Law */}
      <h2 className="text-lg font-bold mb-4">Governing Law</h2>
      <p className="text-gray-700 mb-6">
        These terms are governed by and construed under the laws of [Insert
        Jurisdiction]. Any disputes arising from these terms will be resolved in
        the courts of [Insert Jurisdiction].
      </p>

      {/* Section: Contact Information */}
      <h2 className="text-lg font-bold mb-4">Contact Information</h2>
      <p className="text-gray-700 mb-2">
        If you have any questions or concerns about these terms, please contact
        us at:
      </p>
      <ul className="list-disc pl-6 mb-6">
        <li className="text-gray-700">Email: sample@gmail.com</li>
        <li className="text-gray-700">Address: P-000 Faisalabad Pakistan</li>
      </ul>
    </div>
  );
};

export default TermCondition;
