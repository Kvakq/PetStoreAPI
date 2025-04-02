# PetStoreAPI

This project is an API for managing pets, providing several endpoints for performing CRUD operations. It includes tests to verify the API's functionality using Jest.

## Functionality:

- **GET /pet/{petId}** — Retrieve pet information by ID.
- **POST /pet** — Add a new pet.
- **DELETE /pet/{petId}** — Delete a pet by ID.
- **PUT /pet** — Update pet information.
- **GET /store/inventory** — Get available store inventory.

## Tests:

The project uses Jest for API testing, with several test cases:

- Successful operations (create, delete, update pets).
- Error testing, such as missing required data or incorrect data formats.
- Handling incorrect identifiers and data types.

## Running the Project:

To run the tests, use the following command:

```bash
npx jest index.test.js
```

## Requirements:

**Node.js**

**Jest for testing**

## Notes:

**Some tests, like attempting to create a pet with invalid or incomplete data, are designed to ensure the API properly handles errors.**

**The project may include some non-standard errors and warnings, such as data format exceptions or API errors.**
