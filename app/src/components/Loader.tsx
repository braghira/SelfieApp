import loader from "../assets/loader.svg";

const Loader = () => (
  <div className="flex-center w-full">
    <img
      src={loader}
      alt="loading icon"
      width={24}
      height={24}
      className="animate-spin"
    />
  </div>
);

export default Loader;
