import { render, screen } from "@testing-library/react";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";
import RecommendationRequestTable from "main/components/RecommendationRequest/RecommendationRequestTable";

describe("RecommendationRequestTable tests", () => {
  const expectedHeaders = [
    "id",
    "Requester Email",
    "Professor Email",
    "Explanation",
    "Date Requested",
    "Date Needed",
    "Done",
  ];
  const expectedFields = [
    "id",
    "requesterEmail",
    "professorEmail",
    "explanation",
    "dateRequested",
    "dateNeeded",
    "done",
  ];
  const testId = "RecommendationRequestTable";

  test("renders the headers and no rows when there are no requests", () => {
    render(<RecommendationRequestTable recommendationRequests={[]} />);

    expectedHeaders.forEach((header) => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      expect(
        screen.queryByTestId(`${testId}-cell-row-0-col-${field}`),
      ).not.toBeInTheDocument();
    });
  });

  test("renders every database field and its values", () => {
    render(
      <RecommendationRequestTable
        recommendationRequests={
          recommendationRequestFixtures.threeRecommendationRequests
        }
      />,
    );

    expectedHeaders.forEach((header) => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-${field}`),
      ).toBeInTheDocument();
    });

    const request = recommendationRequestFixtures.oneRecommendationRequest;
    Object.entries(request).forEach(([field, value]) => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-${field}`),
      ).toHaveTextContent(String(value));
    });
  });
});
