import { logo } from "./styles/banner.module.css";

const Banner = () => {
  return (
    <header className="row mb-1 mt-1">
      <div className="col-6 col-md-2">
        <img src="./Tube2Fluency5a.png" alt="logo" className={logo} />
      </div>
      <div className="col-4 mt-5 text-center fs-3 fw-bold fst-italic" style={{ color: '#ee3e38' }}>
        The Tube to Fluency
      </div>
    </header>
  );
};

export default Banner;
