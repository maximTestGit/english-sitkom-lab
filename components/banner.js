import { logo } from "./styles/banner.module.css";

const subtitleStyle = {
  fontStyle: "italic",
  fontSize: "x-large",
  color: "coral",
};

const Banner = () => {
  return (
    <header className="row mb-1 mt-1">
      <div className="col-3">
        <img src="./Tube2Fluency5a.png" alt="logo" className={logo} />
      </div>
      <div className="col-6 mt-5 mb-2 text-center" style={subtitleStyle}>
        Tube2Fluency
      </div>
    </header>
  );
};

export default Banner;
