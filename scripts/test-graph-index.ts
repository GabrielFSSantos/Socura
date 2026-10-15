import assert from "node:assert/strict";
import {
  addGraphUserToIndex,
  createGraphUserIndex,
  isGraphUserInIndex,
} from "../src/platform/graph-index";
import { GraphUser } from "../src/platform/types";

const user = (id: string, username: string): GraphUser => ({
  id,
  username,
  displayName: username,
  profilePicUrl: "",
  isPrivate: false,
  isVerified: false,
});

const index = createGraphUserIndex();
addGraphUserToIndex(index, user("42", "Alice"));
assert.equal(isGraphUserInIndex(index, user("42", "alice")), true);
assert.equal(isGraphUserInIndex(index, user("99", "Alice")), true);
assert.equal(isGraphUserInIndex(index, user("99", "bob")), false);

console.log("test-graph-index: OK");
