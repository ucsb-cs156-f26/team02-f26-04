import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams, Navigate } from "react-router";
import RecommendationRequestForm from "main/components/RecommendationRequest/RecommendationRequestForm";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function RecommendationRequestEditPage({ storybook = false }) {
  const { id } = useParams();

  const {
    data: recommendationRequest,
    _error,
    _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    [`/api/recommendationrequests?id=${id}`],
    {
      // Stryker disable next-line all : Axios treats an empty method as GET
      method: "GET",
      url: "/api/recommendationrequests",
      params: {
        id,
      },
    },
  );

  const objectToAxiosPutParams = (request) => ({
    url: "/api/recommendationrequests",
    method: "PUT",
    params: {
      id: request.id,
    },
    data: {
      requesterEmail: request.requesterEmail,
      professorEmail: request.professorEmail,
      explanation: request.explanation,
      dateRequested: request.dateRequested,
      dateNeeded: request.dateNeeded,
      done: request.done,
    },
  });

  const onSuccess = (request) => {
    toast(
      `Recommendation Request Updated - id: ${request.id} requester: ${request.requesterEmail}`,
    );
  };

  const mutation = useBackendMutation(
    objectToAxiosPutParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    [`/api/recommendationrequests?id=${id}`],
  );

  const { isSuccess } = mutation;

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/recommendationrequest" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit Recommendation Request</h1>
        {recommendationRequest && (
          <RecommendationRequestForm
            initialContents={recommendationRequest}
            submitAction={onSubmit}
            buttonLabel="Update"
          />
        )}
      </div>
    </BasicLayout>
  );
}
