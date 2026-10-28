import HelpRequestTable from "main/components/HelpRequest/HelpRequestTable";

export default {
  title: "components/HelpRequest/HelpRequestTable",
  component: HelpRequestTable,
};

const Template = (args) => <HelpRequestTable {...args} />;

export const Empty = Template.bind({});
Empty.args = {
  helpRequests: [],
};

export const TwoItems = Template.bind({});
TwoItems.args = {
  helpRequests: [
    {
      id: 1,
      requesterEmail: "student1@ucsb.edu",
      teamId: "team01",
      tableOrBreakoutRoom: "Table 3",
      requestTime: "2026-10-20T14:30",
      explanation: "I need help understanding the assignment.",
      solved: false,
    },
    {
      id: 2,
      requesterEmail: "student2@ucsb.edu",
      teamId: "team02",
      tableOrBreakoutRoom: "Breakout Room 1",
      requestTime: "2026-10-21T10:00",
      explanation: "I have a question about my code.",
      solved: true,
    },
  ],
};
