export function corsOptions(allowedOrigins?: string) {
  return {
    origin: (allowedOrigins ?? 'http://localhost:4200,http://127.0.0.1:4200')
      .split(',')
      .map(origin => origin.trim())
      .filter(Boolean),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  };
}
