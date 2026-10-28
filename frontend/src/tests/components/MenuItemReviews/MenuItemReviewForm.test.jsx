import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import MenuItemReviewForm from "main/components/MenuItemReviews/MenuItemReviewForm";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const mockedNavigate = vi.fn();

vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

const oneMenuItemReviewRequest = {
  id: 1,
  itemId: "1",
  stars: "5",
  reviewerEmail: "student1@ucsb.edu",
  comments: "Great item!",
  dateReviewed: "2026-10-20T14:30",
};

describe("MenuItemReviewForm tests", () => {
  const queryClient = new QueryClient();
  const testId = "MenuItemReviewForm";

  const renderForm = (props = {}) =>
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm {...props} />
        </Router>
      </QueryClientProvider>,
    );

  test("renders correctly when creating a MenuItemReview", async () => {
    renderForm({ submitAction: vi.fn() });

    expect(await screen.findByText("Create")).toBeInTheDocument();

    ["Item ID", "Stars", "Reviewer Email", "Comments", "Date Reviewed"].forEach(
      (label) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      },
    );

    expect(screen.queryByTestId(`${testId}-id`)).not.toBeInTheDocument();
  });

  test("renders correctly when updating a MenuItemReview", async () => {
    renderForm({
      initialContents: oneMenuItemReviewRequest,
      submitAction: vi.fn(),
      buttonLabel: "Update",
    });

    expect(await screen.findByText("Update")).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-id`)).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-id`)).toBeDisabled();

    expect(screen.getByTestId(`${testId}-itemId`)).toHaveValue(
      String(oneMenuItemReviewRequest.itemId),
    );
    expect(screen.getByTestId(`${testId}-stars`)).toHaveValue(
      String(oneMenuItemReviewRequest.stars),
    );
    expect(screen.getByTestId(`${testId}-reviewerEmail`)).toHaveValue(
      oneMenuItemReviewRequest.reviewerEmail,
    );
    expect(screen.getByTestId(`${testId}-comments`)).toHaveValue(
      oneMenuItemReviewRequest.comments,
    );
    expect(screen.getByTestId(`${testId}-dateReviewed`)).toHaveValue(
      oneMenuItemReviewRequest.dateReviewed,
    );
  });

  test("calls submitAction with valid form data", async () => {
    const submitAction = vi.fn();
    renderForm({ submitAction });

    fireEvent.change(screen.getByTestId(`${testId}-itemId`), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-stars`), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-reviewerEmail`), {
      target: { value: "student1@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-comments`), {
      target: { value: "Great item!" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-dateReviewed`), {
      target: { value: "2026-10-20T14:30" },
    });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => {
      expect(submitAction).toHaveBeenCalledWith(
        expect.objectContaining({
          itemId: "1",
          stars: "5",
          reviewerEmail: "student1@ucsb.edu",
          comments: "Great item!",
          dateReviewed: "2026-10-20T14:30",
        }),
        expect.anything(),
      );
    });
  });

  test("validates required fields", async () => {
    renderForm({ submitAction: vi.fn() });

    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    expect(
      await screen.findByText("Reviewer Email is required."),
    ).toBeInTheDocument();
    expect(screen.getByText("Item ID is required.")).toBeInTheDocument();
    expect(screen.getByText("Stars are required.")).toBeInTheDocument();
    expect(screen.getByText("Date Reviewed is required.")).toBeInTheDocument();
    expect(screen.getByText("Comments are required.")).toBeInTheDocument();
  });

  test("validates email format", async () => {
    renderForm({ submitAction: vi.fn() });

    fireEvent.change(screen.getByTestId(`${testId}-reviewerEmail`), {
      target: { value: "not-an-email" },
    });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    expect(
      await screen.findByText("Enter a valid email address."),
    ).toBeInTheDocument();
  });

  test("navigates back when Cancel is clicked", async () => {
    renderForm({ submitAction: vi.fn() });

    fireEvent.click(screen.getByTestId(`${testId}-cancel`));

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith(-1);
    });
  });
  test("validates maximum length of comments", async () => {
    renderForm({ submitAction: vi.fn() });

    fireEvent.change(screen.getByTestId(`${testId}-comments`), {
      target: { value: "a".repeat(257) },
    });

    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    expect(
      await screen.findByText("Max length 256 characters"),
    ).toBeInTheDocument();
  });
  test.each([
    ["Item ID", "itemId", "abc", "Item ID must be an integer."],
    ["Item ID", "itemId", "1.5", "Item ID must be an integer."],
    ["Stars", "stars", "abc", "Stars must be an integer."],
    ["Stars", "stars", "1.5", "Stars must be an integer."],
  ])(
    "blocks submission when %s is invalid (%s = %s)",
    async (_label, field, invalidValue, errorMessage) => {
      const submitAction = vi.fn();
      renderForm({ submitAction });

      // Fill all required fields with valid values first.
      fireEvent.change(screen.getByTestId(`${testId}-itemId`), {
        target: { value: "1" },
      });
      fireEvent.change(screen.getByTestId(`${testId}-stars`), {
        target: { value: "5" },
      });
      fireEvent.change(screen.getByTestId(`${testId}-reviewerEmail`), {
        target: { value: "student1@ucsb.edu" },
      });
      fireEvent.change(screen.getByTestId(`${testId}-comments`), {
        target: { value: "Great item!" },
      });
      fireEvent.change(screen.getByTestId(`${testId}-dateReviewed`), {
        target: { value: "2026-10-20T14:30" },
      });

      // Replace the selected field with the invalid value.
      fireEvent.change(screen.getByTestId(`${testId}-${field}`), {
        target: { value: invalidValue },
      });

      fireEvent.click(screen.getByTestId(`${testId}-submit`));

      expect(await screen.findByText(errorMessage)).toBeInTheDocument();
      expect(submitAction).not.toHaveBeenCalled();
    },
  );

  test("accepts a multi-digit integer Item ID", async () => {
    const submitAction = vi.fn();
    renderForm({ submitAction });

    fireEvent.change(screen.getByTestId(`${testId}-itemId`), {
      target: { value: "123" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-stars`), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-reviewerEmail`), {
      target: { value: "student1@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-comments`), {
      target: { value: "Great item!" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-dateReviewed`), {
      target: { value: "2026-10-20T14:30" },
    });

    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => {
      expect(submitAction).toHaveBeenCalled();
    });
  });

  test("accepts a multi-digit integer Stars value", async () => {
    const submitAction = vi.fn();
    renderForm({ submitAction });

    fireEvent.change(screen.getByTestId(`${testId}-itemId`), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-stars`), {
      target: { value: "12" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-reviewerEmail`), {
      target: { value: "student1@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-comments`), {
      target: { value: "Great item!" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-dateReviewed`), {
      target: { value: "2026-10-20T14:30" },
    });

    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => {
      expect(submitAction).toHaveBeenCalled();
    });
  });
});
