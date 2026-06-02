export default () => ({
  database: {
    url: process.env.DATABASE_URL,
    logQueries: process.env.PRISMA_QUERY_LOG?.toLowerCase() === 'true',
  },
});
