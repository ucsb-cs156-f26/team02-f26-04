import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import MenuItemReviewForm, {
  removeZ,
} from "main/components/MenuItemReviews/MenuItemReviewForm";
import { menuItemReviewFixtures } from "fixtures/menuItemReviewFixtures";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("MenuItemReviewForm tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = [
    "Item ID",
    "Reviewer Email",
    "Stars",
    "Date Reviewed",
    "Comments",
  ];
  const testId = "MenuItemReviewForm";

  test("renders correctly with no initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });
  });
  test("that the removeZ function works correctly", () => {
    expect(removeZ("ABC")).toBe("ABC");
    expect(removeZ("ABCZ")).toBe("ABC");
  });
  test("renders correctly when passing in initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm
            initialContents={menuItemReviewFixtures.oneMenuItemReview}
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
    expect(screen.getByTestId(`${testId}-id`)).toHaveValue(
      String(menuItemReviewFixtures.oneMenuItemReview.id),
    );
    expect(screen.getByTestId(`${testId}-itemId`)).toHaveValue(
      String(menuItemReviewFixtures.oneMenuItemReview.itemId),
    );
    expect(screen.getByTestId(`${testId}-reviewerEmail`)).toHaveValue(
      menuItemReviewFixtures.oneMenuItemReview.reviewerEmail,
    );
    expect(screen.getByTestId(`${testId}-stars`)).toHaveValue(
      String(menuItemReviewFixtures.oneMenuItemReview.stars),
    );
    expect(screen.getByTestId(`${testId}-dateReviewed`)).toHaveValue(
      removeZ(menuItemReviewFixtures.oneMenuItemReview.dateReviewed).slice(
        0,
        16,
      ),
    );
    expect(screen.getByTestId(`${testId}-comments`)).toHaveValue(
      menuItemReviewFixtures.oneMenuItemReview.comments,
    );
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm />
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
          <MenuItemReviewForm />
        </Router>
      </QueryClientProvider>,
    );


    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    const submitButton = screen.getByText(/Create/);
    fireEvent.click(submitButton);

    await screen.findByText(/Item ID is required/);
    expect(screen.getByText(/Reviewer Email is required/)).toBeInTheDocument();
    expect(screen.getByText(/Stars is required/)).toBeInTheDocument();
    expect(screen.getByText(/Date Reviewed is required/)).toBeInTheDocument();
    expect(screen.getByText(/Comments are required/)).toBeInTheDocument();

    const itemIdInput = screen.getByTestId(`${testId}-itemId`);
    fireEvent.change(itemIdInput, { target: { value: "a".repeat(257) } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Max length 256 characters/)).toBeInTheDocument();
    });
  });
  test("handles initialContents without a dateReviewed", async () => {
    const contentsWithoutDate = {
      ...menuItemReviewFixtures.oneMenuItemReview,
      dateReviewed: "",
    };

    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm initialContents={contentsWithoutDate} />
        </Router>
      </QueryClientProvider>,
    );

    expect(screen.getByTestId(`${testId}-dateReviewed`)).toHaveValue("");
  });
});
