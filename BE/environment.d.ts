// This file is somewhat optional, it can be used to provide type for env variables.
// This is important for when the validateEnvs function ensures that a variable will
// always be present but IDEs can't infer this and set the variable to type string | undefined
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: string;
      PORT?: number;
      DB_URI: string;
      DB_NAME: string;
      JWT_SECRET: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export { };
