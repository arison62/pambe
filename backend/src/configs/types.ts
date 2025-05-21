export interface DatabaseConfigs {
  port: number;
  host: string;
  url: string;
}

export interface JwtConfigs {
  secret: string;
  expiresIn: string;
}
