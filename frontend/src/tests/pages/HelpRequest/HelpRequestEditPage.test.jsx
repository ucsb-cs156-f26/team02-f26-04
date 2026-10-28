import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import HelpRequestEditPage from "main/pages/HelpRequest/HelpRequestEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import mockConsole from "tests/testutils/mockConsole";
import { beforeEach, afterEach } from "vitest";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useParams: vi.fn(() => ({
      id: 17,
    })),
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

let axiosMock;

const helpRequest = {
  id: 17,
  requesterEmail: "student1@ucsb.edu",
  teamId: "team01",
  tableOrBreakoutRoom: "Table 3",
  requestTime: "2026-10-20T14:30:00",
  explanation: "I need help understanding the assignment.",
  solved: false,
};

describe("HelpRequestEditPage tests", () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  beforeEach(() => {
    queryClient.clear();
    mockToast.mockClear();
    mockNavigate.mockClear();
    axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  afterEach(() => {
    axiosMock.restore();
    axiosMock.resetHistory();
  });

  const renderPage = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestEditPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

  test("renders header when backend does not return data", async () => {
    const restoreConsole = mockConsole();
    axiosMock.onGet("/api/HelpRequest", { params: { id: 17 } }).timeout();

    renderPage();

    await screen.findByText(/Welcome/);
    await screen.findByText("Edit HelpRequest");

    expect(
      screen.queryByTestId("HelpRequestForm-requesterEmail"),
    ).not.toBeInTheDocument();

    restoreConsole();
  });

  test("renders and populates the form with the existing HelpRequest", async () => {
    axiosMock
      .onGet("/api/HelpRequest", { params: { id: 17 } })
      .reply(200, helpRequest);

    renderPage();

    const emailField = await screen.findByTestId(
      "HelpRequestForm-requesterEmail",
    );

    expect(screen.getByTestId("HelpRequestForm-id")).toHaveValue("17");
    expect(emailField).toHaveValue("student1@ucsb.edu");
    expect(screen.getByTestId("HelpRequestForm-teamId")).toHaveValue("team01");
    expect(
      screen.getByTestId("HelpRequestForm-tableOrBreakoutRoom"),
    ).toHaveValue("Table 3");
    expect(screen.getByTestId("HelpRequestForm-requestTime")).toHaveValue(
      "2026-10-20T14:30",
    );
    expect(screen.getByTestId("HelpRequestForm-explanation")).toHaveValue(
      "I need help understanding the assignment.",
    );
    expect(screen.getByTestId("HelpRequestForm-solved")).not.toBeChecked();
    expect(screen.getByTestId("HelpRequestForm-submit")).toHaveTextContent(
      "Update",
    );
  });

  test("submits updated data, shows a toast, and redirects", async () => {
    axiosMock
      .onGet("/api/HelpRequest", { params: { id: 17 } })
      .reply(200, helpRequest);

    axiosMock.onPut("/api/HelpRequest").reply(200, {
      ...helpRequest,
      requesterEmail: "student2@ucsb.edu",
      teamId: "team02",
      tableOrBreakoutRoom: "Breakout Room A",
      requestTime: "2026-10-21T15:00",
      explanation: "Updated explanation",
      solved: true,
    });

    renderPage();

    const emailField = await screen.findByTestId(
      "HelpRequestForm-requesterEmail",
    );

    fireEvent.change(emailField, {
      target: { value: "student2@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId("HelpRequestForm-teamId"), {
      target: { value: "team02" },
    });
    fireEvent.change(
      screen.getByTestId("HelpRequestForm-tableOrBreakoutRoom"),
      {
        target: { value: "Breakout Room A" },
      },
    );
    fireEvent.change(screen.getByTestId("HelpRequestForm-requestTime"), {
      target: { value: "2026-10-21T15:00" },
    });
    fireEvent.change(screen.getByTestId("HelpRequestForm-explanation"), {
      target: { value: "Updated explanation" },
    });
    fireEvent.click(screen.getByTestId("HelpRequestForm-solved"));
    fireEvent.click(screen.getByTestId("HelpRequestForm-submit"));

    await waitFor(() => expect(mockToast).toHaveBeenCalled());

    expect(mockToast).toHaveBeenCalledWith("HelpRequest Updated - id: 17");
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/helprequest" });

    expect(axiosMock.history.put).toHaveLength(1);
    expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
    expect(JSON.parse(axiosMock.history.put[0].data)).toEqual({
      requesterEmail: "student2@ucsb.edu",
      teamId: "team02",
      tableOrBreakoutRoom: "Breakout Room A",
      requestTime: "2026-10-21T15:00",
      explanation: "Updated explanation",
      solved: true,
    });
  });
});