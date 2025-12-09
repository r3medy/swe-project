import "./Onboarding.css";
import { useLocation, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { LuArrowLeft, LuArrowRight } from "react-icons/lu";
import toast from "react-hot-toast";

import { firstStepSchema, secondStepSchema } from "@/models/onboarding.zod";
import { useSession } from "@/contexts/SessionContext";
import { Button, Input, SmallText, Select } from "@/components";

import illustration1 from "@/assets/illustrations/designer-desk.svg";
import illustration2 from "@/assets/illustrations/designer-working.svg";
import illustration3 from "@/assets/illustrations/being-creative.svg";
import illustration4 from "@/assets/illustrations/virtual-reality.svg";

const interestsList = [
  [
    "Coding & Development",
    [
      "Web Development",
      "Game Development",
      "Mobile Development",
      "Android Development",
      "iOS Development",
    ],
  ],
  [
    "Design & Art",
    [
      "UI/UX Design",
      "Graphic Design",
      "Motion Graphics",
      "Video Editing",
      "Product Design",
    ],
  ],
  [
    "Business & Marketing",
    [
      "SEO",
      "Email Marketing",
      "Advertising",
      "Entrepreneurship",
      "Human Resources",
      "Finance",
      "Sales",
    ],
  ],
];

const OnboardingStep = ({
  illustration,
  title,
  subtitle,
  form,
  currentStep,
  handleBackStep,
  handleNextStep,
  isLoading,
  interests,
}) => {
  return (
    <div className="onboarding">
      <div className="onboarding-stepper">
        <Button.Icon
          disabled={isLoading || currentStep === 1}
          onClick={handleBackStep}
        >
          <LuArrowLeft />
        </Button.Icon>
        <p>
          Step <strong>{currentStep}</strong> of <strong>4</strong>
        </p>
        <Button.Icon
          disabled={
            isLoading ||
            currentStep === 4 ||
            (currentStep === 3 && interests.length == 0)
          }
          onClick={handleNextStep}
        >
          <LuArrowRight />
        </Button.Icon>
      </div>
      <div className="onboarding-content">
        <div
          className="onboarding-illustration"
          style={{
            maskImage: `url(${illustration})`,
            WebkitMaskImage: `url(${illustration})`,
            backgroundColor: "var(--foreground)",
          }}
        />
        <div className="onboarding-form">
          <div>
            <h1>{title}</h1>
            <SmallText>{subtitle}</SmallText>
          </div>
          {form}
        </div>
      </div>
    </div>
  );
};

const Onboarding = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [userDetails, setUserDetails] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    role: "",
    title: "",
    country: "",
    bio: "",
  });
  const [formErrors, setFormErrors] = useState({
    firstName: "",
    lastName: "",
    country: "",
    role: "",
    title: "",
    bio: "",
  });
  const [interests, setInterests] = useState([]);

  useEffect(() => {
    if (!location?.state) navigate("/");
    if (
      !location?.state?.email ||
      !location?.state?.password ||
      !location?.state?.username
    )
      navigate("/");
  }, [location, navigate]);

  if (!location?.state) return null;

  const fetchRegister = async (userInfo) => {
    const response = await fetch("http://localhost:8000/auth/register", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userInfo),
    });

    const data = await response.json();
    console.log(response.status);
    if (response.status !== 201) throw new Error(data.message);
    return data;
  };

  const handleSubmission = (e) => {
    e.preventDefault();

    const userInfo = {
      ...location.state,
      ...userDetails,
      interests,
    };

    toast.promise(fetchRegister(userInfo), {
      loading: () => {
        setIsLoading(true);
        return "Registering...";
      },
      success: () => {
        login({
          usernameoremail: location.state.username,
          password: location.state.password,
        });
        navigate("/");
        return "Registered successfully\nyou will be redirected to the home page ";
      },
      error: (err) => {
        return err.message;
      },
    });
  };

  const handleBackStep = (e) => {
    e.preventDefault();
    setCurrentStep((prev) => prev - 1);
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (currentStep <= 2) {
      const validation = Validations[currentStep - 1].safeParse(userDetails);
      if (!validation.success)
        return setFormErrors(validation.error.flatten().fieldErrors);
    }
    setCurrentStep((prev) => prev + 1);
  };

  const FirstStepForm = (
    <form>
      <Input
        type="text"
        label="First Name"
        placeholder="Patrick"
        name="firstName"
        value={userDetails.firstName}
        required
        onChange={(e) =>
          setUserDetails({ ...userDetails, firstName: e.target.value })
        }
        errors={formErrors?.firstName}
      />
      <Input
        type="text"
        label="Last Name"
        placeholder="Jane"
        name="lastName"
        value={userDetails.lastName}
        required
        onChange={(e) =>
          setUserDetails({ ...userDetails, lastName: e.target.value })
        }
        errors={formErrors?.lastName}
      />
      <Select
        label="Gender"
        name="gender"
        value={userDetails.gender}
        required
        options={["Choose your gender", "Male", "Female"]}
        onChange={(e) =>
          setUserDetails({ ...userDetails, gender: e.target.value })
        }
        errors={formErrors?.gender}
      />
      <Select.Countries
        label="Country"
        name="country"
        value={userDetails.country}
        required
        onChange={(e) =>
          setUserDetails({ ...userDetails, country: e.target.value })
        }
        errors={formErrors?.country}
      />
      <Button onClick={handleNextStep} disabled={isLoading}>
        Next Step
      </Button>
    </form>
  );
  const SecondStepForm = (
    <form>
      <Select
        label="Role"
        name="role"
        value={userDetails.role}
        required
        options={["Choose your preferred role", "Client", "Freelancer"]}
        onChange={(e) =>
          setUserDetails({ ...userDetails, role: e.target.value })
        }
        errors={formErrors?.role}
      />
      <Input
        type="text"
        label="Title"
        placeholder="Software Engineer"
        name="title"
        value={userDetails.title}
        required
        onChange={(e) =>
          setUserDetails({ ...userDetails, title: e.target.value })
        }
        errors={formErrors?.title}
      />
      <Input.TextArea
        label="Bio"
        placeholder="Tell us what you do"
        name="bio"
        value={userDetails.bio}
        required
        onChange={(e) =>
          setUserDetails({ ...userDetails, bio: e.target.value })
        }
        errors={formErrors?.bio}
      />
      <Button onClick={handleNextStep} disabled={isLoading}>
        Next Step
      </Button>
    </form>
  );
  const ThirdStepForm = (
    <>
      {interestsList.map((interest) => {
        return (
          <div className="interests-container" key={interest[0]}>
            <p>{interest[0]}</p>
            {interest[1].map((subInterest) => {
              return (
                <SmallText.ClickableBadge
                  key={subInterest}
                  text={subInterest}
                  isClicked={interests.includes(subInterest)}
                  onClick={() => {
                    interests.includes(subInterest)
                      ? setInterests(
                          interests.filter(
                            (interest) => interest !== subInterest
                          )
                        )
                      : setInterests([...interests, subInterest]);
                  }}
                />
              );
            })}
          </div>
        );
      })}
      <Button onClick={handleNextStep} disabled={isLoading}>
        Next Step
      </Button>
    </>
  );
  const FourthStepForm = (
    <form>
      <Button onClick={handleSubmission} disabled={isLoading}>
        Rumble!
      </Button>
    </form>
  );

  const Forms = [FirstStepForm, SecondStepForm, ThirdStepForm, FourthStepForm];
  const Validations = [firstStepSchema, secondStepSchema];
  return (
    <OnboardingStep
      illustration={
        currentStep === 1
          ? illustration1
          : currentStep === 2
          ? illustration2
          : currentStep === 3
          ? illustration3
          : illustration4
      }
      title={
        currentStep === 1
          ? "Who are you?"
          : currentStep === 2
          ? "What do you do?"
          : currentStep === 3
          ? "What are your interests?"
          : "Get ready to rumble!"
      }
      subtitle={
        currentStep === 1
          ? "Tell us a little bit about yourself"
          : currentStep === 2
          ? "Tell us what you do"
          : currentStep === 3
          ? "Tell us what you like, select at least 1 interests"
          : "Let's get going!"
      }
      form={Forms[currentStep - 1]}
      currentStep={currentStep}
      handleNextStep={handleNextStep}
      handleBackStep={handleBackStep}
      isLoading={isLoading}
      interests={interests}
    />
  );
};

export default Onboarding;
