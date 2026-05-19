import { Button, Input, Select } from "@/components";

function SecondStepForm({
  userDetails,
  setUserDetails,
  formErrors,
  handleNextStep,
  isLoading,
}) {
  return (
    <form>
      <Select
        label="Role"
        name="role"
        value={userDetails.role}
        required
        options={["Choose your preferred role", "Client", "Freelancer"]}
        onChange={(e) =>
          setUserDetails((prev) => ({ ...prev, role: e.target.value }))
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
          setUserDetails((prev) => ({ ...prev, title: e.target.value }))
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
          setUserDetails((prev) => ({ ...prev, bio: e.target.value }))
        }
        errors={formErrors?.bio}
      />
      <Button onClick={handleNextStep} disabled={isLoading}>
        Next Step
      </Button>
    </form>
  );
}

export default SecondStepForm;
