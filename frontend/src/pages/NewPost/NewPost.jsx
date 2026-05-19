import "@/pages/NewPost/NewPost.css";
import { firstStepSchema, secondStepSchema } from "@/models/newpost.zod";
import { useSession } from "@/contexts/useSession";
import { useNavigate } from "react-router";
import { Button, SmallText } from "@/components";
import { toast } from "react-hot-toast";
import { get, postForm } from "@/utils/request";

import illustration1 from "@/assets/illustrations/business-deal.svg";
import illustration2 from "@/assets/illustrations/financial-literacy.svg";
import illustration3 from "@/assets/illustrations/market-fair.svg";
import illustration4 from "@/assets/illustrations/insurance.svg";

import { LuArrowLeft, LuArrowRight } from "react-icons/lu";
import { useCallback, useEffect, useMemo, useState } from "react";

import FirstStepForm from "./components/FirstStepForm";
import SecondStepForm from "./components/SecondStepForm";
import ThirdStepForm from "./components/ThirdStepForm";
import FourthStepForm from "./components/FourthStepForm";

const STEP_VALIDATIONS = [firstStepSchema, secondStepSchema];

const CREATION_STEPS = [
  {
    illustration: illustration1,
    title: "What would you like done?",
    subtitle: "Describe your job post",
  },
  {
    illustration: illustration2,
    title: "How much would you like to pay?",
    subtitle: "Choose the payment method you wanna use",
  },
  {
    illustration: illustration3,
    title: "What matches your job?",
    subtitle: "Choose the tags that match your job",
  },
  {
    illustration: illustration4,
    title: "Let's finish it!",
    subtitle: "Get it done!",
  },
];

const CreationStep = ({
  illustration,
  title,
  subtitle,
  form,
  currentStep,
  handleBackstep,
  handleNextstep,
  isLoading,
  selectedTags,
}) => {
  return (
    <div className="post-creation">
      <div className="post-creation-stepper">
        <Button.Icon
          disabled={isLoading || currentStep === 1}
          onClick={handleBackstep}
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
            (currentStep === 3 && selectedTags.length === 0)
          }
          onClick={handleNextstep}
        >
          <LuArrowRight />
        </Button.Icon>
      </div>
      <div className="post-creation-content">
        <div
          className="post-creation-illustration"
          style={{
            maskImage: `url(${illustration})`,
            WebkitMaskImage: `url(${illustration})`,
            backgroundColor: "var(--foreground)",
          }}
        />
        <div className="post-creation-form">
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

const NewPost = () => {
  const { user, isFetchingSession } = useSession();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [postDetails, setPostDetails] = useState({
    title: "",
    description: "",
    paymentMethod: "",
    paymentAmount: 0,
  });
  const [formErrors, setFormErrors] = useState({});

  const fetchTags = useCallback(async () => {
    try {
      const data = await get(`/tags`);
      setTags(data ?? []);
    } catch {
      toast.error("Failed to load tags");
      setTags([]);
    }
  }, []);

  useEffect(() => {
    if (isFetchingSession) return;
    fetchTags();
    if (!user?.userId || user?.role === "Freelancer") navigate("/");
  }, [fetchTags, user, isFetchingSession, navigate]);

  const handleNextstep = useCallback((e) => {
    e.preventDefault();
    if (currentStep <= 2) {
      const validation = STEP_VALIDATIONS[currentStep - 1].safeParse(postDetails);
      if (!validation.success) {
        setFormErrors(validation.error.flatten().fieldErrors);
        return;
      }
    } else if (currentStep === 3 && selectedTags.length === 0)
      return toast.error("Please select at least one tag");
    setCurrentStep((prev) => prev + 1);
  }, [currentStep, postDetails, selectedTags]);

  const handleBackstep = useCallback((e) => {
    e.preventDefault();
    if (currentStep !== 1) setCurrentStep((prev) => prev - 1);
  }, [currentStep]);

  const handleChangePostThumbnail = useCallback((file) => {
    setThumbnailFile(file);
  }, []);

  const handleCreation = useCallback(async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("title", postDetails.title);
    formData.append("description", postDetails.description);
    formData.append("paymentMethod", postDetails.paymentMethod);
    formData.append("paymentAmount", postDetails.paymentAmount);
    formData.append("tags", selectedTags.join(","));

    if (thumbnailFile) formData.append("jobThumbnail", thumbnailFile);

    try {
      const data = await postForm(`/posts`, formData);
      if (data?.status === 201) {
        toast.success("Post created successfully");
        navigate("/");
      } else {
        throw new Error(data?.message || "Failed to create post");
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [navigate, postDetails, selectedTags, thumbnailFile]);

  const stepForms = useMemo(
    () => [
      <FirstStepForm
        key="step-1"
        postDetails={postDetails}
        setPostDetails={setPostDetails}
        formErrors={formErrors}
        handleNextstep={handleNextstep}
        isLoading={isLoading}
        handleChangePostThumbnail={handleChangePostThumbnail}
      />,
      <SecondStepForm
        key="step-2"
        postDetails={postDetails}
        setPostDetails={setPostDetails}
        formErrors={formErrors}
        handleNextstep={handleNextstep}
        isLoading={isLoading}
      />,
      <ThirdStepForm
        key="step-3"
        tags={tags}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        handleNextstep={handleNextstep}
        isLoading={isLoading}
      />,
      <FourthStepForm
        key="step-4"
        handleCreation={handleCreation}
        isLoading={isLoading}
      />,
    ],
    [
      formErrors,
      handleChangePostThumbnail,
      handleCreation,
      handleNextstep,
      isLoading,
      postDetails,
      selectedTags,
      tags,
    ],
  );

  const step = CREATION_STEPS[currentStep - 1];

  return (
    <CreationStep
      illustration={step.illustration}
      title={step.title}
      subtitle={step.subtitle}
      form={stepForms[currentStep - 1]}
      currentStep={currentStep}
      handleBackstep={handleBackstep}
      handleNextstep={handleNextstep}
      isLoading={isLoading}
      selectedTags={selectedTags}
    />
  );
};

export default NewPost;
