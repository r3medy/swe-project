import "@/pages/Home/Home.css";
import LightRays from "@/components/LightRays/LightRays.jsx";
import SearchBar from "@/components/SearchBar/SearchBar.jsx";
import CurrencyBox from "@/components/CurrencyBox/CurrencyBox.jsx";
import Navigation from "@/components/Navigation/Navigation.jsx";
import { useTheme } from "@/contexts/ThemeContext";

export default function Home() {
  const { theme } = useTheme();
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
          <SearchBar />
          <span>
            Do you prefer to work as a freelancer? <a href="#">Start now!</a>
          </span>
          <span>
            Are you an existing user? <a href="#">Login!</a>
          </span>
        </div>
      </div>
    </div>
  );
}
