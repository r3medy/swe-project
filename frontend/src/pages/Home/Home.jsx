import { Link, useNavigate } from "react-router";

import "@/pages/Home/Home.css";
import { useSession } from "@/contexts/SessionContext";

import {
  LightRays,
  SearchBar,
  CurrencyBox,
  Navigation,
  SmallText,
} from "@/components";

const Home = () => {
  const { user } = useSession();
  const navigate = useNavigate();

  const handleSearch = (searchTerm) => {
    if (searchTerm?.trim())
      navigate(`/wall?q=${encodeURIComponent(searchTerm.trim())}`);
    else navigate("/wall");
  };
  return (
    <div className="home-page">
      <LightRays
        raysOrigin="top-center"
        raysColor="#FF6B53"
        raysSpeed={1.5}
        lightSpread={1}
        rayLength={1}
        followMouse={true}
        mouseInfluence={0.1}
        noiseAmount={0.1}
        distortion={0.1}
        className="custom-rays"
      />
      <Navigation />
      <div className="hero-content">
        <div className="hero-currency-box">
          <CurrencyBox currency="$" />
          <CurrencyBox currency="€" />
          <CurrencyBox currency="£" />
          <CurrencyBox currency="¥" />
          <CurrencyBox currency="₹" />
        </div>
        <h1 className="hero-text">
          <span className="hero-text-primary">Freelancing,</span>
          <br />
          <span className="hero-text-secondary">Reimagined.</span>
          <br />
          <span className="hero-sub-text">
            Where talent meets opportunity. seamlessly, securely, and on your
            terms.
          </span>
        </h1>
        <div className="hero-search">
          <SearchBar onSearch={handleSearch} />
          {!user ? (
            <>
              <SmallText text="Do you prefer to work as a freelancer?">
                <Link to="/register">Start now</Link>
              </SmallText>
              <SmallText text="Are you an existing user?">
                <Link to="/login">Login</Link>
              </SmallText>
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
