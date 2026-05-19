import { Button, Input, Select } from "@/components";

const SecondStepForm = ({
  postDetails,
  setPostDetails,
  formErrors,
  handleNextstep,
  isLoading,
}) => {
  return (
    <form>
      <Select
        label="Payment Method"
        name="paymentMethod"
        value={postDetails.paymentMethod}
        options={["Select payment type", "Fixed", "Hourly"]}
        required
        onChange={(e) =>
          setPostDetails((prev) => ({ ...prev, paymentMethod: e.target.value }))
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
        min="1"
        required
        onChange={(e) =>
          setPostDetails((prev) => ({ ...prev, paymentAmount: e.target.value }))
        }
        errors={formErrors?.paymentAmount}
      />
      <Button onClick={handleNextstep} disabled={isLoading}>
        Next Step
      </Button>
    </form>
  );
};

export default SecondStepForm;
