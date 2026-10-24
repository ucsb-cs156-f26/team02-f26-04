import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import UCSBDiningCommonsMenuItemForm from "main/components/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemForm";
import { ucsbDiningCommonsMenuItemFixtures } from "fixtures/ucsbDiningCommonsMenuItemFixtures";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("UCSBDiningCommonsMenuItemForm tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = ["Name", "Dining Commons Code", "Station"];
  const testId = "UCSBDiningCommonsMenuItemForm";

  // Checks that the create form shows its labels and hides the Id field.
  test("renders correctly with no initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBDiningCommonsMenuItemForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expect(screen.queryByTestId(`${testId}-id`)).not.toBeInTheDocument();
  });

  // Checks that existing data fills the form and the Id cannot be edited.
  test("renders correctly when passing in initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBDiningCommonsMenuItemForm
            initialContents={ucsbDiningCommonsMenuItemFixtures.oneMenuItem[0]}
          />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expect(await screen.findByTestId(`${testId}-id`)).toBeInTheDocument();
    expect(screen.getByText(`Id`)).toBeInTheDocument();

    expect(screen.getByTestId(`${testId}-id`)).toBeDisabled();
    expect(screen.getByTestId(`${testId}-name`)).toHaveValue("Grilled Cheese");
    expect(screen.getByTestId(`${testId}-diningCommonsCode`)).toHaveValue(
      "carrillo",
    );
    expect(screen.getByTestId(`${testId}-station`)).toHaveValue("Grill");
  });

  // Checks that clicking Cancel asks the app to go back one page.
  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBDiningCommonsMenuItemForm />
        </Router>
      </QueryClientProvider>,
    );
    expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
    const cancelButton = screen.getByTestId(`${testId}-cancel`);

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  // Checks that empty or spaces-only fields show errors and block submission.
  test("rejects empty and whitespace-only fields", async () => {
    const submitAction = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBDiningCommonsMenuItemForm submitAction={submitAction} />
        </Router>
      </QueryClientProvider>,
    );

    const submitButton = screen.getByTestId(`${testId}-submit`);

    fireEvent.click(submitButton);

    expect(await screen.findByText("Name is required.")).toBeInTheDocument();
    expect(
      await screen.findByText("Dining Commons Code is required."),
    ).toBeInTheDocument();
    expect(await screen.findByText("Station is required.")).toBeInTheDocument();
    expect(submitAction).not.toHaveBeenCalled();

    for (const field of ["name", "diningCommonsCode", "station"]) {
      fireEvent.change(screen.getByTestId(`${testId}-${field}`), {
        target: { value: "   " },
      });
    }

    fireEvent.click(submitButton);

    expect(
      await screen.findByText("Name cannot be blank."),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Dining Commons Code cannot be blank."),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Station cannot be blank."),
    ).toBeInTheDocument();
    expect(submitAction).not.toHaveBeenCalled();
  });

  // Checks that valid input is submitted once with the correct field values.
  test("submits valid data correctly", async () => {
    const submitAction = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBDiningCommonsMenuItemForm submitAction={submitAction} />
        </Router>
      </QueryClientProvider>,
    );

    const validData = {
      name: "Grilled Cheese",
      diningCommonsCode: "carrillo",
      station: "Grill",
    };

    for (const [field, value] of Object.entries(validData)) {
      fireEvent.change(screen.getByTestId(`${testId}-${field}`), {
        target: { value },
      });
    }

    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => {
      expect(submitAction).toHaveBeenCalledTimes(1);
    });

    expect(submitAction.mock.calls[0][0]).toEqual(validData);
  });
});
