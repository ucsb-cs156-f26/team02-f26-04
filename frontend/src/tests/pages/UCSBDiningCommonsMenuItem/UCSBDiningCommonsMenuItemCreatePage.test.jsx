import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UCSBDiningCommonsMenuItemCreatePage from "main/pages/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

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
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

describe("UCSBDiningCommonsMenuItemCreatePage tests", () => {
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

  const queryClient = new QueryClient();
  test("renders without crashing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBDiningCommonsMenuItemCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Name")).toBeInTheDocument();
    });

    // Check the page title, form fields, and create button.
    expect(
      screen.getByRole("heading", {
        name: "Create New UCSBDiningCommonsMenuItem",
      }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Dining Commons Code")).toBeInTheDocument();
    expect(screen.getByLabelText("Station")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument();
  });

  test("on submit, makes request to backend, and redirects to /diningcommonsmenuitem", async () => {
    const queryClient = new QueryClient();
    const menuItem = {
      id: 3,
      diningCommonsCode: "ortega",
      name: "Grilled Cheese",
      station: "Grill",
    };

    axiosMock
      .onPost("/api/UCSBDiningCommonsMenuItem/post")
      .reply(200, menuItem);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBDiningCommonsMenuItemCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Name")).toBeInTheDocument();
    });

    // Fill in all three fields and submit the form.
    const nameInput = screen.getByLabelText("Name");
    const diningCommonsCodeInput = screen.getByLabelText("Dining Commons Code");
    const stationInput = screen.getByLabelText("Station");
    const createButton = screen.getByRole("button", { name: "Create" });

    fireEvent.change(nameInput, {
      target: { value: "Grilled Cheese" },
    });
    fireEvent.change(diningCommonsCodeInput, {
      target: { value: "ortega" },
    });
    fireEvent.change(stationInput, {
      target: { value: "Grill" },
    });
    fireEvent.click(createButton);

    // Send exactly one request with the expected form data.
    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      diningCommonsCode: "ortega",
      name: "Grilled Cheese",
      station: "Grill",
    });

    // Show the success message and return to the menu item index page.
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        "New menu item created - id: 3 name: Grilled Cheese",
      );
      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/diningcommonsmenuitem",
      });
    });
  });

  // Storybook should show success without leaving the preview.
  test("submits successfully without redirecting in Storybook mode", async () => {
    const queryClient = new QueryClient();
    const menuItem = {
      id: 3,
      diningCommonsCode: "ortega",
      name: "Grilled Cheese",
      station: "Grill",
    };

    axiosMock
      .onPost("/api/UCSBDiningCommonsMenuItem/post")
      .reply(200, menuItem);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBDiningCommonsMenuItemCreatePage storybook={true} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Name")).toBeInTheDocument();
    });

    // Fill in all three fields and submit the form.
    const nameInput = screen.getByLabelText("Name");
    const diningCommonsCodeInput = screen.getByLabelText("Dining Commons Code");
    const stationInput = screen.getByLabelText("Station");
    const createButton = screen.getByRole("button", { name: "Create" });

    fireEvent.change(nameInput, {
      target: { value: "Grilled Cheese" },
    });
    fireEvent.change(diningCommonsCodeInput, {
      target: { value: "ortega" },
    });
    fireEvent.change(stationInput, {
      target: { value: "Grill" },
    });
    fireEvent.click(createButton);

    // Send exactly one request with the expected form data.
    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      diningCommonsCode: "ortega",
      name: "Grilled Cheese",
      station: "Grill",
    });

    // Wait for success, then verify that the preview stays on the create page.
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        "New menu item created - id: 3 name: Grilled Cheese",
      );
    });

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(
      screen.getByRole("heading", {
        name: "Create New UCSBDiningCommonsMenuItem",
      }),
    ).toBeInTheDocument();
  });

  // Empty required fields should prevent submission.
  test("does not submit when required fields are empty", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBDiningCommonsMenuItemCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByLabelText("Name");
    // Submit the empty form.
    fireEvent.click(screen.getByRole("button", { name: "Create" }));
    // Show an error for each empty required field.
    expect(await screen.findByText("Name is required.")).toBeInTheDocument();
    expect(
      await screen.findByText("Dining Commons Code is required."),
    ).toBeInTheDocument();
    expect(await screen.findByText("Station is required.")).toBeInTheDocument();

    // Invalid input must not trigger a request, success message, or redirect.
    expect(axiosMock.history.post).toHaveLength(0);
    expect(mockToast).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(
      screen.getByRole("heading", {
        name: "Create New UCSBDiningCommonsMenuItem",
      }),
    ).toBeInTheDocument();
  });
});
