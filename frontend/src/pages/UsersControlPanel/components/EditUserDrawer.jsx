import { Button, Drawer, Input, Select } from "@/components";

function EditUserDrawer({
  isOpen,
  selectedUser,
  onClose,
  onSubmit,
  onChangeField,
}) {
  return (
    <Drawer title="Edit user" isOpen={isOpen} onClose={onClose}>
      {selectedUser ? (
        <form className="edit-user-form" onSubmit={onSubmit}>
          <div className="form-row">
            <Input
              label="First Name"
              name="firstName"
              type="text"
              placeholder="First Name"
              defaultValue={selectedUser.firstName}
              onChange={(e) => onChangeField("firstName", e.target.value)}
            />
            <Input
              label="Last Name"
              name="lastName"
              type="text"
              placeholder="Last Name"
              defaultValue={selectedUser.lastName}
              onChange={(e) => onChangeField("lastName", e.target.value)}
            />
          </div>
          <Input
            label="Username"
            name="username"
            type="text"
            placeholder="Username"
            defaultValue={selectedUser.username}
            onChange={(e) => onChangeField("username", e.target.value)}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="Email"
            defaultValue={selectedUser.email}
            onChange={(e) => onChangeField("email", e.target.value)}
          />
          <Input
            label="Title"
            name="title"
            type="text"
            placeholder="Professional Title"
            defaultValue={selectedUser.title}
            onChange={(e) => onChangeField("title", e.target.value)}
          />
          <Select.Countries
            label="Country"
            name="country"
            defaultValue={selectedUser.country}
            onChange={(e) => onChangeField("country", e.target.value)}
          />
          <div className="form-row">
            <Select
              label="Role"
              name="role"
              options={["Admin", "Freelancer", "Client"]}
              defaultValue={selectedUser.role}
              onChange={(e) => onChangeField("role", e.target.value)}
            />
            <Select
              label="Gender"
              name="gender"
              options={["Male", "Female"]}
              defaultValue={selectedUser.gender}
              onChange={(e) => onChangeField("gender", e.target.value)}
            />
          </div>
          <Input.TextArea
            label="Bio"
            name="bio"
            placeholder="User bio"
            defaultValue={selectedUser.bio}
            onChange={(e) => onChangeField("bio", e.target.value)}
          />
          <div className="form-actions">
            <Button type="submit">Save Changes</Button>
            <Button.Text type="button" onClick={onClose}>
              Cancel
            </Button.Text>
          </div>
        </form>
      ) : null}
    </Drawer>
  );
}

export default EditUserDrawer;
