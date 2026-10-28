import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import HelpRequestIndexPage from "main/pages/HelpRequest/HelpRequestIndexPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import mockConsole from "tests/testutils/mockConsole";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

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
    useNavigate: () => mockNavigate,
  };
});
describe("HelpRequestIndexPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const testId = "HelpRequestTable";

  const setupUserOnly = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
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

  const queryClient = new QueryClient();

  test("renders Create button for admin user", async () => {
    setupAdminUser();
    axiosMock.onGet("/api/HelpRequest/all").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const button = await screen.findByText(/Create HelpRequest/);
    expect(button).toHaveAttribute("href", "/helprequest/create");
    expect(button).toHaveAttribute("style", "float: right;");
  });

  test("renders three HelpRequests correctly for regular user", async () => {
    setupUserOnly();
    axiosMock
      .onGet("/api/HelpRequest/all")
      .reply(200, helpRequestFixtures.threeHelpRequests);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-id`),
      ).toBeInTheDocument();
    });

    // Verify all column headers.
    expect(screen.getByText("ID")).toBeInTheDocument();
    expect(screen.getByText("Requester Email")).toBeInTheDocument();
    expect(screen.getByText("Team ID")).toBeInTheDocument();
    expect(screen.getByText("Table or Breakout Room")).toBeInTheDocument();
    expect(screen.getByText("Request Time")).toBeInTheDocument();
    expect(screen.getByText("Explanation")).toBeInTheDocument();
    expect(screen.getByText("Solved")).toBeInTheDocument();

    // Verify values in the first three rows.
    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "1",
    );
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "2",
    );
    expect(screen.getByTestId(`${testId}-cell-row-2-col-id`)).toHaveTextContent(
      "3",
    );

    // Verify the tableOrBreakoutRoom column has data.
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-tableOrBreakoutRoom`),
    ).not.toBeEmptyDOMElement();

    // Verify the requestTime column has data.
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-requestTime`),
    ).not.toBeEmptyDOMElement();

    // Verify the solved column has data.
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-solved`),
    ).not.toBeEmptyDOMElement();

    expect(screen.getByText("student1@ucsb.edu")).toBeInTheDocument();
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-teamId`),
    ).toHaveTextContent("team02");
    expect(screen.getByText("Need help debugging tests")).toBeInTheDocument();

    // Regular users should not see admin controls.
    expect(screen.queryByText("Create HelpRequest")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Delete-button`),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Edit-button`),
    ).not.toBeInTheDocument();
  });

  test("renders empty table when backend unavailable", async () => {
    setupUserOnly();
    axiosMock.onGet("/api/HelpRequest/all").timeout();

    const restoreConsole = mockConsole();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
    });

    expect(console.error.mock.calls[0][0]).toMatch(
      "Error communicating with backend via GET on /api/HelpRequest/all",
    );

    restoreConsole();
  });

  test("deletes a HelpRequest as admin", async () => {
    setupAdminUser();

    axiosMock
      .onGet("/api/HelpRequest/all")
      .reply(200, helpRequestFixtures.threeHelpRequests);
    axiosMock
      .onDelete("/api/HelpRequest")
      .reply(200, "HelpRequest with id 1 was deleted");

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const deleteButton = await screen.findByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );

    // Verify that the Delete button uses the danger variant.
    expect(deleteButton.className).toContain("danger");

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        "HelpRequest with id 1 was deleted",
      );
    });

    await waitFor(() => {
      expect(axiosMock.history.delete.length).toBe(1);
    });

    expect(axiosMock.history.delete[0].url).toBe("/api/HelpRequest");
    expect(axiosMock.history.delete[0].params).toEqual({ id: 1 });
  });

  test("navigates to edit page when admin clicks Edit", async () => {
    setupAdminUser();
    mockNavigate.mockClear();

    axiosMock
      .onGet("/api/HelpRequest/all")
      .reply(200, helpRequestFixtures.threeHelpRequests);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const editButton = await screen.findByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );

    // Verify that the Edit button uses the primary variant.
    expect(editButton.className).toContain("primary");

    fireEvent.click(editButton);

    expect(mockNavigate).toHaveBeenCalledWith("/helprequest/edit/1");
  });

  test("initially renders an empty table before data is loaded", async () => {
    setupUserOnly();

    const freshQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Keep the API request pending.
    axiosMock.onGet("/api/HelpRequest/all").reply(() => new Promise(() => {}));

    render(
      <QueryClientProvider client={freshQueryClient}>
        <MemoryRouter>
          <HelpRequestIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // Wait until the request has started.
    await waitFor(() => {
      expect(
        axiosMock.history.get.some(
          (request) => request.url === "/api/HelpRequest/all",
        ),
      ).toBe(true);
    });

    // The initial state should not contain a fake row.
    expect(screen.queryByText("Stryker was here")).not.toBeInTheDocument();
  });
});
