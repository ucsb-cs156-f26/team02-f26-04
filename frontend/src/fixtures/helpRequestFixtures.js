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
      explanation: "Need help debugging tests",
      solved: false,
    },
    {
      id: 2,
      requesterEmail: "student2@ucsb.edu",
      teamId: "team02",
      tableOrBreakoutRoom: "Breakout Room A",
      requestTime: "2026-10-20T15:00:00",
      explanation: "Question about the assignment",
      solved: true,
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
