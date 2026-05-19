import { Button, Drawer, Input, Select, SmallText } from "@/components";

function CreateUserDrawer({
  isOpen,
  form,
  errors,
  tags,
  selectedTags,
  onClose,
  onSubmit,
  onChangeField,
  onToggleTag,
}) {
  return (
    <Drawer title="Create user" isOpen={isOpen} onClose={onClose}>
      <form className="edit-user-form" onSubmit={onSubmit}>
        <div className="form-row">
          <Input
            label="First Name"
            name="firstName"
            type="text"
            placeholder="First Name"
            value={form.firstName}
            onChange={(e) => onChangeField("firstName", e.target.value)}
            errors={errors.firstName}
          />
          <Input
            label="Last Name"
            name="lastName"
            type="text"
            placeholder="Last Name"
            value={form.lastName}
            onChange={(e) => onChangeField("lastName", e.target.value)}
            errors={errors.lastName}
          />
        </div>
        <Input
          label="Username"
          name="username"
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={(e) => onChangeField("username", e.target.value)}
          errors={errors.username}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => onChangeField("email", e.target.value)}
          errors={errors.email}
        />
        <div className="form-row">
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => onChangeField("password", e.target.value)}
            errors={errors.password}
          />
          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={(e) => onChangeField("confirmPassword", e.target.value)}
            errors={errors.confirmPassword}
          />
        </div>
        <Input
          label="Title"
          name="title"
          type="text"
          placeholder="Professional Title"
          value={form.title}
          onChange={(e) => onChangeField("title", e.target.value)}
          errors={errors.title}
        />
        <Select.Countries
          label="Country"
          name="country"
          value={form.country}
          onChange={(e) => onChangeField("country", e.target.value)}
          errors={errors.country}
        />
        <div className="form-row">
          <Select
            label="Role"
            name="role"
            value={form.role}
            onChange={(e) => onChangeField("role", e.target.value)}
            errors={errors.role}
          >
            <option value="">Select role</option>
            <option value="Admin">Admin</option>
            <option value="Freelancer">Freelancer</option>
            <option value="Client">Client</option>
          </Select>
          <Select
            label="Gender"
            name="gender"
            value={form.gender}
            onChange={(e) => onChangeField("gender", e.target.value)}
            errors={errors.gender}
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </Select>
        </div>
        <Input.TextArea
          label="Bio"
          name="bio"
          placeholder="User bio"
          value={form.bio}
          onChange={(e) => onChangeField("bio", e.target.value)}
          errors={errors.bio}
        />
        <div className="tags-section">
          <label>Tags</label>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
              marginTop: "0.5rem",
            }}
          >
            {tags.map((tag) => (
              <SmallText.ClickableBadge
                key={tag.tagId}
                text={tag.tagName}
                isClicked={selectedTags.includes(tag.tagId)}
                onClick={() => onToggleTag(tag.tagId)}
                style={{ cursor: "pointer" }}
              />
            ))}
          </div>
          {tags.length === 0 ? <SmallText text="No tags available" /> : null}
        </div>
        <div className="form-actions">
          <Button type="submit">Create User</Button>
          <Button.Text type="button" onClick={onClose}>
            Cancel
          </Button.Text>
        </div>
      </form>
    </Drawer>
  );
}

export default CreateUserDrawer;
