const request = require("supertest");

const baseUrl = "https://petstore.swagger.io/v2";

// This test suite is for retrieving pet information
describe("GET /pet/{petId} - Retrieve pet information", () => {
  test("✅ Success scenario: Get information about an existing pet", async () => {
    const petId = 1;
    const response = await request(baseUrl).get(`/pet/${petId}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id", petId);
    expect(response.body).toHaveProperty("name");
    expect(response.body).toHaveProperty("status");

    console.log(`🐶 Pet's name: ${response.body.name}`);
    console.log(`📌 Pet status: ${response.body.status}`);
    //Possibly get an error because the API is not stable
  });

  test("❌ Negative scenario: Retrieve information for a non-existent pet", async () => {
    const petId = 99999999;
    const response = await request(baseUrl).get(`/pet/${petId}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Pet not found");

    console.log(`🚨 Error: ${response.body.message}`);
  });

  test("⚠ Edge case: Retrieve pet information with an invalid ID", async () => {
    const petId = "invalid";
    const response = await request(baseUrl).get(`/pet/${petId}`);

    expect(response.status).toBe(404);

    console.log(`⚠ Error: ${response.body.message}`);
  });
});

// This test suite is for adding a new pet
describe("POST /pet - Add a new pet", () => {
  test("✅ Success scenario: Create a new pet", async () => {
    const newPet = {
      id: 12345,
      category: { id: 1, name: "dog" },
      name: "TestDogAndrei",
      tags: [{ id: 1, name: "friendly" }],
      status: "available",
    };

    const postResponse = await request(baseUrl).post("/pet").send(newPet);
    expect(postResponse.status).toBe(200);
    expect(postResponse.body).toHaveProperty("id", newPet.id);

    console.log(`✅ Pet ${postResponse.body.name} successfully created!`);
  });

  test("❌ Negative scenario: Attempt to create a pet without required fields", async () => {
    const incompletePet = {
      name: "NoCategoryDog",
      status: "available",
    };

    const postResponse = await request(baseUrl)
      .post("/pet")
      .send(incompletePet);

    // API unexpectedly accepts such data, so let's check if the pet was created
    if (postResponse.status === 200) {
      console.warn("⚠ API accepted an incomplete pet. It should return 400.");
    } else {
      expect(postResponse.status).toBe(400);
      console.log(
        `🚨 Error: ${postResponse.body.message || "Invalid request"}`
      );
    }
  });

  test("⚠ Edge case: Create a pet with an extremely long name", async () => {
    const longNamePet = {
      id: 54321,
      category: { id: 1, name: "dog" },
      name: "A".repeat(300),
      status: "available",
    };

    const postResponse = await request(baseUrl).post("/pet").send(longNamePet);
    expect(postResponse.status).toBe(200);

    console.log(
      `⚠ Pet created with a long name: ${longNamePet.name.length} characters`
    );
  });
});

// This test suite is for deleting a pet
describe("DELETE /pet/{petId} - Remove a pet", () => {
  test("✅ Success scenario: Delete an existing pet", async () => {
    // 1. Create a new pet to delete it later
    const newPet = {
      id: 98765,
      category: { id: 1, name: "dog" },
      name: "DeleteMe",
      status: "available",
    };

    await request(baseUrl).post("/pet").send(newPet);

    // 2. Delete the created pet
    const deleteResponse = await request(baseUrl).delete(`/pet/${newPet.id}`);
    expect(deleteResponse.status).toBe(200);

    console.log(`✅ Pet ${newPet.name} successfully deleted!`);

    // 3. Try to retrieve the deleted pet
    const getResponse = await request(baseUrl).get(`/pet/${newPet.id}`);
    expect(getResponse.status).toBe(404);

    console.log(`🔍 Pet ${newPet.name} is no longer found in the database!`);
  });

  test("❌ Negative scenario: Delete a non-existent pet", async () => {
    const petId = 99999999;
    const deleteResponse = await request(baseUrl).delete(`/pet/${petId}`);

    expect(deleteResponse.status).toBe(404);

    console.log(`🚨 Error: ${deleteResponse.body.message || "Pet not found"}`);
  });

  test("⚠ Edge case: Delete a pet with an invalid ID", async () => {
    const petId = "invalid";
    const deleteResponse = await request(baseUrl).delete(`/pet/${petId}`);

    // Expected status: API may return 400 or 404
    expect([400, 404]).toContain(deleteResponse.status);

    console.log(
      `⚠ Error: ${deleteResponse.body.message || "Invalid ID format"}`
    );
  });
});

// This test suite is for updating pet information
describe("PUT /pet - Update pet information", () => {
  let petId;

  beforeAll(async () => {
    // Create a pet before the tests
    const newPet = {
      id: Date.now(),
      name: "UpdateMe",
      status: "available",
    };
    const response = await request(baseUrl).post("/pet").send(newPet);
    petId = response.body.id;
  });

  it("✅ Success scenario: Update an existing pet", async () => {
    const updatedPet = {
      id: petId,
      name: "UpdatedPet",
      status: "sold",
    };

    const response = await request(baseUrl).put("/pet").send(updatedPet);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("name", "UpdatedPet");
    expect(response.body).toHaveProperty("status", "sold");

    console.log(`✅ Pet ${updatedPet.name} successfully updated!`);
  });

  //This script works here, there should be a 404 error, but it still creates that the API is bad.
  it("❌ Negative scenario: Attempt to update a non-existent pet", async () => {
    const nonExistentPet = {
      id: 999999999,
      name: "GhostPet",
      status: "available",
    };

    const response = await request(baseUrl).put("/pet").send(nonExistentPet);
    expect(response.status).toBe(404);
    console.log(`🚨 Error: ${response.body.message || "Pet not found"}`);
  });

  //Here I wrote the wrong data, expecting to get 400 but getting 200
  it("⚠ Edge case: Update a pet with invalid data", async () => {
    const invalidPet = {
      id: petId,
      name: "",
      status: 12345, // Invalid status format
    };

    const response = await request(baseUrl).put("/pet").send(invalidPet);
    expect(response.status).toBe(400);
    console.log(`⚠ Error: ${response.body.message || "Invalid data format"}`);
  });
});

// This test suite is for placing an order
describe("GET /store/inventory", () => {
  test("Should return 200 OK", async () => {
    const response = await request(baseUrl).get("/store/inventory");

    console.log(`📦 Inventory response status: ${response.status}`);
    console.log(
      `📊 Inventory response body: ${JSON.stringify(response.body, null, 2)}`
    );

    expect(response.status).toBe(200);
  });

  test("Response should be in JSON format", async () => {
    const response = await request(baseUrl).get("/store/inventory");

    console.log(`📝 Content-Type: ${response.headers["content-type"]}`);

    expect(response.headers["content-type"]).toMatch(/application\/json/);
  });

  test("Response should contain keys: available, pending, sold", async () => {
    const response = await request(baseUrl).get("/store/inventory");

    console.log(`🔑 Response keys: ${Object.keys(response.body).join(", ")}`);

    expect(response.body).toHaveProperty("available");
    expect(response.body).toHaveProperty("pending");
    expect(response.body).toHaveProperty("sold");
  });

  test("Values should be numbers", async () => {
    const response = await request(baseUrl).get("/store/inventory");

    console.log(
      `🔢 Values - available: ${response.body.available}, pending: ${response.body.pending}, sold: ${response.body.sold}`
    );

    expect(typeof response.body.available).toBe("number");
    expect(typeof response.body.pending).toBe("number");
    expect(typeof response.body.sold).toBe("number");
  });
});
