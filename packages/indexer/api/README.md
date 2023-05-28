# indexer/api

Files to be consumed by API routes and getServerSideProps

These files may include Prisma and other server secrets, and should not be used
in React code (except `getServerSideProps`).

API routes should generally call a function in here for their logic, so that
function can be re-used in getServerSideProps()
