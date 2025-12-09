import "@/pages/NewPost/NewPost.css";
import { firstStepSchema, secondStepSchema } from "@/models/newpost.zod";
import { useSession } from "@/contexts/SessionContext";
import { useNavigate } from "react-router";
import { Button, Input, SmallText, Select } from "@/components";
import { toast } from "react-hot-toast";

import illustration1 from "@/assets/illustrations/business-deal.svg";
import illustration2 from "@/assets/illustrations/financial-literacy.svg";
import illustration3 from "@/assets/illustrations/market-fair.svg";
import illustration4 from "@/assets/illustrations/insurance.svg";

import { LuArrowLeft, LuArrowRight } from "react-icons/lu";
import { useEffect, useState } from "react";

const CreationStep = ({
  illustration,
  title,
  subtitle,
  form,
  currentStep,
  handleBackstep,
  handleNextstep,
  isLoading,
  tags,
  selectedTags,
  setSelectedTags,
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
            (currentStep === 3 && selectedTags.length == 0)
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

  const fetchTags = async () => {
    const response = await fetch("http://localhost:8000/tags");
    const data = await response.json();
    setTags(data);
  };

  useEffect(() => {
    if (isFetchingSession) return;
    fetchTags();
    if (!user?.userId || user?.role === "Freelancer") navigate("/");
  }, [user, isFetchingSession]);

  const Validations = [firstStepSchema, secondStepSchema];

  const handleNextstep = (e) => {
    e.preventDefault();
    if (currentStep <= 2) {
      const validation = Validations[currentStep - 1].safeParse(postDetails);
      if (!validation.success) {
        setFormErrors(validation.error.flatten().fieldErrors);
        return;
      }
    } else if (currentStep === 3 && selectedTags.length === 0)
      return toast.error("Please select at least one tag");
    setCurrentStep((prev) => prev + 1);
  };

  const handleBackstep = (e) => {
    e.preventDefault();
    if (currentStep !== 1) setCurrentStep((prev) => prev - 1);
  };

  const handleChangePostThumbnail = (file) => setThumbnailFile(file);

  const handleCreation = async (e) => {
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
      const res = await fetch("http://localhost:8000/posts", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (data.status === 201) {
        toast.success("Post created successfully");
        navigate("/");
      } else throw new Error(data.message);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const FirstStepForm = (
    <form>
      <Input
        label="Post Thumbnail"
        type="file"
        name="postthumbnail"
        accept="image/jpeg,image/png"
        onChange={(e) => {
          if (e.target.files[0]) {
            handleChangePostThumbnail(e.target.files[0]);
          }
        }}
      />
      <Input
        type="text"
        label="Title"
        name="title"
        placeholder="Design a website"
        value={postDetails.title}
        required
        onChange={(e) =>
          setPostDetails({ ...postDetails, title: e.target.value })
        }
        errors={formErrors?.title}
      />
      <Input.TextArea
        label="Description"
        name="description"
        placeholder="Describe your job post"
        value={postDetails.description}
        required
        onChange={(e) =>
          setPostDetails({ ...postDetails, description: e.target.value })
        }
        errors={formErrors?.description}
      />
      <Button onClick={handleNextstep} disabled={isLoading}>
        Next Step
      </Button>
    </form>
  );

  const SecondStepForm = (
    <form>
      <Select
        label="Payment Method"
        name="paymentMethod"
        value={postDetails.paymentMethod}
        options={["Select payment type", "Fixed", "Hourly"]}
        required
        onChange={(e) =>
          setPostDetails({ ...postDetails, paymentMethod: e.target.value })
        }
        errors={formErrors?.paymentMethod}
      />
      <Input
        type="number"
        label="Payment Amount"
        name="paymentAmount"
        placeholder="Enter payment amount"
        value={postDetails.paymentAmount}
        step="0.01"
        required
        onChange={(e) =>
          setPostDetails({ ...postDetails, paymentAmount: e.target.value })
        }
        errors={formErrors?.paymentAmount}
      />
      <Button onClick={handleNextstep} disabled={isLoading}>
        Next Step
      </Button>
    </form>
  );

  const ThirdStepForm = (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        {tags.map((tag) => {
          return (
            <SmallText.ClickableBadge
              key={tag.tagId}
              text={tag.tagName}
              isClicked={selectedTags.includes(tag.tagId)}
              onClick={() =>
                selectedTags.includes(tag.tagId)
                  ? setSelectedTags(selectedTags.filter((t) => t !== tag.tagId))
                  : setSelectedTags([...selectedTags, tag.tagId])
              }
            />
          );
        })}
      </div>
      <Button onClick={handleNextstep} disabled={isLoading}>
        Next Step
      </Button>
    </>
  );

  const FourthStepForm = (
    <form>
      <Button onClick={handleCreation} disabled={isLoading}>
        Finish!
      </Button>
    </form>
  );

  const Forms = [FirstStepForm, SecondStepForm, ThirdStepForm, FourthStepForm];

  return (
    <CreationStep
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
          ? "What would you like done?"
          : currentStep === 2
          ? "How much would you like to pay?"
          : currentStep === 3
          ? "What matches your job?"
          : "Let's finish it!"
      }
      subtitle={
        currentStep === 1
          ? "Describe your job post"
          : currentStep === 2
          ? "Choose the payment method you wanna use"
          : currentStep === 3
          ? "Choose the tags that match your job"
          : "Get it done!"
      }
      form={Forms[currentStep - 1]}
      currentStep={currentStep}
      handleBackstep={handleBackstep}
      handleNextstep={handleNextstep}
      isLoading={isLoading}
      tags={tags}
      selectedTags={selectedTags}
      setSelectedTags={setSelectedTags}
    />
  );
};

export default NewPost;
