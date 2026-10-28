import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { helpRequestDefaultValues } from "main/components/HelpRequest/HelpRequestFormDefaults";

function HelpRequestForm({
  initialContents,
  submitAction,
  buttonLabel = "Create",
  requesterEmailRequiredMessage = "Requester Email is required.",
  tableOrBreakoutRoomRequiredMessage = "Table or breakout room is required.",
  requestTimeRequiredMessage = "Request time is required.",
}) {
  // Stryker disable all
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    defaultValues: {
      ...helpRequestDefaultValues,
      ...(initialContents || {}),
      ...(initialContents
        ? { requestTime: initialContents.requestTime?.slice(0, 16) || "" }
        : {}),
    },
  });
  // Stryker restore all

  const navigate = useNavigate();
  const testIdPrefix = "HelpRequestForm";

  // Stryker disable Regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Stryker restore Regex

  return (
    <Form noValidate onSubmit={handleSubmit(submitAction)}>
      {initialContents && (
        <Form.Group className="mb-3">
          <Form.Label htmlFor="id">ID</Form.Label>
          <Form.Control
            data-testid={`${testIdPrefix}-id`}
            id="id"
            type="text"
            value={initialContents.id}
            disabled
            readOnly
          />
        </Form.Group>
      )}
      <Form.Group className="mb-3">
        <Form.Label htmlFor="requesterEmail">Requester Email</Form.Label>
        <Form.Control
          id="requesterEmail"
          data-testid={`${testIdPrefix}-requesterEmail`}
          type="email"
          isInvalid={Boolean(errors.requesterEmail)}
          {...register("requesterEmail", {
            required: requesterEmailRequiredMessage,
            pattern: {
              value: emailRegex,
              message: "Enter a valid email address.",
            },
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.requesterEmail?.message}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label htmlFor="teamId">Team ID</Form.Label>
        <Form.Control
          id="teamId"
          data-testid={`${testIdPrefix}-teamId`}
          type="text"
          isInvalid={Boolean(errors.teamId)}
          {...register("teamId", {
            required: "Team ID is required.",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.teamId?.message}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label htmlFor="tableOrBreakoutRoom">
          Table or Breakout Room
        </Form.Label>
        <Form.Control
          id="tableOrBreakoutRoom"
          data-testid={`${testIdPrefix}-tableOrBreakoutRoom`}
          type="text"
          isInvalid={Boolean(errors.tableOrBreakoutRoom)}
          {...register("tableOrBreakoutRoom", {
            required: tableOrBreakoutRoomRequiredMessage,
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.tableOrBreakoutRoom?.message}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label htmlFor="requestTime">Request Time</Form.Label>
        <Form.Control
          id="requestTime"
          data-testid={`${testIdPrefix}-requestTime`}
          type="datetime-local"
          isInvalid={Boolean(errors.requestTime)}
          {...register("requestTime", {
            required: requestTimeRequiredMessage,
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.requestTime?.message}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label htmlFor="explanation">Explanation</Form.Label>
        <Form.Control
          id="explanation"
          data-testid={`${testIdPrefix}-explanation`}
          as="textarea"
          rows={3}
          isInvalid={Boolean(errors.explanation)}
          {...register("explanation", {
            required: "Explanation is required.",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.explanation?.message}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Check
          id="solved"
          data-testid={`${testIdPrefix}-solved`}
          type="checkbox"
          label="Solved"
          {...register("solved")}
        />
      </Form.Group>
      <Button type="submit" data-testid={`${testIdPrefix}-submit`}>
        {buttonLabel}
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={() => navigate(-1)}
        data-testid={`${testIdPrefix}-cancel`}
      >
        Cancel
      </Button>
    </Form>
  );
}

export default HelpRequestForm;
