import { Button } from "@/components/ui/button";
import {
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
} from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  const error = useRouteError();
  let errorMessage: string;
  let errorStatus: number = 0;

  if (isRouteErrorResponse(error)) {
    // error is type `ErrorResponse`
    errorMessage = error.data?.message || error.statusText;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  } else {
    console.error(error);
    errorMessage = "Unknown error";
  }

  const clickHandler = () => {
    navigate("/");
  };

  return (
    <div
      id="error-page"
      className="flex flex-col justify-center items-center gap-5 h-screen w-screen"
    >
      <h1 className="text-primary text-[70px]">Oops!</h1>
      <h2 className="h3-bold text-center">
        Sorry, an unexpected error has occurred.
      </h2>
      <p>
        <i className="font-medium leading-[140%] text-[30px]">
          {errorStatus !== 0 && errorStatus} {errorMessage}
        </i>
      </p>
      <Button size={"lg"} onClick={clickHandler}>
        Go to the Home Page
      </Button>
    </div>
  );
}
