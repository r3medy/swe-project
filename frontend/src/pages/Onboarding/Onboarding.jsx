import "./Onboarding.css";
import { useLocation, useNavigate } from "react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LuArrowLeft, LuArrowRight } from "react-icons/lu";
import toast from "react-hot-toast";

import { Button, SmallText } from "@/components";
import { API_BASE_URL } from "@/config";
import { useSession } from "@/contexts/useSession";
import { firstStepSchema, secondStepSchema } from "@/models/onboarding.zod";

import FirstStepForm from "./components/FirstStepForm";
import FourthStepForm from "./components/FourthStepForm";
import SecondStepForm from "./components/SecondStepForm";
import ThirdStepForm from "./components/ThirdStepForm";
import { ONBOARDING_STEPS } from "./constants";

const VALIDATIONS = [firstStepSchema, secondStepSchema];

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
            (currentStep === 3 && interests.length === 0)
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
    ) {
      navigate("/");
    }
  }, [location, navigate]);

  const fetchRegister = useCallback(async (userInfo) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userInfo),
    });

    const data = await response.json();
    if (response.status !== 201) throw new Error(data.message);
    return data;
  }, []);

  const handleSubmission = useCallback(
    (e) => {
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
          setIsLoading(false);
          return "Registered successfully\nyou will be redirected to the home page ";
        },
        error: (err) => {
          setIsLoading(false);
          return err.message;
        },
      });
    },
    [fetchRegister, interests, location.state, login, navigate, userDetails],
  );

  const handleBackStep = useCallback((e) => {
    e.preventDefault();
    setCurrentStep((prev) => prev - 1);
  }, []);

  const handleNextStep = useCallback(
    (e) => {
      e.preventDefault();
      if (currentStep <= 2) {
        const validation = VALIDATIONS[currentStep - 1].safeParse(userDetails);
        if (!validation.success) {
          setFormErrors(validation.error.flatten().fieldErrors);
          return;
        }
      }
      setCurrentStep((prev) => prev + 1);
    },
    [currentStep, userDetails],
  );

  const forms = useMemo(
    () => [
      <FirstStepForm
        key="step-1"
        userDetails={userDetails}
        setUserDetails={setUserDetails}
        formErrors={formErrors}
        handleNextStep={handleNextStep}
        isLoading={isLoading}
      />,
      <SecondStepForm
        key="step-2"
        userDetails={userDetails}
        setUserDetails={setUserDetails}
        formErrors={formErrors}
        handleNextStep={handleNextStep}
        isLoading={isLoading}
      />,
      <ThirdStepForm
        key="step-3"
        interests={interests}
        setInterests={setInterests}
        handleNextStep={handleNextStep}
        isLoading={isLoading}
      />,
      <FourthStepForm
        key="step-4"
        handleSubmission={handleSubmission}
        isLoading={isLoading}
      />,
    ],
    [
      formErrors,
      handleNextStep,
      handleSubmission,
      interests,
      isLoading,
      userDetails,
    ],
  );

  if (!location?.state) return null;

  const step = ONBOARDING_STEPS[currentStep - 1];
  return (
    <OnboardingStep
      illustration={step.illustration}
      title={step.title}
      subtitle={step.subtitle}
      form={forms[currentStep - 1]}
      currentStep={currentStep}
      handleNextStep={handleNextStep}
      handleBackStep={handleBackStep}
      isLoading={isLoading}
      interests={interests}
    />
  );
};

export default Onboarding;
