import { Button, Input } from "@/components";

const FirstStepForm = ({
  postDetails,
  setPostDetails,
  formErrors,
  handleNextstep,
  isLoading,
  handleChangePostThumbnail,
}) => {
  return (
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
          setPostDetails((prev) => ({ ...prev, title: e.target.value }))
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
          setPostDetails((prev) => ({ ...prev, description: e.target.value }))
        }
        errors={formErrors?.description}
      />
      <Button onClick={handleNextstep} disabled={isLoading}>
        Next Step
      </Button>
    </form>
  );
};

export default FirstStepForm;
