import {ClimbingBoxLoader, MoonLoader} from "react-spinners";

const LoadingButton = () => (
  <div className={"app-flex-row app-flex app-gap-1 app-items-center app-justify-center"}>
    <button className="app-flex  app-bg-purple-900 app-text-white app-px-4 app-rounded">
      <MoonLoader color={'white'} size={20}/>
    </button>
  </div>
);
export default LoadingButton;
