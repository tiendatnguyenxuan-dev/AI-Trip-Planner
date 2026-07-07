# Plan: Test Exception Handling Upgrade

This plan outlines the testing strategy for the newly refactored Backend Exception Handling and ErrorResponse.

## User Review Required

> [!IMPORTANT]
> The `/plan` command requires a **Socratic Gate**. Before writing any code, we need to clarify your exact expectations for "testing". Testing can mean writing automated unit tests in code, or manually hitting the live API endpoints to verify the JSON responses.

## Open Questions

> [!WARNING]
> Please clarify your testing intent by answering these 3 strategic questions:
> 1. **Testing Method**: Do you want to write **Automated Tests** (JUnit + MockMvc) to keep in the codebase permanently, or do you just want to do **Manual API Testing** (e.g., using `curl`/Postman) right now to see the actual JSON response on the running server?
> 2. **Scope**: If writing automated tests, do you want to test just the `GlobalExceptionHandler` in isolation (Unit Test) or test the full request flow through the Controller (Integration Test)?
> 3. **Structure**: If writing automated tests, should we create a brand new dedicated test class (e.g., `GlobalExceptionHandlerTest`), or should we add the error-checking assertions to the existing UseCase test classes?

## Proposed Changes (Pending Clarification)

### Phase 1: Automated Unit Testing (If selected)
- **Target**: `src/test/java/com/example/tripplanner/interfaces/exception/GlobalExceptionHandlerTest.java` (New File)
- **Frameworks**: JUnit 5, Mockito, Spring MockMvc
- **Test Cases**:
  - Test `DuplicateEmailException` returns HTTP 400 with `errorCode = BAD_REQUEST` and correct `traceId` structure.
  - Test `TripNotFoundException` returns HTTP 404 with `errorCode = NOT_FOUND`.
  - Test `MethodArgumentNotValidException` maps correctly to `List<ValidationError>`.
  - Test generic `RuntimeException` correctly falls back to HTTP 500 `INTERNAL_SERVER_ERROR`.

### Phase 2: Manual End-to-End API Test (If selected)
- Create a `.http` or shell script with `curl` commands.
- **Scenario 1**: Register with an already existing email -> Expect HTTP 400 + Clean JSON ErrorResponse.
- **Scenario 2**: Request an invalid/non-existent Trip ID -> Expect HTTP 404 + Clean JSON ErrorResponse.
- **Scenario 3**: Send a payload missing required fields -> Expect HTTP 422 (UNPROCESSABLE_ENTITY) + `violations` array.

## Verification Plan
- Depending on the answers above, either run `mvn test` to verify the automated test suite, or execute the manual API requests against your currently running `mvn spring-boot:run` instance.
