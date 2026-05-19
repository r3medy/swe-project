import { Button } from "@/components";

function FourthStepForm({ handleSubmission, isLoading }) {
  return (
    <form>
      <Button onClick={handleSubmission} disabled={isLoading}>
        Rumble!
      </Button>
    </form>
  );
}

export default FourthStepForm;
