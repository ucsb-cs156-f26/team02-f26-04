import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import RecommendationRequestEditPage from "main/pages/RecommendationRequest/RecommendationRequestEditPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { afterEach, beforeEach, expect, vi } from "vitest";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((message) => mockToast(message)),
  };
});

const mockNavigate = vi.fn();
const mockNavigateTo = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useParams: vi.fn(() => ({ id: 17 })),
    useNavigate: vi.fn(() => mockNavigate),
    Navigate: vi.fn((props) => {
      mockNavigateTo(props);
      return null;
    }),
  };
});

let axiosMock;

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    React.createElement(
      QueryClientProvider,
      { client: queryClient },
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(RecommendationRequestEditPage),
      ),
    ),
  );
};

describe("RecommendationRequestEditPage tests", () => {
  beforeEach(() => {
    axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);

    axiosMock
      .onGet("/api/recommendationrequests", { params: { id: 17 } })
      .reply(200, {
        ...recommendationRequestFixtures.oneRecommendationRequest,
        id: 17,
      });
    axiosMock.onPut("/api/recommendationrequests").reply(200, {
      id: 17,
      requesterEmail: "updated-student@example.com",
      professorEmail: "updated-professor@example.com",
      explanation: "Updated application",
      dateRequested: "2026-10-28T04:40",
      dateNeeded: "2026-11-20T08:30",
      done: true,
    });
  });

  afterEach(() => {
    mockToast.mockClear();
    mockNavigate.mockClear();
    mockNavigateTo.mockClear();
    axiosMock.restore();
  });

  test("loads the request by id and populates the form", async () => {
    renderPage();

    expect(
      await screen.findByText("Edit Recommendation Request"),
    ).toBeInTheDocument();
    expect(
      await screen.findByTestId("RecommendationRequestForm-id"),
    ).toHaveValue("17");
    expect(
      screen.getByTestId("RecommendationRequestForm-requesterEmail"),
    ).toHaveValue("student@example.com");
    expect(
      screen.getByTestId("RecommendationRequestForm-professorEmail"),
    ).toHaveValue("professor@example.com");
    expect(
      screen.getByTestId("RecommendationRequestForm-explanation"),
    ).toHaveValue("BS/MS program");
    expect(
      screen.getByTestId("RecommendationRequestForm-dateRequested"),
    ).toHaveValue("2026-10-27T04:40");
    expect(
      screen.getByTestId("RecommendationRequestForm-dateNeeded"),
    ).toHaveValue("2026-11-15T00:00");
    expect(
      screen.getByTestId("RecommendationRequestForm-done"),
    ).not.toBeChecked();
    expect(
      axiosMock.history.get.find(
        (request) => request.url === "/api/recommendationrequests",
      ).params,
    ).toEqual({ id: 17 });
  });

  test("submits valid changes to the update endpoint", async () => {
    renderPage();

    await screen.findByTestId("RecommendationRequestForm-id");
    fireEvent.change(
      screen.getByTestId("RecommendationRequestForm-requesterEmail"),
      { target: { value: "updated-student@example.com" } },
    );
    fireEvent.change(
      screen.getByTestId("RecommendationRequestForm-professorEmail"),
      { target: { value: "updated-professor@example.com" } },
    );
    fireEvent.change(
      screen.getByTestId("RecommendationRequestForm-explanation"),
      { target: { value: "Updated application" } },
    );
    fireEvent.change(
      screen.getByTestId("RecommendationRequestForm-dateRequested"),
      { target: { value: "2026-10-28T04:40" } },
    );
    fireEvent.change(
      screen.getByTestId("RecommendationRequestForm-dateNeeded"),
      { target: { value: "2026-11-20T08:30" } },
    );
    fireEvent.click(screen.getByTestId("RecommendationRequestForm-done"));
    fireEvent.click(screen.getByTestId("RecommendationRequestForm-submit"));

    await waitFor(() => expect(axiosMock.history.put).toHaveLength(1));
    expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
    expect(JSON.parse(axiosMock.history.put[0].data)).toEqual({
      requesterEmail: "updated-student@example.com",
      professorEmail: "updated-professor@example.com",
      explanation: "Updated application",
      dateRequested: "2026-10-28T04:40",
      dateNeeded: "2026-11-20T08:30",
      done: true,
    });
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        "Recommendation Request Updated - id: 17 requester: updated-student@example.com",
      );
      expect(mockNavigateTo).toHaveBeenCalledWith({
        to: "/recommendationrequest",
      });
    });
  });

  test("does not save invalid changes and shows a validation error", async () => {
    renderPage();

    await screen.findByTestId("RecommendationRequestForm-id");
    fireEvent.change(
      screen.getByTestId("RecommendationRequestForm-dateNeeded"),
      { target: { value: "2026-10-27T04:40" } },
    );
    fireEvent.click(screen.getByTestId("RecommendationRequestForm-submit"));

    expect(
      await screen.findByText("Date needed must be after date requested."),
    ).toBeInTheDocument();
    expect(axiosMock.history.put).toHaveLength(0);
    expect(mockToast).not.toHaveBeenCalled();
  });

  test("cancel returns to the previous page without saving", async () => {
    renderPage();

    await screen.findByTestId("RecommendationRequestForm-id");
    fireEvent.change(
      screen.getByTestId("RecommendationRequestForm-explanation"),
      { target: { value: "An unsaved change" } },
    );
    fireEvent.click(screen.getByTestId("RecommendationRequestForm-cancel"));

    expect(mockNavigate).toHaveBeenCalledWith(-1);
    expect(axiosMock.history.put).toHaveLength(0);
    expect(mockToast).not.toHaveBeenCalled();
  });
});
