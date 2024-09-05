import api from "@/lib/axios";
import { UserSchema, client_log } from "@/lib/utils";
import { isAxiosError } from "axios";

export default function useRefreshToken() {
  /**
   * Refreshes the access token if the refresh token isn't expired yet
   * @returns an object with the user data and accessToken property
   */
  async function refresh() {
    try {
      const response = await api.get("/auth/refresh");

      if (response.data) {
        // json objects return only strings, we make sure to turn it back into a date object
        response.data.birthday = new Date(response.data.birthday);

        const parsed = UserSchema.safeParse(response.data);

        if (parsed.success)
          // return user object
          return parsed.data;
        else {
          client_log("zod parsing wasn't successful");
          return undefined;
        }
      }
    } catch (error) {
      if (isAxiosError(error)) {
        client_log("Bad Refresh Token Request: ", error.message);
        if (error.status === 403) {
          return "expired";
        }
      }
    }
  }

  return { refresh };
}
