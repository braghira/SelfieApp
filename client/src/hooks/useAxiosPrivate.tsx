import api from "@/lib/axios";
import useRefreshToken from "./useRefreshToken";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import {
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosHeaders,
} from "axios";
import useLogout from "./useLogout";
import { client_log } from "@/lib/utils";

export default function useAxiosPrivate() {
  const { refresh } = useRefreshToken();
  const { user, dispatch } = useAuth();
  const { logout } = useLogout();

  interface InternalAxiosRequestConfigExtended
    extends InternalAxiosRequestConfig {
    sent?: boolean;
  }

  // we are basically adding middleware to the fetch api, every time we make a request or receive a response we make sure the access token is set correctly
  useEffect(() => {
    // called before we send the request
    const requestIntercept = api.interceptors.request.use(
      (request: InternalAxiosRequestConfigExtended) => {
        if (!request.headers?.Authorization) {
          if (!request.headers) {
            request.headers = new AxiosHeaders();
          }
          // add authorization header to the request
          request.headers.set("Authorization", `Bearer ${user?.accessToken}`);
        }

        // must return the request
        return request;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    // called before the response is received
    const responseIntercept = api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        // take the previous request with our added property
        const prevRequest = error?.config as InternalAxiosRequestConfigExtended;

        // catch requests when token has expired
        if (error?.response?.status === 403 && !prevRequest.sent) {
          prevRequest.sent = true;
          client_log("JWT token expired, logging out");
          // logout only if the user is authenticated
          user && logout();
          return Promise.reject(error);
        }

        // catch all unauthorized requests
        if (error?.response?.status === 401 && !prevRequest.sent) {
          prevRequest.sent = true;
          // refresh the user with a new request token
          const auth = await refresh();

          // check if the token is expired first
          if (auth === "expired" || auth === undefined) {
            client_log("Access token expired");
            // logout only if the user is authenticated
            user && logout();
            return Promise.reject(error);
          }

          dispatch({ type: "LOGIN", payload: auth });
          dispatch({ type: "LOGIN", payload: auth });

          const newAccessToken = auth?.accessToken;
          const newAccessToken = auth?.accessToken;
          // this should be a useless check, but TypeScript says it can be undefined so here we are
          if (prevRequest.headers) {
            prevRequest.headers.set(
              "Authorization",
              `Bearer ${newAccessToken}`
            );
          } else {
            prevRequest.headers = new AxiosHeaders();
            prevRequest.headers.set(
              "Authorization",
              `Bearer ${newAccessToken}`
            );
          }

          // return the axios instance with the updated request
          return api(prevRequest);
        }
        return Promise.reject(error);
      }
    );

    // cleanup return function to remove previous interceptors
    // interceptor could remain active after the component has been unmounted or dependencies changed and cause memory leaks.
    return () => {
      api.interceptors.request.eject(requestIntercept);
      api.interceptors.response.eject(responseIntercept);
    };
  }, [user, refresh]);

  // return the axios instance with middleware
  return api;
}
