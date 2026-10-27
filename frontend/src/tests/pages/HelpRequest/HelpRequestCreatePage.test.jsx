import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HelpRequestCreatePage from "main/pages/HelpRequest/HelpRequestCreatePage";
import HelpRequestForm from "main/components/HelpRequest/HelpRequestForm";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = vi.fn();
const mockNavigate = vi.fn();

vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    Navigate: vi.fn((props) => {
      mockNavigate(props);
      return null;
    }),
    useNavigate: () => mockNavigate,
  };
});

describe("HelpRequestCreatePage tests", () => {
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

  const renderPage = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  test("renders without crashing", async () => {
    renderPage();

    expect(
      await screen.findByRole("heading", { name: "Create Help Request" }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Requester Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Team ID")).toBeInTheDocument();
    expect(screen.getByLabelText("Table or Breakout Room")).toBeInTheDocument();
    expect(screen.getByLabelText("Request Time")).toBeInTheDocument();
    expect(screen.getByLabelText("Explanation")).toBeInTheDocument();
    expect(screen.getByLabelText("Solved")).toBeInTheDocument();
  });

  test("invalid submission shows errors and does not call the API", async () => {
    renderPage();

    await screen.findByLabelText("Requester Email");

    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    expect(
      await screen.findByText("Requester email is required."),
    ).toBeInTheDocument();

    expect(screen.getByText("Team ID is required.")).toBeInTheDocument();
    expect(
      screen.getByText("Table or breakout room is required."),
    ).toBeInTheDocument();
    expect(screen.getByText("Request time is required.")).toBeInTheDocument();
    expect(screen.getByText("Explanation is required.")).toBeInTheDocument();

    expect(axiosMock.history.post.length).toBe(0);
  });

  test("invalid email format shows an error", async () => {
    renderPage();

    const emailInput = await screen.findByLabelText("Requester Email");

    fireEvent.change(emailInput, {
      target: { value: "not-an-email" },
    });

    fireEvent.change(screen.getByLabelText("Team ID"), {
      target: { value: "team02-f26-04" },
    });
    fireEvent.change(screen.getByLabelText("Table or Breakout Room"), {
      target: { value: "Library 2510" },
    });
    fireEvent.change(screen.getByLabelText("Request Time"), {
      target: { value: "2026-10-26T14:30" },
    });
    fireEvent.change(screen.getByLabelText("Explanation"), {
      target: { value: "Need help" },
    });

    // Submit the form directly to trigger React Hook Form validation.
    fireEvent.submit(emailInput.closest("form"));

    expect(
      await screen.findByText("Enter a valid email address."),
    ).toBeInTheDocument();

    expect(axiosMock.history.post.length).toBe(0);
  });
  test("valid submission calls the API and redirects to /helprequest", async () => {
    const helpRequest = {
      id: 3,
      requesterEmail: "student@ucsb.edu",
      teamId: "team02-f26-04",
      tableOrBreakoutRoom: "Library 2510",
      requestTime: "2026-10-26T14:30",
      explanation: "I need help with my laptop.",
      solved: false,
    };

    axiosMock.onPost("/api/HelpRequest/post").reply(202, helpRequest);

    renderPage();

    await screen.findByLabelText("Requester Email");

    fireEvent.change(screen.getByLabelText("Requester Email"), {
      target: { value: helpRequest.requesterEmail },
    });
    fireEvent.change(screen.getByLabelText("Team ID"), {
      target: { value: helpRequest.teamId },
    });
    fireEvent.change(screen.getByLabelText("Table or Breakout Room"), {
      target: { value: helpRequest.tableOrBreakoutRoom },
    });
    fireEvent.change(screen.getByLabelText("Request Time"), {
      target: { value: helpRequest.requestTime },
    });
    fireEvent.change(screen.getByLabelText("Explanation"), {
      target: { value: helpRequest.explanation },
    });

    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(1);
    });

    expect(axiosMock.history.post[0].url).toBe("/api/HelpRequest/post");
    expect(axiosMock.history.post[0].params).toEqual({
      requesterEmail: helpRequest.requesterEmail,
      teamId: helpRequest.teamId,
      tableOrBreakoutRoom: helpRequest.tableOrBreakoutRoom,
      requestTime: helpRequest.requestTime,
      explanation: helpRequest.explanation,
      solved: false,
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        "New help request created - id: 3",
      );
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/helprequest" });
    });
  });

  test("initial contents populate fields and unspecified fields keep defaults", () => {
    render(
      <MemoryRouter>
        <HelpRequestForm
          initialContents={{ requesterEmail: "student@ucsb.edu" }}
          submitAction={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText("Requester Email")).toHaveValue(
      "student@ucsb.edu",
    );
    expect(screen.getByLabelText("Team ID")).toHaveValue("");
    expect(screen.getByLabelText("Table or Breakout Room")).toHaveValue("");
    expect(screen.getByLabelText("Request Time")).toHaveValue("");
    expect(screen.getByLabelText("Explanation")).toHaveValue("");
    expect(screen.getByLabelText("Solved")).not.toBeChecked();
    expect(screen.getByLabelText("Request Time")).toHaveValue("");
  });

  test("form controls have their expected test IDs", async () => {
    renderPage();

    expect(
      await screen.findByTestId("HelpRequestForm-requesterEmail"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("HelpRequestForm-teamId")).toBeInTheDocument();
    expect(
      screen.getByTestId("HelpRequestForm-tableOrBreakoutRoom"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("HelpRequestForm-requestTime"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("HelpRequestForm-explanation"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("HelpRequestForm-solved")).toBeInTheDocument();
    expect(screen.getByTestId("HelpRequestForm-submit")).toBeInTheDocument();
    expect(screen.getByTestId("HelpRequestForm-cancel")).toBeInTheDocument();
  });

  test("Cancel button navigates backward", async () => {
    renderPage();

    await screen.findByLabelText("Requester Email");

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
  test.each([
    ["prefix user@example.com", "prefix user@example.com"],
    ["user@example.com suffix", "user@example.com suffix"],
  ])("rejects malformed email %s", async (_label, email) => {
    renderPage();

    fireEvent.change(await screen.findByLabelText("Requester Email"), {
      target: { value: email },
    });

    fireEvent.change(screen.getByLabelText("Team ID"), {
      target: { value: "team02-f26-04" },
    });
    fireEvent.change(screen.getByLabelText("Table or Breakout Room"), {
      target: { value: "Library 2510" },
    });
    fireEvent.change(screen.getByLabelText("Request Time"), {
      target: { value: "2026-10-26T14:30" },
    });
    fireEvent.change(screen.getByLabelText("Explanation"), {
      target: { value: "Need help" },
    });

    fireEvent.submit(screen.getByLabelText("Requester Email").closest("form"));

    expect(
      await screen.findByText("Enter a valid email address."),
    ).toBeInTheDocument();
    expect(axiosMock.history.post.length).toBe(0);
  });
  test("request time defaults to empty when not provided", () => {
    render(
      <MemoryRouter>
        <HelpRequestForm
          initialContents={{
            requesterEmail: "student@example.com",
            teamId: "team02-f26-04",
          }}
          submitAction={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText("Request Time")).toHaveValue("");
  });
});
