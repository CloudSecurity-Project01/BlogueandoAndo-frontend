import config from "../config";
import { fetchWithAuth } from "./authService";

export const getTags = async (currentPage, pageSize, onlyMine) => {
  const skip = (currentPage - 1) * pageSize;
  let url = config.API_BASE_URL + "/tags"

  const queryParams = new URLSearchParams({
    size: pageSize,
    skip: skip,
    filter: onlyMine ? "mine" : "all"
  });

  url += "?" + queryParams.toString();

  const requestOptions = {
      method: "GET",
      headers: {
          "Content-Type": "application/json",
      }
  };
  
  return await fetchWithAuth(url, requestOptions);
}