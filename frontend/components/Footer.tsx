import Image from "next/image";
import Link from "next/link";

import React from "react";
import {
  Phone,
  Mail,
  MoveRight,
  Linkedin,
  Facebook,
  Instagram,
} from "lucide-react";
import { Button } from "./ui/button";

const Footer = () => {
  return (
    <section>
      <div className="bg-footer-pattern bg-cover bg-center page-pad py-10 flex flex-row justify-between items-center flex-wrap gap-5">
        <div className="flex flex-col gap-10">
          <Image src="/assets/logo.png" alt="logo" width={100} height={30} />
          <p>Address Here</p>
          <span className="flex flex-row gap-2 font-semibold items-center">
            <Phone />
            +1 234-567-890
          </span>

          <span className="flex flex-row gap-2 font-semibold items-center">
            <Mail />
            anthony@dpp.com
          </span>
        </div>

        <div className="flex flex-col gap-10">
          <h2 className="text-lg font-semibold">Quick Links</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/" className="hover:text-blue-600 transition">
                Home
              </Link>
            </li>
            <li>Products</li>
            <li>
              <Link href="/AboutUs" className="hover:text-blue-600 transition">
                About
              </Link>
            </li>
            <li>
              <Link href="/privacypolicy" className="hover:text-blue-600 transition">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/termCondition" className="hover:text-blue-600 transition">
                Term & Condition
              </Link>
            </li>
            <li>Contact</li>
          </ul>
        </div>

        <div className="flex flex-col gap-5">
          <h2 className="text-lg font-semibold">
            Subscribe to our <br /> Newsletter!
          </h2>
          <div className="relative flex items-center ">
            <input
              type="email"
              placeholder="Email Address"
              className="p-2 rounded-3xl w-[250px] text-sm h-12"
            />
            <Button className="primary-btn !p-2 absolute right-1">
              <MoveRight />
            </Button>
          </div>
          <p className="text-lg font-semibold">Follow Us on</p>
          <span className="flex gap-2 text-primary">
            <Linkedin />
            <Facebook />
            <Instagram />
          </span>
        </div>
      </div>

      <div className="page-pad py-5 bg-black text-white flex flex-row justify-between">
        <p>© Company Name Here – All rights reserved</p>
        <span className="flex gap-5">
          <p>Terms and Conditions</p>
          <p>Privacy Policy</p>
          <p>Disclaimer</p>
        </span>
      </div>
    </section>
  );
};

export default Footer;
