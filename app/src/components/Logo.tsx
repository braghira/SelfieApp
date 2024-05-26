import logo from "../assets/trace.svg";

export default function Logo() {
  return (
    <div className="flex-center gap-3">
      <div className="logo">Selfie</div>
      <img src={logo} alt="logo" className="h-32 rounded-full" />
    </div>
  );
}
