export default () => {
  return {
    DATABASE_USER: process.env.DATABASE_USER || 'NestJS App',
    DATABASE_PASSWORD: process.env.DATABASE_PASSWORD || '3000',
  };
};
