/**
 * Converts Firestore data or objects with custom classes/methods (.toJSON, Timestamps)
 * into plain serializable JavaScript objects safe to pass from Server Components to Client Components.
 */
export function serializeFirestoreData<T>(data: unknown): T {
  if (data === null || data === undefined) {
    return data as T;
  }

  return JSON.parse(
    JSON.stringify(data, (_key, value) => {
      if (
        value &&
        typeof value === "object" &&
        (typeof value.toDate === "function" ||
          (typeof value.seconds === "number" && typeof value.nanoseconds === "number"))
      ) {
        if (typeof value.toDate === "function") {
          return value.toDate().toISOString();
        }
        return new Date(value.seconds * 1000).toISOString();
      }
      return value;
    })
  ) as T;
}
