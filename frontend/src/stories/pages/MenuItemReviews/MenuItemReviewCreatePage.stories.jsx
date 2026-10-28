import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";

import MenuItemReviewCreatePage from "main/pages/MenuItemReviews/MenuItemReviewCreatePage";

export default {
  title: "pages/MenuItemReviews/MenuItemReviewCreatePage",
  component: MenuItemReviewCreatePage,
};

const Template = () => <MenuItemReviewCreatePage storybook={true} />;

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
    http.post("/api/menu-item-reviews/post", () => {
      return HttpResponse.json({
    id: 1,
    itemId: 1,
    stars: 5,
    reviewerEmail: "reviewer@example.com",
    dateReviewed: "2022-01-02T12:00:00",
    comments: "Excellent item!",
  }, {
        status: 200,
      });
    }),
  ],
};
