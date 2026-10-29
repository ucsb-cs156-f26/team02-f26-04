import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";

import HelpRequestCreatePage from "main/pages/HelpRequest/HelpRequestCreatePage";

export default {
  title: "pages/HelpRequest/HelpRequestCreatePage",
  component: HelpRequestCreatePage,
};

const Template = () => <HelpRequestCreatePage storybook={true} />;

export const Default = Template.bind({});

Default.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.userOnly, {
        status: 200,
      });
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither, {
        status: 200,
      });
    }),
    http.post("/api/HelpRequest/post", () => {
      return HttpResponse.json(
        {
          id: 1,
          requesterEmail: "student@ucsb.edu",
          teamId: "team02-f26-04",
          tableOrBreakoutRoom: "Library 2510",
          requestTime: "2026-10-26T14:30",
          explanation: "I need help with my laptop.",
          solved: false,
        },
        { status: 200 },
      );
    }),
  ],
};
