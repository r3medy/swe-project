import { Button } from "@/components";

const FourthStepForm = ({ handleCreation, isLoading }) => {
  return (
    <form>
      <Button onClick={handleCreation} disabled={isLoading}>
        Finish!
      </Button>
    </form>
  );
};

export default FourthStepForm;
