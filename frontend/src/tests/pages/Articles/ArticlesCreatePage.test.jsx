import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import ArticlesCreatePage from "main/pages/Articles/ArticlesCreatePage";
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

describe("ArticlesCreatePage tests", () => {
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

  const article = {
    id: 17,
    title: "Data Centers and Water Consumption",
    url: "https://www.eesi.org/articles/view/data-centers-and-water-consumption",
    explanation: "An article about water consumption of data centers",
    email: "austin_li@ucsb.edu",
    dateAdded: "2022-02-02T00:00",
  };

  const fillInAndSubmitForm = () => {
    fireEvent.change(screen.getByTestId("ArticleForm-title"), {
      target: { value: article.title },
    });
    fireEvent.change(screen.getByTestId("ArticleForm-url"), {
      target: { value: article.url },
    });
    fireEvent.change(screen.getByTestId("ArticleForm-explanation"), {
      target: { value: article.explanation },
    });
    fireEvent.change(screen.getByTestId("ArticleForm-email"), {
      target: { value: article.email },
    });
    fireEvent.change(screen.getByTestId("ArticleForm-dateAdded"), {
      target: { value: article.dateAdded },
    });
    fireEvent.click(screen.getByTestId("ArticleForm-submit"));
  };

  test("renders without crashing", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("ArticleForm-title")).toBeInTheDocument();
    });
    expect(screen.getByText("Create New Article")).toBeInTheDocument();
  });

  test("when you fill in the form and hit submit, it makes a request to the backend", async () => {
    const queryClient = new QueryClient();
    axiosMock.onPost("/api/articles/post").reply(202, article);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("ArticleForm-title")).toBeInTheDocument();
    });

    fillInAndSubmitForm();

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      title: article.title,
      url: article.url,
      explanation: article.explanation,
      email: article.email,
      dateAdded: article.dateAdded,
    });

    expect(mockToast).toBeCalledWith(
      "New article Created - id: 17 title: Data Centers and Water Consumption",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/articles" });
  });

  test("does not navigate after submit when storybook is true", async () => {
    const queryClient = new QueryClient();
    axiosMock.onPost("/api/articles/post").reply(202, article);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesCreatePage storybook={true} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("ArticleForm-title")).toBeInTheDocument();
    });

    fillInAndSubmitForm();

    await waitFor(() => expect(mockToast).toBeCalled());
    expect(mockNavigate).not.toBeCalled();
    expect(screen.getByText("Create New Article")).toBeInTheDocument();
  });
});
