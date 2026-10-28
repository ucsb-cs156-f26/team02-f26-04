import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
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
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test("renders create defaults when initialContents is not provided", () => {
    render(
      <MemoryRouter>
        <HelpRequestForm submitAction={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("HelpRequestForm-solved")).not.toBeChecked();
    expect(screen.getByTestId("HelpRequestForm-submit")).toHaveTextContent(
      "Create",
    );
    expect(screen.queryByTestId("HelpRequestForm-id")).not.toBeInTheDocument();
  });

  test("uses an empty request time when initial request time is missing", () => {
    render(
      <MemoryRouter>
        <HelpRequestForm
          initialContents={{
            id: 17,
            requesterEmail: "student1@ucsb.edu",
            teamId: "team01",
            tableOrBreakoutRoom: "Table 3",
            explanation: "Need help.",
            solved: false,
          }}
          submitAction={vi.fn()}
          buttonLabel="Update"
        />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("HelpRequestForm-requestTime")).toHaveValue("");
    expect(screen.getByTestId("HelpRequestForm-submit")).toHaveTextContent(
      "Update",
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

  expect(await screen.findByText(message)).toBeInTheDocument();
  expect(submitAction).not.toHaveBeenCalled();
});
});
