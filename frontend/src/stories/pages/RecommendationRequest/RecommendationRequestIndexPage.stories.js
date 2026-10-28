import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";
import { http, HttpResponse } from "msw";

import RecommendationRequestIndexPage from "main/pages/RecommendationRequest/RecommendationRequestIndexPage";

export default {
  title: "pages/RecommendationRequest/RecommendationRequestIndexPage",
  component: RecommendationRequestIndexPage,
};

const Template = () => React.createElement(RecommendationRequestIndexPage);

export const Empty = Template.bind({});
Empty.parameters = {
  msw: [
    http.get("/api/currentUser", () =>
      HttpResponse.json(apiCurrentUserFixtures.userOnly, { status: 200 }),
    ),
    http.get("/api/systemInfo", () =>
      HttpResponse.json(systemInfoFixtures.showingNeither, { status: 200 }),
    ),
    http.get("/api/recommendationrequests/all", () =>
      HttpResponse.json([], { status: 200 }),
    ),
  ],
};

export const ThreeItemsOrdinaryUser = Template.bind({});
ThreeItemsOrdinaryUser.parameters = {
  msw: [
    http.get("/api/currentUser", () =>
      HttpResponse.json(apiCurrentUserFixtures.userOnly),
    ),
    http.get("/api/systemInfo", () =>
      HttpResponse.json(systemInfoFixtures.showingNeither),
    ),
    http.get("/api/recommendationrequests/all", () =>
      HttpResponse.json(
        recommendationRequestFixtures.threeRecommendationRequests,
      ),
    ),
  ],
};

export const ThreeItemsAdminUser = Template.bind({});
ThreeItemsAdminUser.parameters = {
  msw: [
    http.get("/api/currentUser", () =>
      HttpResponse.json(apiCurrentUserFixtures.adminUser),
    ),
    http.get("/api/systemInfo", () =>
      HttpResponse.json(systemInfoFixtures.showingNeither),
    ),
    http.get("/api/recommendationrequests/all", () =>
      HttpResponse.json(
        recommendationRequestFixtures.threeRecommendationRequests,
      ),
    ),
    http.delete("/api/recommendationrequests", () =>
      HttpResponse.json({ message: "record deleted" }, { status: 200 }),
    ),
  ],
};
