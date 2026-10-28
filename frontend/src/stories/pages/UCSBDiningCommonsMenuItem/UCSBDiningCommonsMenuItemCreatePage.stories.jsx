import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";

import UCSBDiningCommonsMenuItemCreatePage from "main/pages/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemCreatePage";

export default {
  title: "pages/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemCreatePage",
  component: UCSBDiningCommonsMenuItemCreatePage,
};

const Template = () => <UCSBDiningCommonsMenuItemCreatePage storybook={true} />;

export const Default = Template.bind({});
Default.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.adminUser, {
        status: 200,
      });
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither, {
        status: 200,
      });
    }),
    http.post("/api/UCSBDiningCommonsMenuItem/post", ({ request }) => {
      const url = new URL(request.url);
      return HttpResponse.json(
        {
          id: 123,
          diningCommonsCode: url.searchParams.get("diningCommonsCode"),
          name: url.searchParams.get("name"),
          station: url.searchParams.get("station"),
        },
        { status: 200 },
      );
    }),
  ],
};
