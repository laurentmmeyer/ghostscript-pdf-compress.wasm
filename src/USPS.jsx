import React from "react";
import { PurpleLink } from "./PurpleLink.jsx";

function Check() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 30 30"
      width="30px"
      height="30px"
      className={"app-fill-purple-900"}
    >
      <path d="M 15 3 C 8.373 3 3 8.373 3 15 C 3 21.627 8.373 27 15 27 C 21.627 27 27 21.627 27 15 C 27 12.820623 26.409997 10.783138 25.394531 9.0214844 L 14.146484 20.267578 C 13.959484 20.454578 13.705453 20.560547 13.439453 20.560547 C 13.174453 20.560547 12.919422 20.455578 12.732422 20.267578 L 8.2792969 15.814453 C 7.8882969 15.423453 7.8882969 14.791391 8.2792969 14.400391 C 8.6702969 14.009391 9.3023594 14.009391 9.6933594 14.400391 L 13.439453 18.146484 L 24.240234 7.3457031 C 22.039234 4.6907031 18.718 3 15 3 z M 24.240234 7.3457031 C 24.671884 7.8662808 25.053743 8.4300516 25.394531 9.0195312 L 27.707031 6.7070312 C 28.098031 6.3150312 28.098031 5.6839688 27.707031 5.2929688 C 27.316031 4.9019687 26.683969 4.9019688 26.292969 5.2929688 L 24.240234 7.3457031 z" />
    </svg>
  );
}

function USPItem({ text }) {
  return (
    <li className="app-flex app-items-start app-my-2">
      <div className={"app-w-4 app-mr-2"}>
        <Check />
      </div>
      <span className="app-ml-3 app-text-lg app-text-gray-700">{text}</span>
    </li>
  );
}

function USPS() {
  return (
    <div className="p-8">
      <div className="app-text-2xl app-font-bold app-text-gray-900 app-mb-4 app-font-raleway">
        The SaferPDF difference
      </div>
      <ul className="app-list-none">
        <USPItem
          text={"The interface is super easy to use, just drag, drop, compress"}
        />
        <USPItem
          text={
            "Your files get compressed on your device (and are there to stay!)"
          }
        />
        <USPItem text={"Your data can not get leaked"} />
        <USPItem text={"You get lifetime access to our tool*"} />
        <div className={"app-w-full app-mt-8 app-text-center"}>
          <PurpleLink link="/pricing" text="Get SaferPDF" />
        </div>
      </ul>
    </div>
  );
}

export default USPS;
