import axios from 'axios';
import { QueryRecord } from "../types";

export async function getQueryHistory(repositoryId: string): Promise<QueryRecord[]> {
    const BACKEND_API = process.env.REACT_APP_BACKEND_API;
    try {
      const endpoint = `${BACKEND_API}/query/history?repositoryId=${repositoryId}`;
      const response = await axios.get(endpoint);
      const queries = response.data;
      return queries;
    } catch (error) {
        console.log(error);
    }
    return [];
  }
  