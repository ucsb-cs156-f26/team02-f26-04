import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";
import RecommendationRequestForm from "main/components/RecommendationRequest/RecommendationRequestForm";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("RecommendationRequestForm tests", () => {
  test("validates the required fields for a new request", async () => {
    render(
      <MemoryRouter>
        <RecommendationRequestForm />
      </MemoryRouter>,
    );

    fireEvent.submit(
      screen.getByTestId("RecommendationRequestForm-submit").closest("form"),
    );

    expect(
      await screen.findByText("Requester email is required."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Professor email is required."),
    ).toBeInTheDocument();
    expect(screen.getByText("Explanation is required.")).toBeInTheDocument();
    expect(screen.getByText("Date requested is required.")).toBeInTheDocument();
    expect(screen.getByText("Date needed is required.")).toBeInTheDocument();
  });

  test("validates email formats and non-blank explanation", async () => {
    render(
      <MemoryRouter>
        <RecommendationRequestForm />
      </MemoryRouter>,
    );

    fireEvent.change(
      screen.getByTestId("RecommendationRequestForm-requesterEmail"),
      { target: { value: "   " } },
    );
    fireEvent.change(
      screen.getByTestId("RecommendationRequestForm-professorEmail"),
      { target: { value: "invalid-email" } },
    );
    fireEvent.change(
      screen.getByTestId("RecommendationRequestForm-explanation"),
      { target: { value: "   " } },
    );
    fireEvent.submit(
      screen.getByTestId("RecommendationRequestForm-submit").closest("form"),
    );

    expect(
      await screen.findByText("Requester email is required."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Enter a valid professor email address."),
    ).toBeInTheDocument();
    expect(screen.getByText("Explanation is required.")).toBeInTheDocument();
  });

  test("requires date needed to be later than date requested", async () => {
    render(
      <MemoryRouter>
        <RecommendationRequestForm />
      </MemoryRouter>,
    );

    fireEvent.change(
      screen.getByTestId("RecommendationRequestForm-requesterEmail"),
      { target: { value: "student@example.com" } },
    );
    fireEvent.change(
      screen.getByTestId("RecommendationRequestForm-professorEmail"),
      { target: { value: "professor@example.com" } },
    );
    fireEvent.change(
      screen.getByTestId("RecommendationRequestForm-explanation"),
      { target: { value: "Recommendation request" } },
    );
    fireEvent.change(
      screen.getByTestId("RecommendationRequestForm-dateRequested"),
      { target: { value: "2026-10-27T04:40" } },
    );
    fireEvent.change(
      screen.getByTestId("RecommendationRequestForm-dateNeeded"),
      { target: { value: "2026-10-27T04:40" } },
    );
    fireEvent.submit(
      screen.getByTestId("RecommendationRequestForm-submit").closest("form"),
    );

    expect(
      await screen.findByText("Date needed must be after date requested."),
    ).toBeInTheDocument();
  });

  test("does not compare date needed when date requested is missing", async () => {
    render(
      <MemoryRouter>
        <RecommendationRequestForm />
      </MemoryRouter>,
    );

    fireEvent.change(
      screen.getByTestId("RecommendationRequestForm-dateNeeded"),
      { target: { value: "2026-10-27T04:40" } },
    );
    fireEvent.submit(
      screen.getByTestId("RecommendationRequestForm-submit").closest("form"),
    );

    expect(
      await screen.findByText("Date requested is required."),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Date needed must be after date requested."),
    ).not.toBeInTheDocument();
  });

  test("renders and submits recommendation request fields", async () => {
    const submitAction = vi.fn();
    const request = recommendationRequestFixtures.oneRecommendationRequest;

    render(
      <MemoryRouter>
        <RecommendationRequestForm
          initialContents={request}
          submitAction={submitAction}
        />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("RecommendationRequestForm-id")).toHaveValue("1");
    expect(
      screen.getByTestId("RecommendationRequestForm-requesterEmail"),
    ).toHaveValue(request.requesterEmail);
    expect(
      screen.getByTestId("RecommendationRequestForm-professorEmail"),
    ).toHaveValue(request.professorEmail);
    expect(
      screen.getByTestId("RecommendationRequestForm-explanation"),
    ).toHaveValue(request.explanation);
    expect(
      screen.getByTestId("RecommendationRequestForm-dateRequested"),
    ).toHaveValue("2026-10-27T04:40");
    expect(
      screen.getByTestId("RecommendationRequestForm-dateNeeded"),
    ).toHaveValue("2026-11-15T00:00");
    expect(
      screen.getByTestId("RecommendationRequestForm-done"),
    ).not.toBeChecked();

    fireEvent.click(screen.getByTestId("RecommendationRequestForm-done"));
    fireEvent.click(screen.getByTestId("RecommendationRequestForm-submit"));

    await waitFor(() => {
      expect(submitAction).toHaveBeenCalledWith(
        expect.objectContaining({
          requesterEmail: request.requesterEmail,
          professorEmail: request.professorEmail,
          explanation: request.explanation,
          dateRequested: "2026-10-27T04:40",
          dateNeeded: "2026-11-15T00:00",
          done: true,
        }),
        expect.anything(),
      );
    });
  });

  test("navigates back when cancel is clicked", () => {
    render(
      <MemoryRouter>
        <RecommendationRequestForm />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId("RecommendationRequestForm-cancel"));

    expect(mockedNavigate).toHaveBeenCalledWith(-1);
  });
});
