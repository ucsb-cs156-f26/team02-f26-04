import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Routes, Route } from "react-router";
import UCSBDiningCommonsMenuItemEditPage from "main/pages/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemEditPage";

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
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useParams: vi.fn(() => ({
      id: 17,
    })),
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

let axiosMock;
describe("UCSBDiningCommonsMenuItemEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.adminUser);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock
        .onGet("/api/UCSBDiningCommonsMenuItem", { params: { id: 17 } })
        .timeout();
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();
    test("renders header without the form when loading fails", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBDiningCommonsMenuItemEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit UCSBDiningCommonsMenuItem");
      expect(
        screen.queryByTestId("UCSBDiningCommonsMenuItemForm-name"),
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
        .reply(200, apiCurrentUserFixtures.adminUser);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock
        .onGet("/api/UCSBDiningCommonsMenuItem", { params: { id: 17 } })
        .reply(200, {
          id: 17,
          diningCommonsCode: "ortega",
          name: "Grilled Cheese",
          station: "Grill",
        });

      axiosMock.onPut("/api/UCSBDiningCommonsMenuItem").reply((config) => {
        return [
          200,
          {
            ...JSON.parse(config.data),
            id: Number(config.params.id),
          },
        ];
      });
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    // Load the existing item, update all fields, and return to the list.
    test("loads existing data and saves all three fields", async () => {
      const queryClient = new QueryClient();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBDiningCommonsMenuItemEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      const idField = await screen.findByLabelText("Id");
      const nameField = screen.getByLabelText("Name");
      const codeField = screen.getByLabelText("Dining Commons Code");
      const stationField = screen.getByLabelText("Station");

      expect(idField).toHaveValue("17");
      expect(idField).toBeDisabled();
      expect(nameField).toHaveValue("Grilled Cheese");
      expect(codeField).toHaveValue("ortega");
      expect(stationField).toHaveValue("Grill");

      expect(
        screen.getByRole("heading", {
          name: "Edit UCSBDiningCommonsMenuItem",
        }),
      ).toBeInTheDocument();

      fireEvent.change(nameField, {
        target: { value: "Updated Grilled Cheese" },
      });
      fireEvent.change(codeField, {
        target: { value: "carrillo" },
      });
      fireEvent.change(stationField, {
        target: { value: "Entree" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Update" }));

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          "Menu item updated - id: 17 name: Updated Grilled Cheese",
        );
        expect(mockNavigate).toHaveBeenCalledWith({
          to: "/diningcommonsmenuitem",
        });
      });

      expect(axiosMock.history.put).toHaveLength(1);
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(JSON.parse(axiosMock.history.put[0].data)).toEqual({
        diningCommonsCode: "carrillo",
        name: "Updated Grilled Cheese",
        station: "Entree",
      });
    });
    // Empty required fields must prevent saving.
    test("does not save invalid input", async () => {
      const queryClient = new QueryClient();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBDiningCommonsMenuItemEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByLabelText("Id");

      for (const label of ["Name", "Dining Commons Code", "Station"]) {
        fireEvent.change(screen.getByLabelText(label), {
          target: { value: "" },
        });
      }

      fireEvent.click(screen.getByRole("button", { name: "Update" }));

      expect(await screen.findByText("Name is required.")).toBeInTheDocument();
      expect(
        await screen.findByText("Dining Commons Code is required."),
      ).toBeInTheDocument();
      expect(
        await screen.findByText("Station is required."),
      ).toBeInTheDocument();

      expect(axiosMock.history.put).toHaveLength(0);
      expect(mockToast).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    // Cancel returns to the previous page without saving changed input.
    test("Cancel returns to the previous page without saving", async () => {
      const queryClient = new QueryClient();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter
            initialEntries={[
              "/diningcommonsmenuitem",
              "/diningcommonsmenuitem/edit/17",
            ]}
            initialIndex={1}
          >
            <Routes>
              <Route
                path="/diningcommonsmenuitem"
                element={<h1>Returned to menu item list</h1>}
              />
              <Route
                path="/diningcommonsmenuitem/edit/:id"
                element={<UCSBDiningCommonsMenuItemEditPage />}
              />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>,
      );

      const nameField = await screen.findByLabelText("Name");
      fireEvent.change(nameField, {
        target: { value: "This change should not be saved" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

      expect(
        await screen.findByRole("heading", {
          name: "Returned to menu item list",
        }),
      ).toBeInTheDocument();
      expect(axiosMock.history.put).toHaveLength(0);
      expect(mockToast).not.toHaveBeenCalled();
    });

    // Storybook saves successfully while keeping the edit page open.
    test("Storybook submission succeeds without redirecting", async () => {
      const queryClient = new QueryClient();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBDiningCommonsMenuItemEditPage storybook={true} />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      const nameField = await screen.findByLabelText("Name");
      fireEvent.change(nameField, {
        target: { value: "Storybook Updated Cheese" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Update" }));

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          "Menu item updated - id: 17 name: Storybook Updated Cheese",
        );
      });

      expect(axiosMock.history.put).toHaveLength(1);
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(
        screen.getByRole("heading", {
          name: "Edit UCSBDiningCommonsMenuItem",
        }),
      ).toBeInTheDocument();
    });
  });
});
