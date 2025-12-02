import { Link } from "react-router";
import aboutImage1 from "@/assets/images/about-1.jpg";
import aboutImage2 from "@/assets/images/about-2.jpg";
import aboutImage3 from "@/assets/images/about-3.jpg";
import aboutImage4 from "@/assets/images/about-4.jpg";

import { Navigation, SmallText, Button } from "@/components";
import "@/pages/About/About.css";

const About = () => {
  return (
    <>
      <Navigation />
      <div className="about-container">
        <div className="about-content">
          <div className="about-text">
            <h1>Our story</h1>
            <SmallText text="Our company started with one simple idea: everyone deserves access to the right talent at the right time. From day one, we focused on building a platform that connects project owners with skilled freelancers from across the region. Over the years, we have successfully delivered thousands of projects and became a trusted space for both clients and freelancers." />
          </div>
          <div className="about-image">
            <img src={aboutImage1} alt="About Image 1" loading="lazy" />
          </div>
        </div>
        <div className="about-content">
          <div className="about-image">
            <img src={aboutImage2} alt="About Image 2" loading="lazy" />
          </div>
          <div className="about-text">
            <h1>Why We’re Different</h1>
            <SmallText text="We believe that great work comes from great people. That’s why every freelancer on our platform is carefully selected, evaluated, and supported to ensure top-quality performance. Whether you need a designer, developer, marketer, or writer—you’ll always find someone who matches your vision and can bring your project to life." />
          </div>
        </div>
        <div className="about-content">
          <div className="about-text">
            <h1>Quality You Can Trust</h1>
            <SmallText text="Our freelancers are committed to delivering professional, reliable, and high-quality work. We follow strict quality standards, continuous feedback, and ongoing support to make sure every project meets your expectations—on time, every time." />
          </div>
          <div className="about-image">
            <img src={aboutImage3} alt="About Image 3" loading="lazy" />
          </div>
        </div>
        <div className="about-content">
          <div className="about-image">
            <img src={aboutImage4} alt="About Image 4" loading="lazy" />
          </div>
          <div className="about-text">
            <h1>Find the Perfect Deal Every Time</h1>
            <SmallText text="With our smart matching system, transparent pricing, and flexible project options, you’ll always find the deal that fits your budget and goals. No hidden fees. No complicated steps. Just the right talent for the job." />
          </div>
        </div>
        <div className="about-footer">
          <hr />
          <h1>Our Message to You</h1>
          <SmallText text="We’re more than just a platform—we’re your partner in turning ideas into reality. Let’s build something great together," />
          <Button>
            <Link to="/register">Join Us</Link>
          </Button>
        </div>
      </div>
    </>
  );
};

export default About;
