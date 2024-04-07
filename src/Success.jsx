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
              <a className={"underline"} href={"mailto:contact@saferpdf.com"}>
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
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="bg-white rounded-lg p-6 shadow-md">
        <div className="flex flex-col items-center">
          {/* Green check icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-green-500"
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
          <div className="mt-4 text-center text-2xl font-semibold text-gray-700">
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
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold">Loading...</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <div className="text-lg font-semibold max-w-screen-md	">
        <SuccessMessage
          purchaseType={user?.firestoreUser?.mode}
          product={user?.firestoreUser?.productDescription}
        />
      </div>
      <div className="flex flex-col items-center gap-2">
        <a
          href="https://dashboard.stripe.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-purple-900 text-white rounded hover:bg-purple-800 transition duration-150 ease-in-out"
        >
          View my plan
        </a>
        <button
          onClick={handleLoginWithGoogle}
          className="bg-white p-2 rounded shadow hover:shadow-md transition duration-150 ease-in-out"
        >
          <img
            src="https://freesvg.org/img/1534129544.png"
            alt="Google sign-in"
            className="h-8"
          />
          {/* Consider using a local or hosted image that represents "Sign in with Google" */}
        </button>
      </div>
    </div>
  );
};

export default Success;
