import users from "./users";
import applications from "./applications";
import timeSlots from "./timeSlots";
import interviews from "./interviews";
import availabilities from "./availabilities";
import recruitmentSessions from "./recruitmentSessions";
import { useAuth0 } from "@auth0/auth0-react";

const api = {
  users,
  applications,
  timeSlots,
  interviews,
  availabilities,
  recruitmentSessions,
};

export default api;

type HttpRequestOptions = {
  authRequired?: boolean;
  body?: object;
};

export class Api {
  private static getUrl = (endpoint: string) =>
    `${process.env.API_ENDPOINT}/${endpoint}/`;

  static async httpRequest(
    endpoint: string,
    method: string,
    options: HttpRequestOptions = {}
  ) {
    let response;

    try {
      /* Prepare request parameters */
      const headers: HeadersInit = await Api.buildHeaders(
        options.authRequired ?? false,
        true
      );
      const init = {
        method,
        headers,
      };
      if (options.body) init["body"] = JSON.stringify(options.body);
      /* Send the request */
      response = await fetch(new URL(this.getUrl(endpoint)), init);
    } catch {
      throw new Error("Something went wrong, try again later.");
    }

    return await this.handleResponse(response);
  }

  static async get(endpoint: string, authRequired: boolean = false) {
    return Api.httpRequest(endpoint, "GET", { authRequired });
  }

  static async post(
    endpoint: string,
    body: object = {},
    authRequired: boolean = false
  ) {
    return Api.httpRequest(endpoint, "POST", { authRequired, body });
  }

  static async put(
    endpoint: string,
    body: object = {},
    authRequired: boolean = false
  ) {
    return Api.httpRequest(endpoint, "PUT", { authRequired, body });
  }

  static async patch(
    endpoint: string,
    body: object = {},
    authRequired: boolean = false
  ) {
    return Api.httpRequest(endpoint, "PATCH", { authRequired, body });
  }

  static async delete(endpoint: string, authRequired: boolean = false) {
    return Api.httpRequest(endpoint, "DELETE", { authRequired });
  }

  static async handleResponse(response: Response) {
    console.log(">>>", response);

    if (!response.ok) throw new Error(response.statusText);

    return await response.json();
  }

  static async buildHeaders(
    authRequired: boolean = false,
    json: boolean = false
  ): Promise<HeadersInit> {
    const headers: HeadersInit = new Headers();
    if (authRequired) {
      const { getAccessTokenSilently } = useAuth0();
      const token = await getAccessTokenSilently();
      headers.append("Authorization", `Bearer ${token}`);
    }
    if (json) {
      headers.append("Content-Type", "application/json");
    }
    return headers;
  }
}
