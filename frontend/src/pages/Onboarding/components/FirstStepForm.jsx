import { Button, Input, Select } from "@/components";

function FirstStepForm({
  userDetails,
  setUserDetails,
  formErrors,
  handleNextStep,
  isLoading,
}) {
  return (
    <form>
      <Input
        type="text"
        label="First Name"
        placeholder="Patrick"
        name="firstName"
        value={userDetails.firstName}
        required
        onChange={(e) =>
          setUserDetails((prev) => ({ ...prev, firstName: e.target.value }))
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
          setUserDetails((prev) => ({ ...prev, lastName: e.target.value }))
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
          setUserDetails((prev) => ({ ...prev, gender: e.target.value }))
        }
        errors={formErrors?.gender}
      />
      <Select.Countries
        label="Country"
        name="country"
        value={userDetails.country}
        required
        onChange={(e) =>
          setUserDetails((prev) => ({ ...prev, country: e.target.value }))
        }
        errors={formErrors?.country}
      />
      <Button onClick={handleNextStep} disabled={isLoading}>
        Next Step
      </Button>
    </form>
  );
}

export default FirstStepForm;
