import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

function RecommendationRequestForm({
  initialContents,
  submitAction,
  buttonLabel = "Create",
}) {
  // Stryker disable all
  const {
    register,
    formState: { errors },
    handleSubmit,
    getValues,
  } = useForm({
    defaultValues: {
      ...initialContents,
      dateRequested: initialContents?.dateRequested?.slice(0, 16),
      dateNeeded: initialContents?.dateNeeded?.slice(0, 16),
      done: initialContents?.done ?? false,
    },
  });
  // Stryker restore all
  const navigate = useNavigate();

  const testIdPrefix = "RecommendationRequestForm";

  return (
    <Form noValidate onSubmit={handleSubmit(submitAction)}>
      {initialContents && (
        <Form.Group className="mb-3">
          <Form.Label htmlFor="id">Id</Form.Label>
          <Form.Control
            data-testid={testIdPrefix + "-id"}
            id="id"
            type="text"
            {...register("id")}
            value={initialContents.id}
            disabled
          />
        </Form.Group>
      )}

      <Form.Group className="mb-3">
        <Form.Label htmlFor="requesterEmail">
          Requester Email (required)
        </Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-requesterEmail"}
          id="requesterEmail"
          type="email"
          isInvalid={Boolean(errors.requesterEmail)}
          {...register("requesterEmail", {
            required: "Requester email is required.",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid email address.",
            },
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.requesterEmail?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="professorEmail">
          Professor Email (required)
        </Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-professorEmail"}
          id="professorEmail"
          type="email"
          isInvalid={Boolean(errors.professorEmail)}
          {...register("professorEmail", {
            required: "Professor email is required.",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid professor email address.",
            },
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.professorEmail?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="explanation">Explanation (required)</Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-explanation"}
          id="explanation"
          as="textarea"
          isInvalid={Boolean(errors.explanation)}
          {...register("explanation", {
            required: "Explanation is required.",
            validate: (value) =>
              value.trim().length > 0 || "Explanation is required.",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.explanation?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="dateRequested">
          Date Requested (required)
        </Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-dateRequested"}
          id="dateRequested"
          type="datetime-local"
          isInvalid={Boolean(errors.dateRequested)}
          {...register("dateRequested", {
            required: "Date requested is required.",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.dateRequested?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="dateNeeded">Date Needed (required)</Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-dateNeeded"}
          id="dateNeeded"
          type="datetime-local"
          isInvalid={Boolean(errors.dateNeeded)}
          {...register("dateNeeded", {
            required: "Date needed is required.",
            validate: (value) => {
              const dateRequested = getValues("dateRequested");
              return (
                !dateRequested ||
                new Date(value) > new Date(dateRequested) ||
                "Date needed must be after date requested."
              );
            },
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.dateNeeded?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Check
          data-testid={testIdPrefix + "-done"}
          id="done"
          label="Done"
          {...register("done")}
        />
      </Form.Group>

      <Button type="submit" data-testid={testIdPrefix + "-submit"}>
        {buttonLabel}
      </Button>
      <Button
        variant="Secondary"
        onClick={() => navigate(-1)}
        data-testid={testIdPrefix + "-cancel"}
      >
        Cancel
      </Button>
    </Form>
  );
}

export default RecommendationRequestForm;
