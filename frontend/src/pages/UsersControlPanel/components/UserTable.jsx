import { LuExternalLink, LuTrash, LuBrush } from "react-icons/lu";

import { Button, SmallText, Table, Tooltip } from "@/components";
import { assetUrl } from "@/config";
import profileImage1 from "@/assets/profilepictures/1.png";
import profileImage3 from "@/assets/profilepictures/3.png";

function UserTable({
  users,
  currentUser,
  onViewUser,
  onEditUser,
  onDeleteUser,
}) {
  return (
    <Table
      headers={[
        "ID",
        "User",
        "Username",
        "Gender",
        "Role",
        "Created At",
        "Actions",
      ]}
      rows={users.map((userInfo) => [
        <SmallText text={userInfo.userId} />,
        <div className="user-info">
          <img
            src={
              userInfo.profilePicture
                ? assetUrl(userInfo.profilePicture)
                : userInfo.gender === "Male"
                  ? profileImage1
                  : profileImage3
            }
            alt={userInfo.username}
            loading="lazy"
          />
          <div>
            <p>{`${userInfo.firstName} ${userInfo.lastName}`}</p>
            <SmallText text={userInfo.email} />
          </div>
        </div>,
        <p>
          @{userInfo.username}{" "}
          {userInfo.userId === currentUser?.userId ? (
            <SmallText text="(You)" />
          ) : null}
        </p>,
        userInfo.gender,
        userInfo.role,
        new Date(userInfo.createdAt).toDateString(),
        <div className="user-actions">
          <Tooltip text="View">
            <Button.Icon onClick={() => onViewUser(userInfo.username)}>
              <LuExternalLink size={16} />
            </Button.Icon>
          </Tooltip>
          <Tooltip text="Edit">
            <Button.Icon onClick={() => onEditUser(userInfo)}>
              <LuBrush size={16} />
            </Button.Icon>
          </Tooltip>
          {userInfo.userId !== currentUser?.userId ? (
            <Tooltip text="Delete">
              <Button.Icon onClick={() => onDeleteUser(userInfo)}>
                <LuTrash size={16} />
              </Button.Icon>
            </Tooltip>
          ) : null}
        </div>,
      ])}
    />
  );
}

export default UserTable;
