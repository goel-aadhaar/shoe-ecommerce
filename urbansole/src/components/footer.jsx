import React from "react";
import { Instagram, Facebook } from "lucide-react";



export default function Footer() {
    console.log('footer Called......');
    
  return (
    <footer className="w-full bg-black text-white pt-6 ps-5">
      {/* Top Section */}
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6">
        {/* Information */}
        {/* <div> */}
          <ul className="text-left">
            <li className="text-xl font-bold pb-3">INFORMATION</li>
            <li><a href="#" className="hover:text-red-500 text-sm text-white">ABOUT US</a></li>
            <li><a href="#" className="hover:text-red-500 text-sm text-white">CONTACT US</a></li>
            <li><a href="#" className="hover:text-red-500 text-sm text-white">RELEASES</a></li>
            <li><a href="#" className="hover:text-red-500 text-sm text-white">STORE LOCATOR</a></li>
            <li><a href="#" className="hover:text-red-500 text-sm text-white">BRANDS</a></li>
            <li><a href="#" className="hover:text-red-500 text-sm text-white">BLOGS</a></li>
          </ul>
        {/* </div> */}

        {/* Important Links */}
        {/* <div> */}
          <ul className="text-left">
            <li className="text-xl font-bold pb-3">IMPORTANT LINKS</li>
            <li><a href="#" className="hover:text-red-500 text-sm text-white" >HELP CENTER</a></li>
            <li><a href="#" className="hover:text-red-500 text-sm text-white">FAQ</a></li>
            <li><a href="#" className="hover:text-red-500 text-sm text-white">PRIVACY POLICY</a></li>
            <li><a href="#" className="hover:text-red-500 text-sm text-white">PARTNER WITH US</a></li>
            <li><a href="#" className="hover:text-red-500 text-sm text-white">RETURN & EXCHANGE</a></li>
            <li><a href="#" className="hover:text-red-500 text-sm text-white">TERMS & CONDITIONS</a></li>
            <li><a href="#" className="hover:text-red-500 text-sm text-white">ORDER & SHIPPING</a></li>
          </ul>
        {/* </div> */}

        {/* Newsletter */}
        <div className= 'text-left w-50'>
          <p className="text-xl font-bold pb-2">NEWSLETTER</p>
          <p className="text-left text-sm">GET TO KNOW MORE ABOUT TRENDS & STYLE</p>
          <form>
            <input
              type="email"
              placeholder="EMAIL"
              className="w-full px-3 py-2 mb-1 rounded-md bg-white text-black placeholder-gray-500 outline-none"
            />
            <button
              type="submit"
              id="footerBtn"
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
            >
              SUBSCRIBE
            </button>
          </form>

          {/* Social Media */}
          <div className="mt-1">
            <p className="text-base font-bold">SOCIAL MEDIA</p>
            <div className="text-left flex items-center mt-2 space-x-4">
              <a
                href="https://www.instagram.com/yourprofile"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-pink-500 text-xl"
              >
                <Instagram className="w-6 h-6 text-pink-600" />
              </a>
              <a
                href="https://www.facebook.com/yourprofile"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-500 text-xl"
              >
                <Facebook className="w-6 h-6 text-blue-600" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-6 px-6">
        <p className="text-sm">
          POWERED BY <a href="#" className="hover:text-red-500">MARMETO</a>
        </p>
      </div>
    </footer>
  );
}
