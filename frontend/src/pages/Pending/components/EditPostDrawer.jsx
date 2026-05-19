import { Button, Drawer, Input, Select } from "@/components";

function EditPostDrawer({
  isOpen,
  currentPost,
  editPost,
  isDisabled,
  onClose,
  onSubmit,
  onChangeField,
  onPaymentAmountChange,
}) {
  const paymentType = editPost.jobType ?? currentPost?.jobType;

  return (
    <Drawer title="Edit post" isOpen={isOpen} onClose={onClose}>
      <form
        onSubmit={onSubmit}
        className="edit-post-form"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <Input
          label="Job Title"
          name="jobTitle"
          onChange={(e) => onChangeField("jobTitle", e.target.value)}
          defaultValue={currentPost?.jobTitle}
        />
        <Input.TextArea
          label="Description"
          name="jobDescription"
          onChange={(e) => onChangeField("jobDescription", e.target.value)}
          defaultValue={currentPost?.jobDescription}
        />
        <div className="form-row">
          <Select
            label="Payment Type"
            options={["Fixed", "Hourly"]}
            defaultValue={currentPost?.jobType}
            onChange={(e) => onChangeField("jobType", e.target.value)}
          />
          <Input
            label={paymentType === "Hourly" ? "Rate ($/hr)" : "Budget ($)"}
            type="number"
            step="0.01"
            name={paymentType === "Hourly" ? "hourlyRate" : "budget"}
            defaultValue={
              currentPost?.jobType === "Hourly"
                ? currentPost?.hourlyRate
                : currentPost?.budget
            }
            onChange={(e) => onPaymentAmountChange(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={isDisabled}>
          Save Changes
        </Button>
      </form>
    </Drawer>
  );
}

export default EditPostDrawer;
