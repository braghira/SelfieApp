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

export default function useAxiosPrivate() {
  const { refresh } = useRefreshToken();
  const { user } = useAuth();

  interface InternalAxiosRequestConfigExtended
    extends InternalAxiosRequestConfig {
    sent?: boolean;
  }

  // we are basically adding middleware to the fetch api, every time we make a request or receive a response we make sure the access token is set correctly
  useEffect(() => {
    // called before we send the request
    const requestIntercept = api.interceptors.request.use(
      (config: InternalAxiosRequestConfigExtended) => {
        if (!config.headers?.Authorization) {
          if (!config.headers) {
            config.headers = new AxiosHeaders();
          }
          // add authorization header to the request
          config.headers.set("Authorization", `Bearer ${user?.accessToken}`);
        }

        // must return the request
        return config;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    // called before the response is received
    const responseIntercept = api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        // take the previous request with our added property
        const prevRequest = error?.config as InternalAxiosRequestConfigExtended;

        if (error?.response?.status === 401 && !prevRequest?.sent) {
          prevRequest.sent = true;
          // request a new access token
          const auth = await refresh();
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
