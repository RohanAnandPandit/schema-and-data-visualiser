import axios from "axios";
import { Metadata, RDFGraph, RepositoryId, URI } from "../types";
import { emptyGraph } from "../utils/queryResults";

export async function getClasses(repository: RepositoryId): Promise<URI[]> {
  const BACKEND_API = process.env.REACT_APP_BACKEND_API;
  try {
    const endpoint = `${BACKEND_API}/dataset/classes?repository=${repository}`;
    const response = await axios.get(endpoint);
    const classes = response.data;
    return classes;
  } catch (error) {}
  return [];
}

export async function getClassHierarchy(
  repository: RepositoryId
): Promise<RDFGraph> {
  const BACKEND_API = process.env.REACT_APP_BACKEND_API;
  try {
    const endpoint = `${BACKEND_API}/dataset/class-hierarchy?repository=${repository}`;
    const response = await axios.get(endpoint);
    const graph = response.data;
    return graph;
  } catch (error) {}
  return emptyGraph();
}

export async function getNoOfTriplets(
  repository: RepositoryId
): Promise<number> {
  const BACKEND_API = process.env.REACT_APP_BACKEND_API;
  try {
    const endpoint = `${BACKEND_API}/dataset/triplet-count?repository=${repository}`;
    const response = await axios.get(endpoint);
    const totalTriplets = parseInt(response.data);
    return totalTriplets;
  } catch (error) {}
  return 0;
}

export async function getTypes(repository: RepositoryId): Promise<URI[]> {
  const BACKEND_API = process.env.REACT_APP_BACKEND_API;
  try {
    const endpoint = `${BACKEND_API}/dataset/types?repository=${repository}`;
    const response = await axios.get(endpoint);
    const classes = response.data;
    return classes;
  } catch (error) {}
  return [];
}

export async function getTypeProperties(
  repository: RepositoryId,
  type: URI
): Promise<URI[]> {
  const BACKEND_API = process.env.REACT_APP_BACKEND_API;
  try {
    const endpoint = `${BACKEND_API}/dataset/type-properties?repository=${repository}&type=${encodeURIComponent(
      type
    )}`;
    const response = await axios.get(endpoint, {});
    const properties = response.data;
    return properties;
  } catch (error) {}
  return [];
}

export async function getMetaInformation(
  repository: RepositoryId,
  uri: URI
): Promise<Metadata> {
  const BACKEND_API = process.env.REACT_APP_BACKEND_API;
  try {
    const endpoint = `${BACKEND_API}/dataset/meta-information?repository=${repository}&uri=${encodeURIComponent(
      uri
    )}`;
    const response = await axios.get(endpoint, {});
    const properties = response.data;
    return properties;
  } catch (error) {}

  return { comment: "", label: "", range: "", domain: "" };
}

export async function getOutgoingLinks(
  repository: RepositoryId,
  uri: URI
): Promise<{ [key: URI]: number }> {
  const BACKEND_API = process.env.REACT_APP_BACKEND_API;
  try {
    const endpoint = `${BACKEND_API}/dataset/outgoing-links?repository=${repository}&uri=${encodeURIComponent(
      uri
    )}`;
    const response = await axios.get(endpoint, {});
    const properties = response.data;
    return properties;
  } catch (error) {}

  return {};
}
