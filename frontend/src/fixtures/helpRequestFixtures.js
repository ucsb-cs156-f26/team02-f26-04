const helpRequestFixtures = {
  oneHelpRequest: [
    {
      id: 1,
      requesterEmail: "student1@ucsb.edu",
      teamId: "team01",
      tableOrBreakoutRoom: "Table 3",
      requestTime: "2026-10-20T14:30:00",
      explanation: "I need help understanding the assignment.",
      solved: false,
    },
  ],

  threeHelpRequests: [
    {
      id: 1,
      requesterEmail: "student1@ucsb.edu",
      teamId: "team01",
      tableOrBreakoutRoom: "Table 3",
      requestTime: "2026-10-20T14:30:00",
      explanation: "I need help understanding the assignment.",
      solved: false,
    },
    {
      id: 2,
      requesterEmail: "student2@ucsb.edu",
      teamId: "team02",
      tableOrBreakoutRoom: "Breakout Room A",
      requestTime: "2026-10-21T10:15:00",
      explanation: "My tests are failing and I cannot find the issue.",
      solved: false,
    },
    {
      id: 3,
      requesterEmail: "student3@ucsb.edu",
      teamId: "team03",
      tableOrBreakoutRoom: "Table 7",
      requestTime: "2026-10-22T16:45:00",
      explanation: "I have a question about the lecture material.",
      solved: true,
    },
  ],
};

export { helpRequestFixtures };
