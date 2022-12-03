import { useAuth0 } from "@auth0/auth0-react";
import axios, { AxiosInstance } from "axios";
import { createContext, PropsWithChildren, useContext, useMemo } from "react";

export const AxiosContext = createContext<AxiosInstance>(undefined!);

export const AxiosProvider = ({ children }: PropsWithChildren) => {
  const { isAuthenticated, getAccessTokenSilently } =
    useAuth0();

  const cachedClient = useMemo(() => {
    const client: AxiosInstance = axios.create({
      baseURL: import.meta.env.VITE_BASE_URL,
    });

    if (isAuthenticated) {
      client.interceptors.request.use(async (config) => {
        const token = await getAccessTokenSilently({
          audience: import.meta.env.VITE_AUDIENCE,
          grant_type: "client_credentials",
        });
        config.headers!.Authorization = `Bearer ${token}`;
        return config;
      });
    } else {
      console.log("Created Axios client without access token");
    }

    return client;
  }, [isAuthenticated]);

  return (
    <AxiosContext.Provider value={cachedClient}>
      {children}
    </AxiosContext.Provider>
  );
};

export const useAxios = (): AxiosInstance => {
  return useContext(AxiosContext);
};
