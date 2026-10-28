import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import RecommendationRequestIndexPage from "main/pages/RecommendationRequest/RecommendationRequestIndexPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes, useParams } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";
import mockConsole from "tests/testutils/mockConsole";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((message) => mockToast(message)),
  };
});

const EditPageRoute = () => {
  const { id } = useParams();
  return React.createElement("p", null, `Edit page route matched: ${id}`);
};

describe("RecommendationRequestIndexPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const testId = "RecommendationRequestTable";

  const setupUserOnly = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock
      .onGet("/api/recommendationrequests/all")
      .reply(200, recommendationRequestFixtures.threeRecommendationRequests);
  };

  const setupAdminUser = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  const renderPage = (
    initialEntries = ["/recommendationrequest"],
    queryClient = new QueryClient(),
  ) =>
    render(
      React.createElement(
        QueryClientProvider,
        { client: new QueryClient() },
        React.createElement(
          MemoryRouter,
          { initialEntries },
          React.createElement(
            Routes,
            null,
            React.createElement(Route, {
              path: "/recommendationrequest",
              element: React.createElement(RecommendationRequestIndexPage),
            }),
            React.createElement(Route, {
              path: "/recommendationrequest/edit/:id",
              element: React.createElement(EditPageRoute),
            }),
          ),
        ),
      ),
    );

  test("renders all requests for a regular user without management buttons", async () => {
    setupUserOnly();

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-id`),
      ).toHaveTextContent("1");
    });
    const listRequest = axiosMock.history.get.find(
      (request) => request.url === "/api/recommendationrequests/all",
    );
    expect(listRequest).toBeDefined();
    expect(listRequest.method).toBe("get");
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "2",
    );
    expect(screen.getByTestId(`${testId}-cell-row-2-col-id`)).toHaveTextContent(
      "3",
    );
    expect(screen.getByText("student@example.com")).toBeInTheDocument();
    expect(
      screen.queryByText("Create Recommendation Request"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Edit-button`),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Delete-button`),
    ).not.toBeInTheDocument();
  });

  test("shows the create button for an admin", async () => {
    setupAdminUser();
    axiosMock.onGet("/api/recommendationrequests/all").reply(200, []);

    renderPage();

    const createButton = await screen.findByText(
      "Create Recommendation Request",
    );
    expect(createButton).toHaveAttribute(
      "href",
      "/recommendationrequest/create",
    );
    expect(createButton).toHaveStyle({ float: "right" });
  });

  test("does not display phantom rows when loading requests fails", async () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock.onGet("/api/recommendationrequests/all").timeout();
    const restoreConsole = mockConsole();

    renderPage();

    await waitFor(() => {
      expect(
        axiosMock.history.get.some(
          (request) => request.url === "/api/recommendationrequests/all",
        ),
      ).toBe(true);
    });

    await waitFor(() => {
      expect(
        screen.queryByTestId(`${testId}-cell-row-0-col-id`),
      ).not.toBeInTheDocument();
    });
    restoreConsole();
  });

  test("admin edit button navigates to the edit URL for that request", async () => {
    setupAdminUser();
    axiosMock
      .onGet("/api/recommendationrequests/all")
      .reply(200, recommendationRequestFixtures.threeRecommendationRequests);

    renderPage();
    const editButton = await screen.findByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );

    fireEvent.click(editButton);

    expect(
      await screen.findByText("Edit page route matched: 1"),
    ).toBeInTheDocument();
  });

  test("admin delete removes request and refreshes the table", async () => {
    setupAdminUser();
    const queryClient = new QueryClient();
    queryClient.setQueryData(["/api/unrelated"], "cached data");
    axiosMock
      .onGet("/api/recommendationrequests/all")
      .replyOnce(200, recommendationRequestFixtures.threeRecommendationRequests)
      .onGet("/api/recommendationrequests/all")
      .reply(
        200,
        recommendationRequestFixtures.threeRecommendationRequests.slice(1),
      );
    axiosMock
      .onDelete("/api/recommendationrequests", { params: { id: 1 } })
      .reply(200, "record 1 deleted");

    renderPage(["/recommendationrequest"], queryClient);
    const deleteButton = await screen.findByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(axiosMock.history.delete).toHaveLength(1);
      expect(axiosMock.history.delete[0].params).toEqual({ id: 1 });
      expect(
        axiosMock.history.get.filter(
          (request) => request.url === "/api/recommendationrequests/all",
        ),
      ).toHaveLength(2);
      expect(queryClient.getQueryState(["/api/unrelated"]).isInvalidated).toBe(
        false,
      );
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-id`),
      ).toHaveTextContent("2");
    });
    expect(screen.queryByText("student@example.com")).not.toBeInTheDocument();
    expect(mockToast).toHaveBeenCalledWith("record 1 deleted");
  });
});
