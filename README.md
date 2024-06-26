# `sugarstate`

`sugarstate` is a nice little state library for React that allows you to lift state up to a parent component, but not require the parent to re-render when the state changes. It's super simple to use and has no dependencies.

## Installation

```bash
yarn add sugarstate
```

## Usage

Imagine you have an `<EmailVerificationStatus />` component and you want to have a place to hold state as well as methods to update that state. You can use `sugarstate` to create a custom hook that provides this.

```tsx
import { useProvideControls, useControl } from "sugarstate";

export function useEmailControls() {
	const [control, setState] = useProvideControls({
		verified: false,
		isLoading: false,
	});

	return {
		...control,
		verify: async () => {
			setState(old => ({ ...old, isLoading: true }));

			const isVerified = await doSomeAsyncThing();

			setState(old => ({ verified: isVerified, isLoading: false }));
		},
	};
}

export type EmailControls = ReturnType<typeof useEmailControls>;
```

Then you can use this hook in your component like so:

```tsx
function Status({ control }: { control: EmailControls }) {
	// useControl allows you to read the state from the control
	// object, and will re-render when the state changes
	const { verified, isLoading } = useControl(control);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return <div>{verified ? "Email is verified" : "Email is not verified"}</div>;
}

// Now this parent won't ever re-render, even when the state changes
function Parent() {
	const emailControls = useEmailControls();

	return (
		<>
			<button type="button" onClick={emailControls.verify}>
				Verify
			</button>

			<Status control={emailControls} />
		</>
	);
}
```

## Selecting state for optimised renders

You can also use state selectors to only re-render when a specific part of the state changes. This is useful when you have a large state object and only want to re-render when a specific part of the state changes.

```tsx
function Status({ control }: { control: EmailControls }) {
	// This component will only re-render when the `verified` property changes
	const verified = useControl(control, state => state.verified);

	return <div>{verified ? "Email is verified" : "Email is not verified"}</div>;
}
```

Note that the value returned from the selector function CAN be computed, but it must be a primitive value (or an object reference) to work correctly. This is because `sugarstate` eventually calls `Object.is` to compare the previous and current values.

---

###### Note: I've used the word 'control' here to refer to the object returned from `useEmailControls`. This is because it contains both the state and the methods to update that state. You can call it whatever you like.
