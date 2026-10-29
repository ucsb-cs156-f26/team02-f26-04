import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MenuItemReviewCreatePage from "main/pages/MenuItemReviews/MenuItemReviewCreatePage";
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

describe("MenuItemReviewCreatePage tests", () => {
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
          <MenuItemReviewCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Item ID")).toBeInTheDocument();
    });
  });

  test("on submit, makes request to backend, and redirects to /menuitemreviews", async () => {
    const queryClient = new QueryClient();
    const menuItemReview = {
      id: 1,
      itemId: 1,
      stars: 5,
      reviewerEmail: "reviewer@example.com",
      dateReviewed: "2022-01-02T12:00:00",
      comments: "Excellent item!",
    };

    axiosMock.onPost("/api/menuitemreviews/post").reply(202, menuItemReview);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemReviewCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Item ID")).toBeInTheDocument();
    });

    const itemIdInput = screen.getByLabelText("Item ID");
    expect(itemIdInput).toBeInTheDocument();

    const reviewEmailInput = screen.getByLabelText("Reviewer Email");
    expect(reviewEmailInput).toBeInTheDocument();

    const starsInput = screen.getByLabelText("Stars");
    expect(starsInput).toBeInTheDocument();

    const commentsInput = screen.getByLabelText("Comments");
    expect(commentsInput).toBeInTheDocument();

    const dateReviewedInput = screen.getByLabelText("Date Reviewed");
    expect(dateReviewedInput).toBeInTheDocument();

    const createButton = screen.getByText("Create");
    expect(createButton).toBeInTheDocument();

    fireEvent.change(itemIdInput, { target: { value: 2 } });
    fireEvent.change(reviewEmailInput, {
      target: { value: "test@example.com" },
    });
    fireEvent.change(starsInput, { target: { value: 4 } });
    fireEvent.change(commentsInput, { target: { value: "Great food!" } });
    fireEvent.change(dateReviewedInput, {
      target: { value: "2022-01-02T12:00:00" },
    });
    fireEvent.click(createButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      itemId: "2",
      reviewerEmail: "test@example.com",
      stars: "4",
      comments: "Great food!",
      dateReviewed: "2022-01-02T12:00",
    });

    // assert - check that the toast was called with the expected message
    expect(mockToast).toHaveBeenCalledWith(
      "New menu item review Created - id: 1 itemId: 1 reviewerEmail: reviewer@example.com stars: 5 comments: Excellent item! dateReviewed: 2022-01-02T12:00:00",
    );
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/menuitemreviews" });
  });
});
