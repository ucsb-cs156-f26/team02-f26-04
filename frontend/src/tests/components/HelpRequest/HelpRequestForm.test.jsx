import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import HelpRequestForm from "main/components/HelpRequest/HelpRequestForm";

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

const oneHelpRequest = {
  id: 1,
  requesterEmail: "student1@ucsb.edu",
  teamId: "team01",
  tableOrBreakoutRoom: "Table 3",
  requestTime: "2026-10-20T14:30",
  explanation: "I need help understanding the assignment.",
  solved: false,
};

describe("HelpRequestForm tests", () => {
  const queryClient = new QueryClient();
  const testId = "HelpRequestForm";

  const renderForm = (props = {}) =>
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <HelpRequestForm {...props} />
        </Router>
      </QueryClientProvider>,
    );

  test("renders correctly when creating a HelpRequest", async () => {
    renderForm({ submitAction: vi.fn() });

    expect(await screen.findByText("Create")).toBeInTheDocument();

    [
      "Requester Email",
      "Team ID",
      "Table or Breakout Room",
      "Request Time",
      "Explanation",
      "Solved",
    ].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });

    expect(screen.queryByTestId(`${testId}-id`)).not.toBeInTheDocument();
  });

  test("renders correctly when updating a HelpRequest", async () => {
    renderForm({
      initialContents: oneHelpRequest,
      submitAction: vi.fn(),
      buttonLabel: "Update",
    });

    expect(await screen.findByText("Update")).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-id`)).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-id`)).toBeDisabled();

    expect(screen.getByTestId(`${testId}-requesterEmail`)).toHaveValue(
      oneHelpRequest.requesterEmail,
    );
    expect(screen.getByTestId(`${testId}-teamId`)).toHaveValue(
      oneHelpRequest.teamId,
    );
    expect(screen.getByTestId(`${testId}-tableOrBreakoutRoom`)).toHaveValue(
      oneHelpRequest.tableOrBreakoutRoom,
    );
    expect(screen.getByTestId(`${testId}-explanation`)).toHaveValue(
      oneHelpRequest.explanation,
    );
  });

  test("calls submitAction with valid form data", async () => {
    const submitAction = vi.fn();
    renderForm({ submitAction });

    fireEvent.change(screen.getByTestId(`${testId}-requesterEmail`), {
      target: { value: "student1@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-teamId`), {
      target: { value: "team01" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-tableOrBreakoutRoom`), {
      target: { value: "Table 3" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-requestTime`), {
      target: { value: "2026-10-20T14:30" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
      target: { value: "I need help understanding the assignment." },
    });

    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => {
      expect(submitAction).toHaveBeenCalledWith(
        expect.objectContaining({
          requesterEmail: "student1@ucsb.edu",
          teamId: "team01",
          tableOrBreakoutRoom: "Table 3",
          requestTime: "2026-10-20T14:30",
          explanation: "I need help understanding the assignment.",
          solved: false,
        }),
        expect.anything(),
      );
    });
  });

  test("validates required fields", async () => {
    renderForm({ submitAction: vi.fn() });

    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    expect(
      await screen.findByText("Requester Email is required."),
    ).toBeInTheDocument();
    expect(screen.getByText("Team ID is required.")).toBeInTheDocument();
    expect(
      screen.getByText("Table or Breakout Room is required."),
    ).toBeInTheDocument();
    expect(screen.getByText("Request Time is required.")).toBeInTheDocument();
    expect(screen.getByText("Explanation is required.")).toBeInTheDocument();
  });

  test("validates email format", async () => {
    renderForm({ submitAction: vi.fn() });

    fireEvent.change(screen.getByTestId(`${testId}-requesterEmail`), {
      target: { value: "not-an-email" },
    });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    expect(
      await screen.findByText("Enter a valid email address."),
    ).toBeInTheDocument();
  });

  test("navigates back when Cancel is clicked", async () => {
    renderForm({ submitAction: vi.fn() });

    fireEvent.click(screen.getByTestId(`${testId}-cancel`));

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith(-1);
    });
  });
});
