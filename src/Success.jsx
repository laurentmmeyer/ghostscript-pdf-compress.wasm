import useAuth from "./useAuth.jsx";
import { useEffect } from "react";
import { linkWithPopup, unlink, GoogleAuthProvider } from "firebase/auth";
import "./Commercial.css";

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
        <div className={"app-flex app-flex-col app-gap-3"}>
          <p>
            Awesome! You just bought the <b>{product}</b> lifetime license.
          </p>
          <p>
            You can now compress as many PDF as you like on this page. <br />
          </p>
          <PurpleLink link="/" text="Compress PDFs"/>
          <PurpleLink link="https://billing.stripe.com/p/login/test_3cs7tB4AS5VV86c4gg" text="View my plan" newTab={true}/>
          {product === "Entreprise" && (
            <p>
              We'll be in touch soon to grant you access to an
              authentication-free version. <br />
              Should you require assistance with setting up your infrastructure,
              please don't hesitate to reach out{" "}
              <a
                className={"app-underline"}
                href={"mailto:contact@saferpdf.com"}
              >
                contact@saferpdf.com
              </a>
              .
            </p>
          )}
        </div>
      );
      break;
  }

  return (
    <div className="app-flex app-flex-col app-items-center app-justify-center">
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
          <div className="app-mt-4 app-text-center app-text-lg app-font-normal app-text-gray-700">
            {message}
          </div>
        </div>
      </div>
    </div>
  );
};

const PleaseAuth = ({ user: firebaseUser }) => {
  const handleLoginWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    linkWithPopup(firebaseUser, provider)
      .then((result) => {
        window.location.href = "/";
      })
      .catch((err) => alert(err.message));
  };

  return (
    <div className="app-bg-white app-rounded-lg app-p-6 app-shadow-md app-m-2 app-max-w-screen-md app-flex-col app-flex app-gap-3 justify-center">
      <p className="app-text-lg">
        Your subscription details have been stored locally on your computer.
        However, to ensure your subscription information remains accessible
        across different computers or browsers, please consider registering your
        Google account.
      </p>
      <div className={"app-flex app-justify-center"}>
        <button
          onClick={handleLoginWithGoogle}
          className="hover:app-cursor-pointer	app-flex app-items-center app-bg-white dark:app-bg-gray-900 app-border app-border-gray-300 app-rounded-lg app-shadow-md app-px-6 app-py-2 app-text-sm app-font-medium app-text-gray-800 dark:app-text-white hover:app-bg-gray-200 focus:app-outline-none focus:app-ring-2 focus:app-ring-offset-2 focus:app-ring-gray-500"
        >
          <svg
            className="app-h-6 app-w-6 app-mr-2"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            width="800px"
            height="800px"
            viewBox="-0.5 0 48 48"
            version="1.1"
          >
            <title>Google-color</title>
            <desc>Created with Sketch.</desc>
            <defs></defs>
            <g
              id="Icons"
              stroke="none"
              strokeWidth="1"
              fill="none"
              fillRule="evenodd"
            >
              <g
                id="Color-"
                app-transform="translate(-401.000000, -860.000000)"
              >
                <g
                  id="Google"
                  app-transform="translate(401.000000, 860.000000)"
                >
                  <path
                    d="M9.82727273,24 C9.82727273,22.4757333 10.0804318,21.0144 10.5322727,19.6437333 L2.62345455,13.6042667 C1.08206818,16.7338667 0.213636364,20.2602667 0.213636364,24 C0.213636364,27.7365333 1.081,31.2608 2.62025,34.3882667 L10.5247955,28.3370667 C10.0772273,26.9728 9.82727273,25.5168 9.82727273,24"
                    id="Fill-1"
                    fill="#FBBC05"
                  ></path>
                  <path
                    d="M23.7136364,10.1333333 C27.025,10.1333333 30.0159091,11.3066667 32.3659091,13.2266667 L39.2022727,6.4 C35.0363636,2.77333333 29.6954545,0.533333333 23.7136364,0.533333333 C14.4268636,0.533333333 6.44540909,5.84426667 2.62345455,13.6042667 L10.5322727,19.6437333 C12.3545909,14.112 17.5491591,10.1333333 23.7136364,10.1333333"
                    id="Fill-2"
                    fill="#EB4335"
                  ></path>
                  <path
                    d="M23.7136364,37.8666667 C17.5491591,37.8666667 12.3545909,33.888 10.5322727,28.3562667 L2.62345455,34.3946667 C6.44540909,42.1557333 14.4268636,47.4666667 23.7136364,47.4666667 C29.4455,47.4666667 34.9177955,45.4314667 39.0249545,41.6181333 L31.5177727,35.8144 C29.3995682,37.1488 26.7323182,37.8666667 23.7136364,37.8666667"
                    id="Fill-3"
                    fill="#34A853"
                  ></path>
                  <path
                    d="M46.1454545,24 C46.1454545,22.6133333 45.9318182,21.12 45.6113636,19.7333333 L23.7136364,19.7333333 L23.7136364,28.8 L36.3181818,28.8 C35.6879545,31.8912 33.9724545,34.2677333 31.5177727,35.8144 L39.0249545,41.6181333 C43.3393409,37.6138667 46.1454545,31.6490667 46.1454545,24"
                    id="Fill-4"
                    fill="#4285F4"
                  ></path>
                </g>
              </g>
            </g>
          </svg>
          <span>Continue with Google</span>
          {/* Consider using a local or hosted image that represents "Sign in with Google" */}
        </button>
      </div>
      <p className="app-text-lg">
        If you have any problem, please contact{" "}
        <a className={"app-underline"} href={"mailto:contact@saferpdf.com"}>
          contact@saferpdf.com
        </a>
      </p>
    </div>
  );
};

function PurpleLink({ text, link, newTab = false }) {
  return (
    <a
      href={link}
      className="hover:app-cursor-pointer hover:app-text-white app-px-4 app-py-2 app-bg-purple-900 app-text-white app-rounded hover:app-bg-purple-800 app-transition app-duration-150 app-ease-in-out"
    >
      {text}
    </a>
  );
}

const Success = () => {
  const { refreshAuth, loading, user } = useAuth();

  useEffect(() => refreshAuth, []);

  if (loading) {
    return (
      <div className="app-flex app-justify-center app-items-center">
        <p className="app-text-lg app-font-semibold">Loading...</p>
      </div>
    );
  }
  const unlinkDebug = () => {
    unlink(user.firebaseUser, new GoogleAuthProvider().providerId).then(
      console.log,
    );
  };

  if (!user.firestoreUser?.mode) {
    return (
      <div className={"app-flex app-flex-col app-gap-3"}>
        <p className="app-text-lg app-font-semibold app-max-w-screen-md">
          No subscription found
        </p>
        <PurpleLink text="Go to pricing" link={"/pricing"} />
      </div>
    );
  }

  return (
    <div className="app-flex app-flex-col app-items-center app-justify-center app-gap-4">
      <div className="app-text-lg app-font-semibold app-max-w-screen-md	">
        <SuccessMessage
          purchaseType={user?.firestoreUser?.mode}
          product={user?.firestoreUser?.productDescription}
        />
      </div>
      {!user.firebaseUser.providerData.length && (
        <PleaseAuth user={user.firebaseUser} />
      )}
      <div onClick={unlinkDebug}>Unlink</div>
    </div>
  );
};

export default Success;
