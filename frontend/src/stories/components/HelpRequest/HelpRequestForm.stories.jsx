import React from "react";
import HelpRequestForm from "main/components/HelpRequest/HelpRequestForm";

export default {
  title: "components/HelpRequest/HelpRequestForm",
  component: HelpRequestForm,
};

const Template = (args) => <HelpRequestForm {...args} />;

export const Create = Template.bind({});
Create.args = {
  buttonLabel: "Create",
  submitAction: (data) => {
    console.log("Submit was clicked with data: ", data);
    window.alert("Submit was clicked with data: " + JSON.stringify(data));
  },
};

export const Update = Template.bind({});
Update.args = {
  initialContents: {
    id: 1,
    requesterEmail: "student1@ucsb.edu",
    teamId: "team01",
    tableOrBreakoutRoom: "Table 3",
    requestTime: "2026-10-20T14:30",
    explanation: "I need help understanding the assignment.",
    solved: false,
  },
  buttonLabel: "Update",
  submitAction: (data) => {
    console.log("Submit was clicked with data: ", data);
    window.alert("Submit was clicked with data: " + JSON.stringify(data));
  },
};
