import loader from "../assets/loader.svg";

export default function Loader() {
  return (
    <div className="flex-center w-full">
      <img
        src={loader}
        alt="loading-icon"
        width={24}
        height={24}
        className="animate-spin"
      />
    </div>
  );
}
