import { Button, SmallText } from "@/components";
import { INTEREST_GROUPS } from "../constants";

function ThirdStepForm({ interests, setInterests, handleNextStep, isLoading }) {
  return (
    <>
      {INTEREST_GROUPS.map((group) => (
        <div className="interests-container" key={group.name}>
          <p>{group.name}</p>
          {group.items.map((interest) => (
            <SmallText.ClickableBadge
              key={interest}
              text={interest}
              isClicked={interests.includes(interest)}
              onClick={() =>
                setInterests((prev) =>
                  prev.includes(interest)
                    ? prev.filter((item) => item !== interest)
                    : [...prev, interest],
                )
              }
            />
          ))}
        </div>
      ))}
      <Button onClick={handleNextStep} disabled={isLoading}>
        Next Step
      </Button>
    </>
  );
}

export default ThirdStepForm;
