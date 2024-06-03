import users from "./users";
import applications from "./applications";
import timeSlots from "./timeSlots";
import interviews from "./interviews";
import availabilities from "./availabilities";
import recruitmentSessions from "./recruitmentSessions";

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
  authToken?: string;
  body?: object;
};

export class Api {
  private static getUrl = (endpoint: string) =>
    `${process.env.REACT_APP_API_ENDPOINT}/v1/${endpoint}`;

  static async httpRequest(
    endpoint: string,
    method: string,
    options: HttpRequestOptions = {}
  ) {
    let response;

    try {
      /* Prepare request parameters */
      const headers: HeadersInit = await Api.buildHeaders(
        options.authToken ?? "",
        true
      );
      const init = {
        method,
        headers,
      };
      if (options.body) init["body"] = JSON.stringify(options.body);
      /* Send the request */
      response = await fetch(new URL(this.getUrl(endpoint)), init);
    } catch (error) {
      console.log(error);
      throw new Error("Something went wrong, try again later.");
    }

    return await this.handleResponse(response);
  }

  static async get(endpoint: string, authToken: string = "") {
    return Api.httpRequest(endpoint, "GET", { authToken });
  }

  static async post(
    endpoint: string,
    body: object = {},
    authToken: string = ""
  ) {
    return Api.httpRequest(endpoint, "POST", { authToken, body });
  }

  static async put(
    endpoint: string,
    body: object = {},
    authToken: string = ""
  ) {
    return Api.httpRequest(endpoint, "PUT", { authToken, body });
  }

  static async patch(
    endpoint: string,
    body: object = {},
    authToken: string = ""
  ) {
    return Api.httpRequest(endpoint, "PATCH", { authToken, body });
  }

  static async delete(endpoint: string, authToken: string = "") {
    return Api.httpRequest(endpoint, "DELETE", { authToken });
  }

  static async handleResponse(response: Response) {
    console.log(">>>", response);

    if (!response.ok) throw new Error(response.statusText);

    return await response.json();
  }

  static async buildHeaders(
    token: string = "",
    json: boolean = false
  ): Promise<HeadersInit> {
    const headers: HeadersInit = new Headers();
    if (token) {
      headers.append("Authorization", `Bearer ${token}`);
    }
    if (json) {
      headers.append("Content-Type", "application/json");
    }
    return headers;
  }
}
