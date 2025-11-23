import "@/pages/Home/Home.css";
import LightRays from "@/components/LightRays/LightRays.jsx";

export default function Home() {
  return (
    <div className="home-page">
      <LightRays
        raysOrigin="top-center"
        raysColor="#EEF1F9"
        raysSpeed={1.5}
        lightSpread={0.8}
        rayLength={1.2}
        followMouse={true}
        mouseInfluence={0.1}
        noiseAmount={0.1}
        distortion={0.05}
        className="custom-rays"
      />
    </div>
  );
}
