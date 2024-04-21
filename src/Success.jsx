import useAuth from "./useAuth.jsx";
import { useEffect } from "react";
import { signInWithRedirect, GoogleAuthProvider } from "firebase/auth";
import { auth } from "./firebase-setup";

const SuccessMessage = ({ purchaseType, product }) => {
  // Determine the message based on the purchase type
  let message;
  switch (purchaseType) {
    case "subscription":
      message = (
        <span>
          Congratulations! You've successfully subscribed to the
          <b>{product} licence</b>
        </span>
      );
      break;
    case "payment":
      message = (
        <>
          <p>
            Awesome! You've made a lifetime payment for the <b>{product}</b>{" "}
            license.
          </p>
          <p>
            You can now convert as many PDF as you like on this page. <br />
          </p>
          {product === "Entreprise" && (
            <p>
              We'll be in touch soon to grant you access to an
              authentication-free version. <br />
              Should you require assistance with setting up your infrastructure,
              please don't hesitate to reach out{" "}
              <a className={"app-underline"} href={"mailto:contact@saferpdf.com"}>
                contact@saferpdf.com
              </a>
              .{" "}
            </p>
          )}
        </>
      );
      break;
  }

  return (
    <div className="app-flex app-flex-col app-items-center app-justify-center app-h-screen">
      <div className="app-bg-white app-rounded-lg app-p-6 app-shadow-md">
        <div className="app-flex app-flex-col app-items-center">
          {/* Green check icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="app-h-16 app-w-16 app-text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {/* Display the determined message */}
          <div className="app-mt-4 app-text-center app-text-2xl app-font-semibold app-text-gray-700">
            {message}
          </div>
        </div>
      </div>
    </div>
  );
};

const Success = () => {
  const { refreshAuth, loading, user } = useAuth();

  useEffect(() => refreshAuth, []);

  const handleLoginWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithRedirect(auth, provider);
  };

  if (loading) {
    return (
      <div className="app-flex app-justify-center app-items-center app-h-screen">
        <p className="app-text-lg app-font-semibold">Loading...</p>
      </div>
    );
  }
  return (
    <div className="app-flex app-flex-col app-items-center app-justify-center app-h-screen app-gap-4">
      <div className="app-text-lg app-font-semibold app-max-w-screen-md	">
        <SuccessMessage
          purchaseType={user?.firestoreUser?.mode}
          product={user?.firestoreUser?.productDescription}
        />
      </div>
      <div className="app-flex app-flex-col app-items-center app-gap-2">
        <a
          href="https://dashboard.stripe.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="app-px-4 app-py-2 app-bg-purple-900 app-text-white app-rounded hover:app-bg-purple-800 app-transition app-duration-150 app-ease-in-out"
        >
          View my plan
        </a>
        <button
          onClick={handleLoginWithGoogle}
          className="app-bg-white app-p-2 app-rounded app-shadow hover:app-shadow-md app-transition app-duration-150 app-ease-in-out"
        >
          <img
            src="https://freesvg.org/img/1534129544.png"
            alt="Google sign-in"
            className="app-h-8"
          />
          {/* Consider using a local or hosted image that represents "Sign in with Google" */}
        </button>
      </div>
    </div>
  );
};

export default Success;
