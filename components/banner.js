import { logo } from "./styles/banner.module.css";

const subtitleStyle = {
  fontStyle: "italic",
  fontSize: "x-large",
  color: "coral",
};

const Banner = () => {
  return (
    <header className="row mb-3">
      <div className="col-3">
        <img src="./SitcomEnglishLab.png" alt="logo" className={logo} />
      </div>
      <div className="col-6 mt-2 text-center" style={subtitleStyle}>
        Laugh It to Fluency!
      </div>
    </header>
  );
};

export default Banner;
