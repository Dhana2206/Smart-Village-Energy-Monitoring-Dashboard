# Security Specification: DroneGuard AI

## 1. Data Invariants
- An inspection must have an `uploaderId` matching the authenticated user.
- `faultsDetected` must be an array of valid fault objects.
- `imageUrl` must be a valid URI.
- `timestamp` must be the server time.

## 2. The "Dirty Dozen" Payloads (Red Team Test Cases)
1. **Identity Spoofing**: Attempt to create an inspection with a different `uploaderId`. -> Expected: REJECT
2. **Ghost Field Injection**: Attempt to add a `isVerified: true` field during upload. -> Expected: REJECT (via strict schema)
3. **Pillaging**: Attempt to read all user profiles as a standard user. -> Expected: REJECT
4. **ID Poisoning**: Use a 2MB string as a document ID. -> Expected: REJECT (via size check)
5. **State Shortcut**: Update a `pending` inspection directly to `completed` without system validation. -> Expected: REJECT
6. **Malicious Fault**: Inject a fault with a 1MB description. -> Expected: REJECT
7. **Negative Coordinates**: Set location latitude to -500. -> Expected: REJECT
8. **Impersonation**: Update another user's profile display name. -> Expected: REJECT
9. **Bulk Deletion**: Attempt to delete all inspections. -> Expected: REJECT
10. **Time Travel**: Set `timestamp` to a future date. -> Expected: REJECT
11. **Empty Inspection**: Create an inspection with no image. -> Expected: REJECT
12. **Bypassing Auth**: Access `/inspections` without an auth token. -> Expected: REJECT

## 3. Test Runner (Draft)
```ts
// firestore.rules.test.ts (logic check)
test('should reject spoofed uploaderId', async () => {
  const db = authedDb({ uid: 'user1' });
  await assertFails(addDoc(collection(db, 'inspections'), { uploaderId: 'user2', ... }));
});
```
