import { Button, SmallText } from "@/components";

const ThirdStepForm = ({
  tags,
  selectedTags,
  setSelectedTags,
  handleNextstep,
  isLoading,
}) => {
  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        {tags.map((tag) => (
          <SmallText.ClickableBadge
            key={tag.tagId}
            text={tag.tagName}
            isClicked={selectedTags.includes(tag.tagId)}
            onClick={() =>
              setSelectedTags((prev) =>
                prev.includes(tag.tagId)
                  ? prev.filter((t) => t !== tag.tagId)
                  : [...prev, tag.tagId]
              )
            }
          />
        ))}
      </div>
      <Button onClick={handleNextstep} disabled={isLoading}>
        Next Step
      </Button>
    </>
  );
};

export default ThirdStepForm;
