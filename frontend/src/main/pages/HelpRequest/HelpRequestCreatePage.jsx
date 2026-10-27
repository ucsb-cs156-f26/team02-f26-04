import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import HelpRequestForm from "main/components/HelpRequest/HelpRequestForm";
import { Navigate } from "react-router";
import { useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function HelpRequestCreatePage({ storybook = false }) {
  const objectToAxiosParams = (helpRequest) => ({
    url: "/api/HelpRequest/post",
    method: "POST",
    params: {
      requesterEmail: helpRequest.requesterEmail,
      teamId: helpRequest.teamId,
      tableOrBreakoutRoom: helpRequest.tableOrBreakoutRoom,
      requestTime: helpRequest.requestTime,
      explanation: helpRequest.explanation,
      solved: helpRequest.solved,
    },
  });

  const onSuccess = (helpRequest) => {
    toast(`New help request created - id: ${helpRequest.id}`);
  };

  const mutation = useBackendMutation(objectToAxiosParams, { onSuccess }, [
    "/api/HelpRequest/all",
  ]);

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/helprequest" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Create Help Request</h1>
        <HelpRequestForm submitAction={onSubmit} />
      </div>
    </BasicLayout>
  );
}
