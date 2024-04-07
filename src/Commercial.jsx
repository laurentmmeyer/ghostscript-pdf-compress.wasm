import React, { useEffect, useState } from "react";
// Assuming MyDropzone is a component you have created or imported
import DropZone from "./FileDropBox.jsx";
import "./Commercial.css";
import useAuth from "./useAuth.jsx";

function Commercial({ children }) {
  const [pricing, setPricing] = useState(false);
  const { refreshAuth, loading, user } = useAuth();

  useEffect(() => refreshAuth, []);

  const hasChildren = React.Children.count(children) > 0;
  const onLimitReached = () => {
    setPricing((_) => true);
  };

  const onClose = () => {
    setPricing((_) => false);
  };

  return (
    <>
      <div className="h-screen w-full flex flex-col text-black">
        {/* Top Navigation Bar */}
        <nav className="bg-purple-900 shadow">
          <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              {/* Company Title */}
              <div className="flex-shrink-0 flex items-center">
                <a
                  href="/"
                  className="text-lg text-purple-100 hover:text-white font-medium font-dm flex-row flex justify-center items-center"
                >
                  <img
                    src="/src/assets/pdf.png"
                    alt="Your Company Logo"
                    className="h-5 w-5 mr-2"
                  />{" "}
                  {/* Adjust path as necessary */}
                  SaferPDF
                </a>
              </div>
              {/* Navigation Items */}
              <div className="flex">
                <div className="flex-shrink-0 flex items-center space-x-5">
                  {/* Navigation Item: Pricing */}
                  <a
                    href="/"
                    className="text-lg text-purple-100 hover:text-white font-medium font-dm"
                  >
                    Compress
                  </a>
                  <a
                    href="/pricing"
                    className="text-lg text-purple-100 hover:text-white font-medium font-dm"
                  >
                    Pricing
                  </a>
                  <a
                    href="/blog"
                    className="text-lg text-purple-100 hover:text-white font-medium font-dm"
                  >
                    Blog
                  </a>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="bg-purple-100 w-full flex-grow flex flex-col items-center justify-center p-4">
          {!hasChildren && !loading && (
            <>
              <h1 className="text-center text-blue font-bold text-4xl mb-4 font-raleway">
                Your PDFs have never been safer.
              </h1>
              <p className="max-w-xl text-center text-lg mb-6 font-sans ">
                This PDF compressor works right in your browser using the latest
                web technologies, meaning it does not rely on external servers.
                <br />
                <b>We do not send your files anywhere.</b>
                <br />
                <i>We cannot leak data we never had.</i>
                <br />
                <b>Safe, fast, and private</b> - all without leaving your
                browser.
              </p>
              <div className="w-full max-w-md">
                <DropZone onLimitReached={onLimitReached} user={user} />
              </div>
            </>
          )}

          {loading && <p>Loading...</p>}

          {!loading && <div className={"w-full"}>{children}</div>}
        </main>

        <footer className="bg-white w-full flex items-center justify-center	">
          <div className=" py-4 text-center flex space-x-4">
            <a
              href="/legal/general_terms_of_use.html"
              target={"_blank"}
              className="hover:underline text-black font-dm"
              rel="noopener noreferrer"
            >
              Terms of use
            </a>
            <a
              href="/legal/saas_terms_of_use.html"
              target={"_blank"}
              className="hover:underline text-black font-dm"
              rel="noopener noreferrer"
            >
              SAAS Terms of use
            </a>
            <a
              href="/legal/privacy_policy.html"
              target={"_blank"}
              className="hover:underline text-black font-dm"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </a>
            <a
              href="https://github.com/laurentmmeyer/ghostscript-pdf-compress.wasm"
              target={"_blank"}
              className="hover:underline text-black font-dm"
              rel="noopener noreferrer"
            >
              Source Code
            </a>
          </div>
        </footer>
        <div
          className={`${pricing ? "" : "hidden"} fixed inset-0 bg-purple-900 bg-opacity-20 overflow-y-auto h-full w-full flex items-center justify-center`}
          onClick={onClose}
        >
          <div className="relative mx-auto p-3 border w-96 shadow-lg rounded-md bg-white">
            <div className="text-right">
              <button
                onClick={onClose}
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </button>
            </div>
            <div className="text-center p-3 flex-auto justify-center">
              <p className="font-dm text-gray-900 text-lg leading-relaxed">
                You're loving our product! You cannot convert more than 10
                documents in 24 hours. For more, you need our Pro model.
              </p>
            </div>
            <div className="p-3 mt-2 text-center space-x-4 md:block">
              <a
                href="/pricing" // Change this to your pricing page URL
                className="mb-2 md:mb-0 bg-purple-900 px-5 py-2 text-sm shadow-sm font-medium tracking-wider text-white rounded-full hover:shadow-lg hover:bg-purple-800"
                role="button"
              >
                Go to Pricing
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Commercial;
