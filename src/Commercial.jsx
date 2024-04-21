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
      <div className="app-w-full app-flex app-flex-col app-text-black">
        {/* Top Navigation Bar */}
        {/*<nav className="app-bg-purple-900 app-shadow">*/}
        {/*  <div className="max-w-9xl app-mx-auto app-px-4 sm:app-px-6 lg:app-px-8">*/}
        {/*    <div className="app-flex app-justify-between app-h-16">*/}
        {/*      /!* Company Title *!/*/}
        {/*      <div className="app-flex-shrink-0 app-flex app-items-center">*/}
        {/*        <a*/}
        {/*          href="/"*/}
        {/*          className="app-text-lg app-text-purple-100 hover:app-text-white app-font-medium font-dm app-flex-row app-flex app-justify-center app-items-center"*/}
        {/*        >*/}
        {/*          <img*/}
        {/*            src="/pdf.png"*/}
        {/*            alt="SaferPDF"*/}
        {/*            className="app-h-5 app-w-5 app-mr-2"*/}
        {/*          />*/}
        {/*          SaferPDF*/}
        {/*        </a>*/}
        {/*      </div>*/}
        {/*      /!* Navigation Items *!/*/}
        {/*      <div className="app-flex">*/}
        {/*        <div className="app-flex-shrink-0 app-flex app-items-center app-space-x-5">*/}
        {/*          /!* Navigation Item: Pricing *!/*/}
        {/*          <a*/}
        {/*            href="/"*/}
        {/*            className="app-text-lg app-text-purple-100 hover:app-text-white app-font-medium font-dm"*/}
        {/*          >*/}
        {/*            Compress*/}
        {/*          </a>*/}
        {/*          <a*/}
        {/*            href="/pricing"*/}
        {/*            className="app-text-lg app-text-purple-100 hover:app-text-white app-font-medium font-dm"*/}
        {/*          >*/}
        {/*            Pricing*/}
        {/*          </a>*/}
        {/*          <a*/}
        {/*            href="/blog"*/}
        {/*            className="app-text-lg app-text-purple-100 hover:app-text-white app-font-medium font-dm"*/}
        {/*          >*/}
        {/*            Blog*/}
        {/*          </a>*/}
        {/*        </div>*/}
        {/*      </div>*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*</nav>*/}

        {/* Main Content */}
        <div className="app-bg-purple-100 app-w-full app-flex-grow app-flex app-flex-col app-items-center app-justify-center app-p-4">
          {!hasChildren && !loading && (
            <>
              <h1 className="app-text-center text-blue app-font-bold app-text-4xl app-mb-4 font-raleway">
                Your PDFs have never been safer.
              </h1>
              <p className="app-max-w-xl app-text-center app-text-lg app-mb-6 app-font-sans ">
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
              <div className="app-w-full app-max-w-md">
                <DropZone onLimitReached={onLimitReached} user={user} />
              </div>
            </>
          )}

          {loading && <p>Loading...</p>}

          {!loading && <div className={"app-w-full"}>{children}</div>}
        </div>

        {/*<footer className="app-bg-white app-w-full app-flex app-items-center app-justify-center	">*/}
        {/*  <div className=" app-py-4 app-text-center app-flex app-space-x-4">*/}
        {/*    <a*/}
        {/*      href="/legal/general_terms_of_use.html"*/}
        {/*      target={"_blank"}*/}
        {/*      className="hover:app-underline app-text-black font-dm"*/}
        {/*      rel="noopener noreferrer"*/}
        {/*    >*/}
        {/*      Terms of use*/}
        {/*    </a>*/}
        {/*    <a*/}
        {/*      href="/legal/saas_terms_of_use.html"*/}
        {/*      target={"_blank"}*/}
        {/*      className="hover:app-underline app-text-black font-dm"*/}
        {/*      rel="noopener noreferrer"*/}
        {/*    >*/}
        {/*      SAAS Terms of use*/}
        {/*    </a>*/}
        {/*    <a*/}
        {/*      href="/legal/privacy_policy.html"*/}
        {/*      target={"_blank"}*/}
        {/*      className="hover:app-underline app-text-black font-dm"*/}
        {/*      rel="noopener noreferrer"*/}
        {/*    >*/}
        {/*      Privacy Policy*/}
        {/*    </a>*/}
        {/*    <a*/}
        {/*      href="https://github.com/laurentmmeyer/ghostscript-pdf-compress.wasm"*/}
        {/*      target={"_blank"}*/}
        {/*      className="hover:app-underline app-text-black font-dm"*/}
        {/*      rel="noopener noreferrer"*/}
        {/*    >*/}
        {/*      Source Code*/}
        {/*    </a>*/}
        {/*  </div>*/}
        {/*</footer>*/}
        <div
          className={`${pricing ? "" : "app-hidden"} app-fixed app-inset-0 app-bg-purple-900 app-bg-opacity-20 app-overflow-y-auto app-h-full app-w-full app-flex app-items-center app-justify-center`}
          onClick={onClose}
        >
          <div className="app-relative app-mx-auto app-p-3 app-border app-w-96 app-shadow-lg app-rounded-md app-bg-white">
            <div className="app-text-right">
              <button
                onClick={onClose}
                className="app-text-gray-400 app-bg-transparent hover:app-bg-gray-200 hover:app-text-gray-900 app-rounded-lg app-text-sm app-p-1.5 app-ml-auto app-inline-flex app-items-center"
              >
                <svg
                  className="app-w-5 app-h-5"
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
            <div className="app-text-center app-p-3 app-flex-auto app-justify-center">
              <p className="font-dm app-text-gray-900 app-text-lg app-leading-relaxed">
                You're loving our product! You cannot convert more than 10
                documents in 24 hours. For more, you need our Pro model.
              </p>
            </div>
            <div className="app-p-3 app-mt-2 app-text-center app-space-x-4 md:app-block">
              <a
                href="/pricing" // Change this to your pricing page URL
                className="app-mb-2 md:app-mb-0 app-bg-purple-900 app-px-5 app-py-2 app-text-sm app-shadow-sm app-font-medium app-tracking-wider app-text-white app-rounded-full hover:app-shadow-lg hover:app-bg-purple-800"
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
