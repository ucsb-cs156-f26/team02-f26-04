import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UCSBOrganizationCreatePage from "main/pages/UCSBOrganization/UCSBOrganizationCreatePage";
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

describe("UCSBOrganizationCreatePage tests", () => {
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
          <UCSBOrganizationCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Organization Code")).toBeInTheDocument();
    });
    expect(screen.getByText("Create New UCSBOrganization")).toBeInTheDocument();
  });

  test("on submit, makes request to backend, and redirects to /ucsborganization", async () => {
    const queryClient = new QueryClient();
    const organization = {
      orgCode: "ZPR",
      orgTranslationShort: "ZETA PHI RHO",
      orgTranslation: "ZETA PHI RHO FRATERNITY",
      inactive: true,
    };

    axiosMock.onPost("/api/ucsborganization/post").reply(202, organization);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Organization Code")).toBeInTheDocument();
    });

    const orgCodeInput = screen.getByLabelText("Organization Code");
    const shortNameInput = screen.getByLabelText("Short Name");
    const fullNameInput = screen.getByLabelText("Full Name");
    const inactiveCheckbox = screen.getByLabelText("Inactive");
    const createButton = screen.getByText("Create");

    fireEvent.change(orgCodeInput, { target: { value: "ZPR" } });
    fireEvent.change(shortNameInput, { target: { value: "ZETA PHI RHO" } });
    fireEvent.change(fullNameInput, {
      target: { value: "ZETA PHI RHO FRATERNITY" },
    });
    fireEvent.click(inactiveCheckbox);
    fireEvent.click(createButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      orgCode: "ZPR",
      orgTranslationShort: "ZETA PHI RHO",
      orgTranslation: "ZETA PHI RHO FRATERNITY",
      inactive: true,
    });

    // assert - check that the toast was called with the expected message
    expect(mockToast).toBeCalledWith(
      "New organization Created - orgCode: ZPR orgTranslationShort: ZETA PHI RHO",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/ucsborganization" });
  });

  test("on submit with invalid data, shows errors and does not call backend", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Organization Code")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Create"));

    await screen.findByText(/Organization Code is required/);
    expect(axiosMock.history.post.length).toBe(0);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
