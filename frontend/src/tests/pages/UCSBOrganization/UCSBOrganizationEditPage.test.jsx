import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import UCSBOrganizationEditPage from "main/pages/UCSBOrganization/UCSBOrganizationEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "tests/testutils/mockConsole";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockNavigate = vi.fn();
const mockUseNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useParams: vi.fn(() => ({
      id: "ZPR",
    })),
    useNavigate: () => mockUseNavigate,
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

let axiosMock;
describe("UCSBOrganizationEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock
        .onGet("/api/ucsborganization", { params: { orgCode: "ZPR" } })
        .timeout();
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();
    test("renders header but form is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBOrganizationEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit UCSBOrganization");
      expect(
        screen.queryByTestId("UCSBOrganizationForm-orgCode"),
      ).not.toBeInTheDocument();
      restoreConsole();
    });
  });

  describe("tests where backend is working normally", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock
        .onGet("/api/ucsborganization", { params: { orgCode: "ZPR" } })
        .reply(200, {
          orgCode: "ZPR",
          orgTranslationShort: "ZETA PHI RHO",
          orgTranslation: "ZETA PHI RHO",
          inactive: false,
        });
      axiosMock.onPut("/api/ucsborganization").reply(200, {
        orgCode: "ZPR",
        orgTranslationShort: "ZPR FRATERNITY",
        orgTranslation: "ZETA PHI RHO FRATERNITY",
        inactive: true,
      });
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      mockUseNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();

    test("Is populated with the data provided, and changes are saved on Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBOrganizationEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("UCSBOrganizationForm-orgCode");

      const orgCodeField = screen.getByTestId("UCSBOrganizationForm-orgCode");
      const shortNameField = screen.getByTestId(
        "UCSBOrganizationForm-orgTranslationShort",
      );
      const fullNameField = screen.getByTestId(
        "UCSBOrganizationForm-orgTranslation",
      );
      const inactiveField = screen.getByTestId("UCSBOrganizationForm-inactive");
      const submitButton = screen.getByTestId("UCSBOrganizationForm-submit");

      expect(orgCodeField).toHaveValue("ZPR");
      expect(orgCodeField).toHaveAttribute("readonly");
      expect(shortNameField).toHaveValue("ZETA PHI RHO");
      expect(fullNameField).toHaveValue("ZETA PHI RHO");
      expect(inactiveField).not.toBeChecked();
      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(shortNameField, {
        target: { value: "ZPR FRATERNITY" },
      });
      fireEvent.change(fullNameField, {
        target: { value: "ZETA PHI RHO FRATERNITY" },
      });
      fireEvent.click(inactiveField);
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "UCSBOrganization Updated - orgCode: ZPR orgTranslationShort: ZPR FRATERNITY",
      );

      expect(mockNavigate).toBeCalledWith({ to: "/ucsborganization" });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ orgCode: "ZPR" });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          orgTranslationShort: "ZPR FRATERNITY",
          orgTranslation: "ZETA PHI RHO FRATERNITY",
          inactive: true,
        }),
      ); // posted object
    });

    test("Invalid data is not saved and shows an error", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBOrganizationEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("UCSBOrganizationForm-orgCode");

      const shortNameField = screen.getByTestId(
        "UCSBOrganizationForm-orgTranslationShort",
      );
      fireEvent.change(shortNameField, { target: { value: "" } });
      fireEvent.click(screen.getByTestId("UCSBOrganizationForm-submit"));

      await screen.findByText(/Short Name is required/);
      expect(axiosMock.history.put.length).toBe(0);
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test("Cancel does not save and goes back", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBOrganizationEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("UCSBOrganizationForm-orgCode");

      fireEvent.change(
        screen.getByTestId("UCSBOrganizationForm-orgTranslationShort"),
        { target: { value: "CHANGED" } },
      );
      fireEvent.click(screen.getByTestId("UCSBOrganizationForm-cancel"));

      await waitFor(() => expect(mockUseNavigate).toHaveBeenCalledWith(-1));
      expect(axiosMock.history.put.length).toBe(0);
    });
  });
});
