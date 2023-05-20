import React from "react";

async function apiRequest(endpoint: string, how: string, params?: any) {
  debugger;
  const body = how === "GET" ? undefined : JSON.stringify(params);
  const response = await fetch(endpoint, { method: how, body: body });
  const data = await response.json();
  return data;
}

export async function getApplicants() {
  return await apiRequest("/v1/applications", "GET");
}

export async function getUsers() {
  return await apiRequest("/v1/users", "GET");
}

/*
const GetApplicants = ({ name }) => {
  const [count, setCount] = React.useState(0);

  return (
    <div>
      <h1>Hello, {name}!</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
};

export default GetApplicants;
*/
