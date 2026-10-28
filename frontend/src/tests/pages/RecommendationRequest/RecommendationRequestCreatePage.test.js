import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import RecommendationRequestCreatePage from "main/pages/RecommendationRequest/RecommendationRequestCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";

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

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    Navigate: vi.fn((props) => {
      mockNavigate(props);
      return null;
    }),
  };
});

describe("RecommendationRequestCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  const renderPage = () =>
    render(
      React.createElement(
        QueryClientProvider,
        { client: new QueryClient() },
        React.createElement(
          MemoryRouter,
          null,
          React.createElement(RecommendationRequestCreatePage),
        ),
      ),
    );

  test("renders the Recommendation Request form", async () => {
    renderPage();

    expect(
      await screen.findByText("Create New Recommendation Request"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("RecommendationRequestForm-requesterEmail"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("RecommendationRequestForm-submit"),
    ).toHaveTextContent("Create");
  });

  test("submits valid data and redirects to the index page", async () => {
    const request = recommendationRequestFixtures.oneRecommendationRequest;
    axiosMock.onPost("/api/recommendationrequests/post").reply(202, request);

    renderPage();

    fireEvent.change(
      await screen.findByTestId("RecommendationRequestForm-requesterEmail"),
      { target: { value: request.requesterEmail } },
    );
    fireEvent.change(
      screen.getByTestId("RecommendationRequestForm-professorEmail"),
      { target: { value: request.professorEmail } },
    );
    fireEvent.change(
      screen.getByTestId("RecommendationRequestForm-explanation"),
      { target: { value: request.explanation } },
    );
    fireEvent.change(
      screen.getByTestId("RecommendationRequestForm-dateRequested"),
      { target: { value: "2026-10-27T04:40" } },
    );
    fireEvent.change(
      screen.getByTestId("RecommendationRequestForm-dateNeeded"),
      { target: { value: "2026-11-15T00:00" } },
    );
    fireEvent.click(screen.getByTestId("RecommendationRequestForm-submit"));

    await waitFor(() => expect(axiosMock.history.post).toHaveLength(1));
    expect(axiosMock.history.post[0].url).toBe(
      "/api/recommendationrequests/post",
    );
    expect(axiosMock.history.post[0].params).toEqual({
      requesterEmail: request.requesterEmail,
      professorEmail: request.professorEmail,
      explanation: request.explanation,
      dateRequested: "2026-10-27T04:40",
      dateNeeded: "2026-11-15T00:00",
      done: false,
    });
    expect(mockToast).toHaveBeenCalledWith(
      "Recommendation Request Created - id: 1 requester: student@example.com",
    );
    expect(mockNavigate).toHaveBeenCalledWith({
      to: "/recommendationrequest",
    });
  });

  test("does not submit invalid data and stays on the create page", async () => {
    renderPage();

    fireEvent.click(
      await screen.findByTestId("RecommendationRequestForm-submit"),
    );

    expect(
      await screen.findByText("Requester email is required."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Professor email is required."),
    ).toBeInTheDocument();
    expect(screen.getByText("Explanation is required.")).toBeInTheDocument();
    expect(screen.getByText("Date requested is required.")).toBeInTheDocument();
    expect(screen.getByText("Date needed is required.")).toBeInTheDocument();
    expect(axiosMock.history.post).toHaveLength(0);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(
      screen.getByText("Create New Recommendation Request"),
    ).toBeInTheDocument();
  });
});
