import { LuBadgeCheck } from "react-icons/lu";
import { Button } from "@/components";
import { handleApplyChanges, handleCancelChanges } from "../Extras/handlers";

const ChangesPopup = ({
  changes,
  backupProfile,
  setProfile,
  setChanges,
  isLoading,
  setIsLoading,
}) => {
  return (
    <div className="changes-popup">
      <div className="changes-popup-left">
        <LuBadgeCheck size={24} />
        <p>
          Click apply to save your <strong>{changes.length}</strong> changes!
        </p>
      </div>
      <div className="changes-popup-right">
        <Button
          onClick={() => handleApplyChanges(changes, setIsLoading, setChanges)}
          className="changes-popup-right"
          disabled={isLoading}
        >
          Apply
        </Button>
        <Button.Text
          onClick={() =>
            handleCancelChanges(setProfile, backupProfile, setChanges)
          }
          disabled={isLoading}
        >
          Cancel
        </Button.Text>
      </div>
    </div>
  );
};

export default ChangesPopup;
