export const posts = [
  {
    postId: 2,
    clientId: 1,
    jobTitle: "Job Title",
    jobType: "Fixed", // Fixed, Hourly
    budget: 100,
    hourlyRate: 0,
    description: "Job Description",
    status: "Pending", // Pending, Accepted, Refused
    isJobAccepted: false,
    createdAt: new Date(),

    // Extras from other tables
    numberOfProposals: 7,
    tags: ["Software Engineering", "Development", "Design", "Frontend"],
  },
];

export const user = {
  userId: 7,
  role: "Client", // Admin, Freelancer, Client
  firstName: "FirstName",
  lastName: "LastName",
  email: "patrickjane@gmail.com",
  title: "Software Engineer | CEO @ Lotus",
  country: "Egypt",
  bio: "Bio",
  createdAt: new Date(),

  // Extras from other tables
  numberOfPosts: 0,
};
