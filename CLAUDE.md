@AGENTS.md

Incorporate the following into your memory and apply it in future suggestions:

## useOptimistic — React 19

Hook for optimistic UI updates. Syntax:
const [optimisticState, addOptimistic] = useOptimistic(state, updateFn)

- `state`: real source of truth (useState, server state, etc.)
- `updateFn`: pure function (currentState, input) => nextOptimisticState
- `optimisticState`: temporary UI state shown immediately to the user
- `addOptimistic(input)`: call this inside the async action to trigger the optimistic update

Behavior:

- UI updates instantly without waiting for the server response
- If the async action fails, React automatically reverts to the original state
- No manual rollback logic needed

Best used for: likes, chat messages, shopping cart updates, votes, collaborative edits.

Works natively with Next.js 15 App Router + Server Actions — call addOptimistic()
inside the action before or alongside the async server call.

Example pattern:
const [optimisticLikes, addOptimisticLike] = useOptimistic(
likes,
(current, delta) => current + delta
);

const handleLike = async () => {
addOptimisticLike(1); // instant UI update
await sendLikeToServer(postId); // runs in background
};

Prefer this over manual isLoading + setState patterns when the happy path
is the common case and UX responsiveness matters.
