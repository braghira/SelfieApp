import api from "@/lib/axios";
import { UserSchema } from "@/lib/utils";

export default function useRefreshToken() {
  /**
   * Refreshes the access token if the refresh token isn't expired yet
   * @returns an object with the user data and accessToken property
   */
  async function refresh() {
    try {
      const response = await api.get("/auth/refresh");

      if (response.data.accessToken) {
        console.log(response.data.user);
        const user = UserSchema.safeParse(response.data.user);
        const accessToken: string = response.data.accessToken;
        // return an object with the user and the new access token properties
        return { ...user, accessToken };
      }
    } catch (error) {
      console.log("Bad Refresh Token Request: " + error);
    }
  }
  return { refresh };
}
