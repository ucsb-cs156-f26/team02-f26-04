import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import UCSBOrganizationForm from "main/components/UCSBOrganization/UCSBOrganizationForm";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("UCSBOrganizationForm tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = [
    "Organization Code",
    "Short Name",
    "Full Name",
    "Inactive",
  ];
  const testId = "UCSBOrganizationForm";

  test("renders correctly with no initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    const orgCodeInput = screen.getByTestId(`${testId}-orgCode`);
    expect(orgCodeInput).not.toHaveAttribute("readonly");
    expect(orgCodeInput).toHaveValue("");
    expect(screen.getByTestId(`${testId}-orgTranslationShort`)).toHaveValue("");
    expect(screen.getByTestId(`${testId}-orgTranslation`)).toHaveValue("");
    expect(screen.getByTestId(`${testId}-inactive`)).not.toBeChecked();
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm
            initialContents={ucsbOrganizationFixtures.oneOrganization}
            buttonLabel="Update"
          />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Update/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    const orgCodeInput = screen.getByTestId(`${testId}-orgCode`);
    expect(orgCodeInput).toHaveAttribute("readonly");
    expect(orgCodeInput).toHaveValue("ZPR");
    expect(screen.getByTestId(`${testId}-orgTranslationShort`)).toHaveValue(
      "ZETA PHI RHO",
    );
    expect(screen.getByTestId(`${testId}-orgTranslation`)).toHaveValue(
      "ZETA PHI RHO",
    );
    expect(screen.getByTestId(`${testId}-inactive`)).not.toBeChecked();
  });

  test("checkbox is checked when initialContents is inactive", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm
            initialContents={ucsbOrganizationFixtures.threeOrganizations[2]}
          />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByTestId(`${testId}-inactive`)).toBeChecked();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm />
        </Router>
      </QueryClientProvider>,
    );
    expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
    const cancelButton = screen.getByTestId(`${testId}-cancel`);

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("that the correct validations are performed", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    const submitButton = screen.getByText(/Create/);
    fireEvent.click(submitButton);

    await screen.findByText(/Organization Code is required/);
    expect(screen.getByText(/Short Name is required/)).toBeInTheDocument();
    expect(screen.getByText(/Full Name is required/)).toBeInTheDocument();

    fireEvent.change(screen.getByTestId(`${testId}-orgCode`), {
      target: { value: "a".repeat(11) },
    });
    fireEvent.change(screen.getByTestId(`${testId}-orgTranslationShort`), {
      target: { value: "a".repeat(31) },
    });
    fireEvent.change(screen.getByTestId(`${testId}-orgTranslation`), {
      target: { value: "a".repeat(256) },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Max length 10 characters/)).toBeInTheDocument();
    });
    expect(screen.getByText(/Max length 30 characters/)).toBeInTheDocument();
    expect(screen.getByText(/Max length 255 characters/)).toBeInTheDocument();
  });

  test("no errors and submitAction is called with valid input", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationForm submitAction={mockSubmitAction} />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    fireEvent.change(screen.getByTestId(`${testId}-orgCode`), {
      target: { value: "a".repeat(10) },
    });
    fireEvent.change(screen.getByTestId(`${testId}-orgTranslationShort`), {
      target: { value: "a".repeat(30) },
    });
    fireEvent.change(screen.getByTestId(`${testId}-orgTranslation`), {
      target: { value: "a".repeat(255) },
    });
    fireEvent.click(screen.getByTestId(`${testId}-inactive`));
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());
    expect(mockSubmitAction.mock.calls[0][0]).toEqual({
      orgCode: "a".repeat(10),
      orgTranslationShort: "a".repeat(30),
      orgTranslation: "a".repeat(255),
      inactive: true,
    });

    expect(screen.queryByText(/is required/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Max length/)).not.toBeInTheDocument();
  });
});
