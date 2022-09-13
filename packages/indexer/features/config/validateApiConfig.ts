/** Catch missing env variables on start. */
export const validateApiConfig = (name: string, env: Record<string, any>) => {
  Object.entries(env).forEach(([key, value]) => {
    if (value === "" || value === undefined || Number.isNaN(value)) {
      throw new Error(`missing ${name} env var ${key}`);
    }
  });
};
