import { Button } from "@/components/ui/button";
import { NavLink, useRouteError } from "react-router-dom";

// l'hook useRouteError() ritorna un oggetto di questo tipo, usa lo schema come guida.
// Purtroppo la funzione non è tipizzata e ritorna unknown
// type RouterError = {
//   status: number;
//   statusText: string;
//   internal: boolean;
//   data: string;
//   error: unknown;
// };

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <div
      id="error-page"
      className="flex flex-col justify-center items-center gap-5 h-screen w-screen"
    >
      <h1 className="text-primary text-[70px]">Oops!</h1>
      <h2 className="h3-bold">Sorry, an unexpected error has occurred.</h2>
      <p>
        <i className="font-medium leading-[140%] text-[30px]">404 Not Found</i>
      </p>
      <Button size={"lg"}>
        <NavLink to={"/"}>Go Back</NavLink>
      </Button>
    </div>
  );
}
