import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { menuItemReviewFixtures } from "fixtures/menuItemReviewFixtures";
import MenuItemReviewTable from "main/components/MenuItemReviews/MenuItemReviewTable";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("MenuItemReviewTable tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = ["id", "Item ID", "Reviewer Email", "Stars", "Comments", "Date Reviewed"];
  const expectedFields = ["id", "itemId", "reviewerEmail", "stars", "comments", "dateReviewed"];
  const testId = "MenuItemReviewTable";

  test("renders empty table correctly", () => {
    // arrange
    const currentUser = currentUserFixtures.adminUser;

    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemReviewTable menuItemReviews={[]} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert
    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const fieldElement = screen.queryByTestId(
        `${testId}-cell-row-0-col-${field}`,
      );
      expect(fieldElement).not.toBeInTheDocument();
    });
  });

  test("Has the expected column headers, content and buttons for admin user", () => {
    // arrange
    const currentUser = currentUserFixtures.adminUser;

    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemReviewTable
            menuItemReviews={menuItemReviewFixtures.threeMenuItemReviews}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert
    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "1",
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-itemId`),
    ).toHaveTextContent("1");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-reviewerEmail`),
    ).toHaveTextContent("reviewer1@example.com");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-stars`),
    ).toHaveTextContent("5");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-comments`),
    ).toHaveTextContent("Excellent item!");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-dateReviewed`),
    ).toHaveTextContent("2022-01-02T12:00:00");

    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "2",
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-itemId`),
    ).toHaveTextContent("2");
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-reviewerEmail`),
    ).toHaveTextContent("reviewer2@example.com");
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-stars`),
    ).toHaveTextContent("4");
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-comments`),
    ).toHaveTextContent("Good item!");
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-dateReviewed`),
    ).toHaveTextContent("2022-04-03T12:00:00");

    const editButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveClass("btn-primary");

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveClass("btn-danger");
  });

  test("Has the expected column headers, content for ordinary user", () => {
    // arrange
    const currentUser = currentUserFixtures.userOnly;

    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemReviewTable
            menuItemReviews={menuItemReviewFixtures.threeMenuItemReviews}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert
    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    
    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "1",
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-itemId`),
    ).toHaveTextContent("1");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-reviewerEmail`),
    ).toHaveTextContent("reviewer1@example.com");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-stars`),
    ).toHaveTextContent("5");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-comments`),
    ).toHaveTextContent("Excellent item!");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-dateReviewed`),
    ).toHaveTextContent("2022-01-02T12:00:00");

    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "2",
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-itemId`),
    ).toHaveTextContent("2");
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-reviewerEmail`),
    ).toHaveTextContent("reviewer2@example.com");
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-stars`),
    ).toHaveTextContent("4");
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-comments`),
    ).toHaveTextContent("Good item!");
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-dateReviewed`),
    ).toHaveTextContent("2022-04-03T12:00:00");

    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
  });

  test("Edit button navigates to the edit page", async () => {
    // arrange
    const currentUser = currentUserFixtures.adminUser;

    // act - render the component
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemReviewTable
            menuItemReviews={menuItemReviewFixtures.threeMenuItemReviews}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert - check that the expected content is rendered
    expect(
      await screen.findByTestId(`${testId}-cell-row-0-col-id`),
    ).toHaveTextContent("1");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-itemId`),
    ).toHaveTextContent("1");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-reviewerEmail`),
    ).toHaveTextContent("reviewer1@example.com");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-stars`),
    ).toHaveTextContent("5");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-comments`),
    ).toHaveTextContent("Excellent item!");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-dateReviewed`),
    ).toHaveTextContent("2022-01-02T12:00:00");

    const editButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    expect(editButton).toBeInTheDocument();

    // act - click the edit button
    fireEvent.click(editButton);

    // assert - check that the navigate function was called with the expected path
    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith("/menuitemreviews/edit/2"),
    );
  });

  test("Delete button calls delete callback", async () => {
    // arrange
    const currentUser = currentUserFixtures.adminUser;

    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onDelete("/api/menuitemreviews/2")
      .reply(200, { message: "Restaurant deleted" });

    // act - render the component
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemReviewTable
            menuItemReviews={menuItemReviewFixtures.threeMenuItemReviews}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert - check that the expected content is rendered
    expect(
      await screen.findByTestId(`${testId}-cell-row-0-col-id`),
    ).toHaveTextContent("2");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-itemId`),
    ).toHaveTextContent("2");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-reviewerEmail`),
    ).toHaveTextContent("reviewer2@example.com");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-stars`),
    ).toHaveTextContent("4");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-comments`),
    ).toHaveTextContent("Good item, but could be better.");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-dateReviewed`),
    ).toHaveTextContent("2022-01-03T12:00:00");

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();

    // act - click the delete button
    fireEvent.click(deleteButton);

    // assert - check that the delete endpoint was called

    await waitFor(() => expect(axiosMock.history.delete.length).toBe(1));
    expect(axiosMock.history.delete[0].params).toEqual({ id: 2 });
  });
});