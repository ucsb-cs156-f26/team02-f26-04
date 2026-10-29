import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import HelpRequestTable from "main/components/HelpRequest/HelpRequestTable";

describe("HelpRequestTable tests", () => {
  const testId = "HelpRequestTable";
  const renderTable = (helpRequests) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestTable
            helpRequests={helpRequests}
            currentUser={apiCurrentUserFixtures.userOnly}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };
  const expectedHeaders = [
    "ID",
    "Requester Email",
    "Team ID",
    "Table or Breakout Room",
    "Request Time",
    "Explanation",
    "Solved",
  ];

  const expectedFields = [
    "id",
    "requesterEmail",
    "teamId",
    "tableOrBreakoutRoom",
    "requestTime",
    "explanation",
    "solved",
  ];

  const helpRequests = [
    {
      id: 1,
      requesterEmail: "student1@ucsb.edu",
      teamId: "team01",
      tableOrBreakoutRoom: "Table 3",
      requestTime: "2026-10-20T14:30",
      explanation: "I need help understanding the assignment.",
      solved: false,
    },
    {
      id: 2,
      requesterEmail: "student2@ucsb.edu",
      teamId: "team02",
      tableOrBreakoutRoom: "Breakout Room 1",
      requestTime: "2026-10-21T10:00",
      explanation: "I have a question about my code.",
      solved: true,
    },
  ];

  test("renders empty table correctly", () => {
    renderTable([]);

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      expect(
        screen.queryByTestId(`${testId}-cell-row-0-col-${field}`),
      ).not.toBeInTheDocument();
    });
  });

  test("renders all column headers and HelpRequest data", () => {
    renderTable(helpRequests);

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-${field}`),
      ).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "1",
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-requesterEmail`),
    ).toHaveTextContent("student1@ucsb.edu");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-teamId`),
    ).toHaveTextContent("team01");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-tableOrBreakoutRoom`),
    ).toHaveTextContent("Table 3");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-requestTime`),
    ).toHaveTextContent("2026-10-20T14:30");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-explanation`),
    ).toHaveTextContent("I need help understanding the assignment.");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-solved`),
    ).toHaveTextContent("false");

    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "2",
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-requesterEmail`),
    ).toHaveTextContent("student2@ucsb.edu");
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-solved`),
    ).toHaveTextContent("true");
  });
});
