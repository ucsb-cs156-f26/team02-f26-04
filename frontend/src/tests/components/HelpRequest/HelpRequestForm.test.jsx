import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import HelpRequestForm from "main/components/HelpRequest/HelpRequestForm";

const mockNavigate = vi.fn();

vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useNavigate: () => mockNavigate,
  };
});

describe("HelpRequestForm tests", () => {
  const testId = "HelpRequestForm";

  test("renders create defaults when initialContents is not provided", () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <HelpRequestForm {...props} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test("renders create defaults when initialContents is not provided", () => {
    renderForm({ submitAction: vi.fn() });

    expect(screen.getByTestId(`${testId}-solved`)).not.toBeChecked();
    expect(screen.getByTestId(`${testId}-submit`)).toHaveTextContent("Create");
    expect(screen.queryByTestId(`${testId}-id`)).not.toBeInTheDocument();
  });

  test("uses an empty request time when initial request time is missing", () => {
    renderForm({
      initialContents: {
        id: 17,
        requesterEmail: "student1@ucsb.edu",
        teamId: "team01",
        tableOrBreakoutRoom: "Table 3",
        explanation: "Need help.",
        solved: false,
      },
      submitAction: vi.fn(),
      buttonLabel: "Update",
    });

    expect(screen.getByTestId(`${testId}-requestTime`)).toHaveValue("");
  });

  test("renders correctly when creating a HelpRequest", () => {
    renderForm({ submitAction: vi.fn() });

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

  test("renders correctly when updating a HelpRequest", () => {
    renderForm({
      initialContents: oneHelpRequest,
      submitAction: vi.fn(),
      buttonLabel: "Update",
    });

    expect(screen.getByTestId(`${testId}-submit`)).toHaveTextContent("Update");
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
    expect(screen.getByTestId(`${testId}-requestTime`)).toHaveValue(
      oneHelpRequest.requestTime,
    );
    expect(screen.getByTestId(`${testId}-explanation`)).toHaveValue(
      oneHelpRequest.explanation,
    );
  });

  test("Cancel button navigates back", () => {
    render(
      <MemoryRouter>
        <HelpRequestForm submitAction={vi.fn()} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId("HelpRequestForm-cancel"));

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
  test.each([
  ["requesterEmail", "Requester email is required."],
  ["teamId", "Team ID is required."],
  ["tableOrBreakoutRoom", "Table or breakout room is required."],
  ["requestTime", "Request time is required."],
  ["explanation", "Explanation is required."],
])("requires %s before submission", async (field, message) => {
  const submitAction = vi.fn();

  render(
    <MemoryRouter>
      <HelpRequestForm submitAction={submitAction} />
    </MemoryRouter>,
  );

  fireEvent.click(screen.getByTestId("HelpRequestForm-submit"));

    expect(
      await screen.findByText("Requester Email is required."),
    ).toBeInTheDocument();
    expect(screen.getByText("Team ID is required.")).toBeInTheDocument();
    expect(
      screen.getByText("Table or breakout room is required."),
    ).toBeInTheDocument();
    expect(screen.getByText("Request time is required.")).toBeInTheDocument();
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

  test("Cancel button navigates back", () => {
    renderForm({ submitAction: vi.fn() });

    fireEvent.click(screen.getByTestId(`${testId}-cancel`));

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});