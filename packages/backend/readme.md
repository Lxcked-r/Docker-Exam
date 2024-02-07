# backend

## Development

Install the dependencies: 
    
    ```bash
    npm install
    ```

Set up the environment variables:

    ```bash
    cp .env.example .env
    ```

Run the initial migrations:

    ```bash
    npx prisma migrate dev
    ```

Run the development server:

    ```bash
    npm run dev
    ```
